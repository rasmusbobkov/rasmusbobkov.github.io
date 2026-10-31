/**
 * The client application: birth entry, chart computation, wheel + text
 * rendering, share/export/import, language switching. All user-facing
 * strings come from the message catalogue; nothing is hardcoded here.
 */
import { DEFAULT_LANG, t, fmt, type Lang, type MessageKey } from '../messages/catalogue';
import { SIGNS, type BodyId } from '../lib/astro-constants';
import { computeChart, type Chart } from '../lib/chart';
import { type BirthParts } from '../lib/birth-wheels';
import { parseDateEt, parseDatePartsEt, parseTimeEt, resolveInstant, type BirthInput, type BirthInstant } from '../lib/time';
import {
  MIN_BIRTH_YEAR, clampParts, dateWheelText, daysInMonth, isSettledItemPx,
  isValidBirthYear, maxBirthYear, monthName, SEED_BIRTH_ENTRY, timeWheelText, wheelKeyStep,
} from '../lib/birth-wheels';
import { searchPlaces, type Place } from '../lib/places';
import { fmtDegComma, fmtDeg, fmtDateEt, fmtTime } from '../lib/format';
import {
  loadStoredBirthData, saveStoredBirthData, clearStoredBirthData,
  toStored, toBirthInput, exportJson, importJson, type StoredBirthData,
} from '../lib/storage';
import { encodeShareFragment, decodeShareFragment, type Trio } from '../lib/share';
import { getEphemeris } from '../lib/ephemeris';
import { renderWheel, type Selection } from './wheel';
// the WASM asset is imported at build time; the browser resolves it from our own origin
import wasmUrl from '@swisseph/browser/dist/swisseph.wasm?url';

const LANG_KEY = 'firstmate-astro.lang';

let lang: Lang = DEFAULT_LANG;
let chart: Chart | null = null;
let birthInstant: BirthInstant | null = null;
let placeName = '';
let selected: Selection | null = null;

// ——— i18n plumbing ———
function fillStaticI18n(): void {
  for (const node of document.querySelectorAll<HTMLElement>('[data-i18n]')) {
    const key = node.dataset.i18n as MessageKey;
    node.textContent = t(lang, key);
  }
  for (const node of document.querySelectorAll<HTMLElement>('[data-i18n-placeholder]')) {
    const key = node.dataset.i18nPlaceholder as MessageKey;
    if (node instanceof HTMLInputElement) node.placeholder = t(lang, key);
  }
  const enNote = document.getElementById('lang-coming');
  if (enNote) enNote.hidden = lang !== 'en';
  document.documentElement.lang = lang;
}

function signName(num: number): string {
  return t(lang, ('sign.name.' + num) as MessageKey);
}

function bodyName(id: BodyId): string {
  const key = ('body.' + id) as MessageKey;
  return t(lang, key);
}

function participantName(id: string): string {
  if (id === 'asc') return t(lang, 'body.asc');
  if (id === 'mc') return t(lang, 'body.mc');
  return bodyName(id as BodyId);
}

let onBirthFormShow: (() => void) | null = null;

function setView(id: string, visible: boolean): void {
  const node = document.getElementById(id);
  if (node) node.hidden = !visible;
  if (id === 'birth-form' && visible) onBirthFormShow?.();
}

// ——— boot ———
async function boot(): Promise<void> {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === 'et' || saved === 'en') lang = saved;
  } catch { /* private mode */ }
  fillStaticI18n();

  document.getElementById('lang-et')?.addEventListener('click', () => setLang('et'));
  document.getElementById('lang-en')?.addEventListener('click', () => setLang('en'));

  wireBirthWheels();
  wireBirthForm();
  document.getElementById('glossary-toggle')?.addEventListener('click', () => {
    const panel = document.getElementById('glossary-panel');
    if (panel) panel.hidden = !panel.hidden;
  });

  // share fragment first: a read-only trio view, never stored
  const trio = decodeShareFragment(location.hash);
  if (trio) {
    shareTrio = trio;
    renderShareView(trio);
    return;
  }

  const stored = loadStoredBirthData();
  if (stored) {
    const input = toBirthInput(stored);
    placeName = stored.place.name;
    await showChartFromInput(input);
    return;
  }

  setView('birth-form', true);
}

function setLang(next: Lang): void {
  lang = next;
  try { localStorage.setItem(LANG_KEY, next); } catch { /* private mode */ }
  fillStaticI18n();
  refreshBirthWheels?.();
  if (shareTrio) renderShareRows(shareTrio);
  if (chart && birthInstant) {
    renderChartView(chart, birthInstant);
  }
}

// ——— birth form ———
let chosenPlace: Place | null = null;

/**
 * Birth entry wheels: three side by side for the date (day, month, year),
 * two for the time (hour, minute). Each is a real scroll list that snaps to
 * the item in the centre band; the wheels render into the same
 * dd.mm.yyyy / HH:MM text fields the form has always parsed — the two
 * representations stay in sync both ways. The submit path itself
 * (parseDateEt/parseTimeEt -> resolveInstant) is untouched, so DST-gap
 * rejection and the fall-back notice keep working.
 */
const WIRE_ITEM_PX = 44; // fallback; the real size is --wheel-item, read below at run time
const VISIBLE_PAD_ITEMS = 2; // two dimmed neighbours above and below
let refreshBirthWheels: (() => void) | null = null;
let writeBirthParts: ((parts: BirthParts, timeUnknown: boolean) => void) | null = null;

interface WheelCfg {
  id: string;
  part: keyof BirthParts;
  firstValue: number; // the smallest value the list can hold
  itemCount: () => number; // day wheels rebuild; others are static ranges
  /** the option's own short text (the full-meaning text goes on the
   * selected option only, so screen readers read the selection whole) */
  shortLabel: (value: number) => string;
}

function wireBirthWheels(): void {
  const dateEl = document.getElementById('birth-date') as HTMLInputElement | null;
  const timeEl = document.getElementById('birth-time') as HTMLInputElement | null;
  const unknownEl = document.getElementById('birth-unknown-time') as HTMLInputElement | null;
  const timeWheelsEl = document.getElementById('birth-time-wheels');
  if (!dateEl || !timeEl || !unknownEl) return;

  const cfgs: WheelCfg[] = [
    { id: 'birth-day', part: 'day', firstValue: 1, itemCount: () => daysInMonth(parts.year, parts.month), shortLabel: (v) => String(v).padStart(2, '0') },
    { id: 'birth-month', part: 'month', firstValue: 1, itemCount: () => 12, shortLabel: (v) => monthName(lang, v) },
    { id: 'birth-year', part: 'year', firstValue: MIN_BIRTH_YEAR, itemCount: () => maxBirthYear() - MIN_BIRTH_YEAR + 1, shortLabel: (v) => String(v) },
    { id: 'birth-hour', part: 'hour', firstValue: 0, itemCount: () => 24, shortLabel: (v) => String(v).padStart(2, '0') },
    { id: 'birth-minute', part: 'minute', firstValue: 0, itemCount: () => 60, shortLabel: (v) => String(v).padStart(2, '0') },
  ];
  const wheels = new Map<string, HTMLElement>();
  for (const cfg of cfgs) {
    const el = document.getElementById(cfg.id) as HTMLElement | null;
    if (!el) return;
    wheels.set(cfg.id, el);
  }

  // initial state from the server-rendered selection, falling back to the
  // documented example
  const readInitial = (cfg: WheelCfg, fallback: number): number => {
    const id = wheels.get(cfg.id)!.getAttribute('aria-activedescendant');
    const m = /-opt-(\d+)$/.exec(id ?? '');
    return m ? Math.max(0, Number(m[1])) : fallback;
  };
  let parts: BirthParts = {
    day: readInitial(cfgs[0], SEED_BIRTH_ENTRY.day),
    month: readInitial(cfgs[1], SEED_BIRTH_ENTRY.month),
    year: readInitial(cfgs[2], SEED_BIRTH_ENTRY.year),
    hour: readInitial(cfgs[3], SEED_BIRTH_ENTRY.hour),
    minute: readInitial(cfgs[4], SEED_BIRTH_ENTRY.minute),
  };

  const itemId = (cfg: WheelCfg, value: number): string => `${cfg.id}-opt-${value}`;
  const byId = (id: string): HTMLElement | null => document.getElementById(id);
  /** The real item size (--wheel-item; 40px on very narrow screens). */
  const itemPx = (): number => {
    const it = wheels.get('birth-day')!.querySelector('.wheel-item');
    const h = it ? it.getBoundingClientRect().height : 0;
    return h > 10 ? Math.round(h) : WIRE_ITEM_PX;
  };

  /** One per wheel: the id of its pending settled-scroll read timer, or
   * absent. A wheel with a pending read is mid-gesture — commit leaves its
   * paint to that read, which re-commits (and repaints) right after. */
  const pendingReads = new Map<string, number>();

  const cancelPendingRead = (cfg: WheelCfg): void => {
    const timer = pendingReads.get(cfg.id);
    if (timer) clearTimeout(timer);
    pendingReads.delete(cfg.id);
  };

  /** Re-render one wheel's option list (day follows the month length, the
   * year wheel follows the shared bound computed at run time). */
  const renderWheel = (cfg: WheelCfg): void => {
    const count = cfg.itemCount();
    const wheel = wheels.get(cfg.id)!;
    const frag = document.createDocumentFragment();
    for (let p = 0; p < VISIBLE_PAD_ITEMS; p += 1) {
      const pad = document.createElement('div');
      pad.className = 'wheel-pad';
      pad.setAttribute('aria-hidden', 'true');
      frag.appendChild(pad);
    }
    for (let i = 0; i < count; i += 1) {
      const value = cfg.firstValue + i;
      const item = document.createElement('div');
      item.className = 'wheel-item';
      item.id = itemId(cfg, value);
      item.setAttribute('role', 'option');
      item.textContent = cfg.shortLabel(value);
      frag.appendChild(item);
    }
    for (let p = 0; p < VISIBLE_PAD_ITEMS; p += 1) {
      const pad = document.createElement('div');
      pad.className = 'wheel-pad';
      pad.setAttribute('aria-hidden', 'true');
      frag.appendChild(pad);
    }
    wheel.replaceChildren(frag);
    // Replacing children resets scrollTop to 0; that fires a scroll event
    // which would read item 0 and drag the selection down with it. Keep
    // the position the (clamped) selection says, so the seed survives the
    // rebuild deterministically.
    const value = Math.min(Math.max(parts[cfg.part], cfg.firstValue), cfg.firstValue + count - 1);
    wheel.scrollTop = (value - cfg.firstValue) * itemPx();
  };

  /** Paint one wheel: selection flags, the whole-meaning text on the
   * selected option, and scroll so the selected item sits in the band. */
  const paintWheel = (cfg: WheelCfg, value: number): void => {
    const wheel = wheels.get(cfg.id)!;
    const valueEl = byId(itemId(cfg, value));
    if (!valueEl) return;
    for (const el of wheel.querySelectorAll('.wheel-item[aria-selected="true"]')) {
      el.removeAttribute('aria-selected');
      el.removeAttribute('aria-label');
    }
    valueEl.setAttribute('aria-selected', 'true');
    // the selected option reads with the whole meaning: the full date or
    // the full clock time, not the bare part
    const full = cfg.part === 'hour' || cfg.part === 'minute'
      ? timeWheelText(lang, parts)
      : dateWheelText(lang, parts);
    valueEl.setAttribute('aria-label', full);
    wheel.setAttribute('aria-activedescendant', valueEl.id);
    const item = itemPx();
    const target = (value - cfg.firstValue) * item;
    if (Math.abs(wheel.scrollTop - target) > item / 2) {
      // always instant: a smooth programmatic scroll would fire intermediate
      // scroll events that look like user selections and fight the target
      wheel.scrollTo({ top: target, behavior: 'auto' });
    }
  };

  /** Clamp everything to what month, year and the shared bound allow,
   * repaint the wheels and (optionally) the synced text fields. */
  const commit = ({ toText }: { toText: boolean }): void => {
    parts = clampParts(parts);
    if (!isValidBirthYear(parts.year)) parts.year = Math.min(Math.max(parts.year, MIN_BIRTH_YEAR), maxBirthYear());
    for (const cfg of cfgs) {
      const isPending = pendingReads.has(cfg.id);
      if (!isPending && cfg.itemCount() !== wheels.get(cfg.id)!.querySelectorAll('.wheel-item').length) renderWheel(cfg);
      const maxIndex = cfg.itemCount() - 1;
      const idx = Math.min(Math.max(parts[cfg.part] - cfg.firstValue, 0), maxIndex);
      parts[cfg.part] = cfg.firstValue + idx;
      if (!isPending) paintWheel(cfg, cfg.firstValue + idx);
    }
    if (toText) {
      dateEl.value = fmtDateEt(parts.year, parts.month, parts.day);
      if (!unknownEl.checked) timeEl.value = fmtTime(parts.hour, parts.minute) ?? '';
    }
  };

  for (const cfg of cfgs) {
    const wheel = wheels.get(cfg.id)!;
    // scroll -> selection: the item in the centre band is the value, read
    // only once scrolling settles — programmatic repositions (re-render,
    // seed) keep the position stable for the whole window, so a reset
    // scroll event can never drag the selection with it
    wheel.addEventListener('scroll', () => {
      const prev = pendingReads.get(cfg.id);
      if (prev) clearTimeout(prev);
      pendingReads.set(cfg.id, window.setTimeout(() => {
        pendingReads.delete(cfg.id);
        const item = itemPx();
        const idx = Math.round(wheel.scrollTop / item);
        const value = Math.min(Math.max(cfg.firstValue + idx, cfg.firstValue), cfg.firstValue + cfg.itemCount() - 1);
        parts[cfg.part] = value;
        commit({ toText: true });
      }, 140));
    });
    // mouse drag (touch keeps its native flick and momentum)
    wheel.addEventListener('pointerdown', (ev) => {
      if (ev.pointerType === 'touch') return;
      const startY = ev.clientY;
      const startScroll = wheel.scrollTop;
      const pointerId = ev.pointerId;
      let captured = false;
      try { wheel.setPointerCapture(pointerId); captured = true; } catch { /* synthetic events have no captured pointer */ }
      const onMove = (me: PointerEvent): void => { wheel.scrollTop = startScroll - (me.clientY - startY); };
      const onUp = (): void => {
        // release before the click fires: a click under active capture is
        // retargeted to the wheel and never reaches the option element
        if (captured) {
          try { wheel.releasePointerCapture(pointerId); } catch { /* pointer already gone */ }
        }
        wheel.removeEventListener('pointermove', onMove);
        wheel.removeEventListener('pointerup', onUp);
        wheel.removeEventListener('pointercancel', onUp);
      };
      wheel.addEventListener('pointermove', onMove);
      wheel.addEventListener('pointerup', onUp);
      wheel.addEventListener('pointercancel', onUp);
    });
    // keyboard: ArrowUp selects the item above (smaller), ArrowDown below,
    // Home is the first item, End the last; the list scrolls along
    wheel.addEventListener('keydown', (ev) => {
      const step = wheelKeyStep(ev.key, parts[cfg.part], cfg.firstValue, cfg.firstValue + cfg.itemCount() - 1);
      if (step === null) return;
      ev.preventDefault();
      cancelPendingRead(cfg);
      parts[cfg.part] = step;
      commit({ toText: true });
    });
    // clicking an item selects it
    wheel.addEventListener('click', (ev) => {
      const item = (ev.target as HTMLElement).closest('.wheel-item');
      if (!(item instanceof HTMLElement)) return;
      const value = Number(/-opt-(\d+)$/.exec(item.id)?.[1]);
      if (!Number.isFinite(value)) return;
      cancelPendingRead(cfg);
      parts[cfg.part] = value;
      commit({ toText: true });
    });
  }

  // The text fallback types into the same state: a value the existing
  // parser accepts moves the wheels; while typing stays open-ended the
  // wheels wait. Submit keeps parsing the text field, so nothing here can
  // slip around resolveInstant's calendar or DST validation.
  dateEl.addEventListener('input', () => {
    const parsed = parseDateEt(dateEl.value);
    if (parsed) {
      for (const cfg of cfgs.slice(0, 3)) cancelPendingRead(cfg);
      parts = { ...parts, ...parsed };
      commit({ toText: false });
    }
  });
  dateEl.addEventListener('change', () => {
    if (parseDateEt(dateEl.value)) {
      for (const cfg of cfgs.slice(0, 3)) cancelPendingRead(cfg);
      commit({ toText: true });
    }
  });
  const onTimeText = () => {
    const parsed = parseTimeEt(timeEl.value);
    if (parsed) {
      for (const cfg of cfgs.slice(3)) cancelPendingRead(cfg);
      parts = { ...parts, ...parsed };
      commit({ toText: false });
    }
  };
  timeEl.addEventListener('input', onTimeText);
  timeEl.addEventListener('change', () => {
    if (parseTimeEt(timeEl.value)) {
      for (const cfg of cfgs.slice(3)) cancelPendingRead(cfg);
      commit({ toText: true });
    }
  });

  // "I don't know my birth time" hides the time wheels with the text
  // field; houses and the Rising sign stay unavailable, nothing guessed.
  const applyUnknown = ({ toText }: { toText: boolean }): void => {
    if (timeWheelsEl) timeWheelsEl.hidden = unknownEl.checked;
    timeEl.disabled = unknownEl.checked;
    if (unknownEl.checked) {
      timeEl.value = '';
    } else {
      for (const cfg of cfgs.slice(3)) cancelPendingRead(cfg);
      commit({ toText });
    }
  };
  unknownEl.addEventListener('change', () => applyUnknown({ toText: true }));

  writeBirthParts = (next, timeUnknown) => {
    parts = next;
    unknownEl.checked = timeUnknown;
    if (timeWheelsEl) timeWheelsEl.hidden = timeUnknown;
    timeEl.disabled = timeUnknown;
    if (timeUnknown) timeEl.value = '';
    commit({ toText: false });
  };

  refreshBirthWheels = () => {
    // month names carry the language: rebuild that option list outright,
    // the commit below repaints selection and scroll
    renderWheel(cfgs[1]);
    commit({ toText: false });
  };

  commit({ toText: true });
  applyUnknown({ toText: false });

  // Styles can land after this module runs (dev bundling), which leaves the
  // initial centre scroll stuck at 0; re-paint once item geometry is real:
  // stable readings above the same 10 px floor itemPx uses, at whatever
  // size the viewport's grid gives them. With the birth form hidden every
  // item measures 0 forever (saved-data boot, share view), so the loop
  // stops there and re-arms on the shared setView show boundary.
  let settling = false;
  let lastMeasured = 0;
  const settle = (): void => {
    const item = wheels.get('birth-day')!.querySelector('.wheel-item');
    const height = item ? Math.round(item.getBoundingClientRect().height) : 0;
    if (height === 0) { settling = false; return; }
    if (isSettledItemPx(lastMeasured, height)) {
      settling = false;
      for (const timer of pendingReads.values()) clearTimeout(timer);
      pendingReads.clear();
      commit({ toText: false });
      return;
    }
    lastMeasured = height;
    requestAnimationFrame(settle);
  };
  const wakeSettle = (): void => {
    if (settling) return;
    settling = true;
    lastMeasured = 0;
    requestAnimationFrame(settle);
  };
  onBirthFormShow = wakeSettle;
  wakeSettle();
}


function wireBirthForm(): void {
  const dateEl = document.getElementById('birth-date') as HTMLInputElement | null;
  const timeEl = document.getElementById('birth-time') as HTMLInputElement | null;
  const placeEl = document.getElementById('birth-place') as HTMLInputElement | null;
  const unknownEl = document.getElementById('birth-unknown-time') as HTMLInputElement | null;
  const resultsEl = document.getElementById('place-results');
  const errorEl = document.getElementById('form-error');
  let searchSeq = 0;

  // the unknown-time checkbox, the wheels and the sync all live in wireBirthWheels

  placeEl?.addEventListener('input', async () => {
    chosenPlace = null;
    const q = placeEl.value;
    searchSeq += 1;
    const seq = searchSeq;
    if (!resultsEl || q.trim().length < 2) {
      if (resultsEl) {
        resultsEl.innerHTML = '';
        resultsEl.hidden = true;
      }
      return;
    }
    const results = await searchPlaces(q, { limit: 8 });
    if (!resultsEl || seq !== searchSeq) return;
    resultsEl.innerHTML = '';
    if (results.length === 0) {
      const li = document.createElement('li');
      li.textContent = t(lang, 'form.place.noResults');
      resultsEl.appendChild(li);
      resultsEl.hidden = false;
      return;
    }
    for (const p of results) {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = `${p.name} (${p.lat >= 0 ? p.lat.toFixed(1) : (-p.lat).toFixed(1) + 'S'}, ${p.tz})`;
      btn.addEventListener('click', () => {
        chosenPlace = p;
        placeName = p.name;
        placeEl.value = p.name;
        resultsEl.innerHTML = '';
        resultsEl.hidden = true;
      });
      li.appendChild(btn);
      resultsEl.appendChild(li);
    }
    resultsEl.hidden = false;
  });

  const form = document.getElementById('birth-form-el');
  form?.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    if (!dateEl || !timeEl || !unknownEl) return;
    if (errorEl) errorEl.textContent = '';

    const parsedDate = parseDateEt(dateEl.value);
    if (!parsedDate) {
      if (errorEl) {
        // a well-formed date whose year is outside the shared bound gets
        // its own message, not the generic format hint
        const shaped = parseDatePartsEt(dateEl.value);
        errorEl.textContent = t(lang, shaped ? 'form.error.yearRange' : 'form.error.date');
      }
      return;
    }
    let hour: number | null = null;
    let minute: number | null = null;
    if (!unknownEl.checked) {
      const parsedTime = parseTimeEt(timeEl.value);
      if (!parsedTime) {
        if (errorEl) errorEl.textContent = t(lang, 'form.error.time');
        return;
      }
      hour = parsedTime.hour;
      minute = parsedTime.minute;
    }
    if (!chosenPlace) {
      if (errorEl) errorEl.textContent = t(lang, 'form.error.place');
      return;
    }

    const input: BirthInput = {
      ...parsedDate,
      hour,
      minute,
      timeUnknown: unknownEl.checked,
      place: { lat: chosenPlace.lat, lon: chosenPlace.lon, tz: chosenPlace.tz },
    };
    await showChartFromInput(input);
  });
}

/** Put the failing input back into the form so the user can correct and resubmit. */
function restoreBirthForm(input: BirthInput & { placeName?: string }): void {
  const dateEl = document.getElementById('birth-date') as HTMLInputElement | null;
  const timeEl = document.getElementById('birth-time') as HTMLInputElement | null;
  const placeEl = document.getElementById('birth-place') as HTMLInputElement | null;
  const unknownEl = document.getElementById('birth-unknown-time') as HTMLInputElement | null;
  if (!dateEl || !timeEl || !placeEl || !unknownEl) return;
  chosenPlace = {
    name: input.placeName ?? placeName,
    lat: input.place.lat,
    lon: input.place.lon,
    tz: input.place.tz,
    population: 0,
  };
  placeEl.value = chosenPlace.name;
  // the wheels read the restored birth entry, unknown-time state included
  writeBirthParts?.(
    {
      day: input.day,
      month: input.month,
      year: input.year,
      hour: input.hour ?? SEED_BIRTH_ENTRY.hour,
      minute: input.minute ?? SEED_BIRTH_ENTRY.minute,
    },
    input.timeUnknown,
  );
  dateEl.value = fmtDateEt(input.year, input.month, input.day);
  unknownEl.checked = input.timeUnknown;
  timeEl.disabled = input.timeUnknown;
  timeEl.value = input.timeUnknown ? '' : (fmtTime(input.hour, input.minute) ?? '');
}

async function showChartFromInput(input: BirthInput): Promise<boolean> {
  const seq = ++chartSeq;
  setView('birth-form', false);
  document.getElementById('form-error')?.replaceChildren();
  const inst = resolveInstant(input);
  if (!inst) {
    setView('chart-view', false);
    setView('birth-form', true);
    restoreBirthForm(input);
    const errorEl = document.getElementById('form-error');
    if (errorEl) errorEl.textContent = t(lang, input.timeUnknown ? 'form.error.unknownDate' : 'form.error.unknownTime');
    return false;
  }
  setView('chart-view', true);
  const progress = document.getElementById('chart-progress');
  if (progress) progress.hidden = false;
  try {
    await getEphemeris(wasmUrl);
    if (seq !== chartSeq) return false;
    const computed = await computeChart(inst, wasmUrl);
    if (seq !== chartSeq) return false;
    chart = computed;
    birthInstant = inst;
    // persist locally
    const stored = toStored({ ...input, placeName });
    saveStoredBirthData(stored);
    renderChartView(computed, inst);
    return true;
  } catch (err) {
    if (seq !== chartSeq) return false;
    console.error(err);
    setView('chart-view', false);
    setView('birth-form', true);
    restoreBirthForm(input);
    const errorEl = document.getElementById('form-error');
    if (errorEl) errorEl.textContent = t(lang, 'form.error.compute');
    return false;
  } finally {
    if (seq === chartSeq && progress) progress.hidden = true;
  }
}

// ——— chart view ———
let chartSeq = 0;

function renderChartView(c: Chart, inst: BirthInstant): void {
  const headingEl = document.getElementById('chart-born');
  if (headingEl) {
    const dateTxt = fmtDateEt(inst.local.year, inst.local.month, inst.local.day);
    const timeTxt = inst.localTime ? `${String(inst.localTime.hour).padStart(2, '0')}:${String(inst.localTime.minute).padStart(2, '0')}` : null;
    headingEl.textContent = timeTxt
      ? fmt(lang, 'chart.bornOn', { date: dateTxt, time: timeTxt, place: placeName })
      : fmt(lang, 'chart.bornOnUnknownTime', { date: dateTxt, place: placeName });
  }

  const banner = document.getElementById('chart-unknown-time-banner');
  if (banner) {
    banner.hidden = !c.timeUnknown;
    banner.textContent = c.timeUnknown
      ? `${t(lang, 'chart.unknownTimeBanner')} ${t(lang, 'chart.moonUncertain')}`
      : '';
  }

  const timeNote = document.getElementById('chart-time-note');
  if (timeNote) timeNote.hidden = !inst.ambiguous;

  const svg = document.getElementById('chart-wheel-svg') as unknown as SVGSVGElement | null;
  if (svg) {
    renderWheel(svg, c, {
      participantName,
      aspectKind: (kind) => t(lang, ('aspect.' + kind) as MessageKey),
      houseItem: (n: number) => fmt(lang, 'house.item', { number: String(n) }),
    }, (sel) => {
      selected = sel;
      renderDetail(c);
    });
  }

  renderDetail(c);
  renderLists(c);
  wireDataActions(c);
}

function placementText(p: Chart['placements'][number]): string {
  let s = `${bodyName(p.body)} ${SIGNS[p.signNum - 1].glyph} ${fmtDeg(p.degreeInSign)} ${signName(p.signNum)}`;
  if (p.house) s += ` · ${fmt(lang, 'house.item', { number: String(p.house) })}`;
  if (p.retrograde) s += ` · ${t(lang, 'chart.retroNote')}`;
  return s;
}

function cuspText(h: NonNullable<Chart['houses']>[number]): string {
  return `${fmt(lang, 'house.item', { number: String(h.house) })} · ${fmt(lang, 'house.cusp', { degree: fmtDeg(h.cuspLongitude) })} · ${signName(h.signNum)}`;
}

function aspectText(a: Chart['aspects'][number]): string {
  const label = t(lang, ('aspect.' + a.kind) as MessageKey);
  return `${participantName(a.a)} ${label} ${participantName(a.b)} (${t(lang, 'aspect.orbColumn')} ${fmtDeg(a.orbDegrees)})`;
}

function renderLists(c: Chart): void {
  const planetsList = document.getElementById('list-planets');
  if (planetsList) {
    planetsList.replaceChildren(...c.placements.map((p) => {
      const li = document.createElement('li');
      li.textContent = placementText(p);
      return li;
    }));
  }
  const housesList = document.getElementById('list-houses');
  if (housesList) {
    housesList.replaceChildren(...(c.houses ?? []).map((h) => {
      const li = document.createElement('li');
      li.textContent = cuspText(h);
      return li;
    }));
    const section = document.getElementById('houses-block');
    if (section) section.hidden = (c.houses ?? []).length === 0;
  }
  const aspectsList = document.getElementById('list-aspects');
  if (aspectsList) {
    aspectsList.replaceChildren(...c.aspects.map((a) => {
      const li = document.createElement('li');
      li.textContent = aspectText(a);
      return li;
    }));
  }
}

function selectionAvailable(c: Chart, sel: Selection): boolean {
  if (sel.type === 'body') return c.placements.some((p) => p.body === sel.id);
  if (sel.type === 'house') return (c.houses ?? []).some((h) => h.house === sel.house);
  return sel.index >= 0 && sel.index < c.aspects.length;
}

function renderDetail(c: Chart): void {
  const panel = document.getElementById('detail-panel-body');
  const heading = document.getElementById('detail-panel-heading');
  if (!panel || !heading) return;
  if (selected && !selectionAvailable(c, selected)) selected = null;
  if (!selected) {
    heading.textContent = t(lang, 'chart.detailsHeading');
    panel.textContent = t(lang, 'chart.detailsEmpty');
    return;
  }
  if (selected.type === 'body') {
    const bodyId = selected.id;
    const p = c.placements.find((x) => x.body === bodyId);
    if (!p) return;
    heading.textContent = `${bodyName(p.body)} ${SIGNS[p.signNum - 1].glyph} ${fmtDeg(p.degreeInSign)}`;
    const lines: string[] = [];
    lines.push(`${signName(p.signNum)}, ${fmtDegComma(p.degreeInSign)}°`);
    if (p.house) lines.push(`${fmt(lang, 'house.item', { number: String(p.house) })} — ${t(lang, ('house.meaning.' + p.house) as MessageKey)}`);
    if (p.retrograde) lines.push(t(lang, 'chart.retroNote'));
    lines.push(t(lang, ('body.' + p.body + '.meaning') as MessageKey));
    panel.replaceChildren(...lines.map((line) => {
      const div = document.createElement('div');
      div.textContent = line;
      return div;
    }));
    return;
  }
  if (selected.type === 'house') {
    const houseNum = selected.house;
    const h = c.houses?.find((x) => x.house === houseNum);
    if (!h) return;
    heading.textContent = fmt(lang, 'house.item', { number: String(h.house) });
    const sub = document.createElement('div');
    sub.textContent = `${fmt(lang, 'house.cusp', { degree: fmtDeg(h.cuspLongitude) })} · ${signName(h.signNum)}`;
    const meaning = document.createElement('div');
    meaning.textContent = t(lang, ('house.meaning.' + h.house) as MessageKey);
    panel.replaceChildren(sub, meaning);
    return;
  }
  const aspectIdx = selected.index;
  const asp = c.aspects[aspectIdx];
  if (!asp) return;
  heading.textContent = `${participantName(asp.a)} ${participantName(asp.b)}`;
  const sub = document.createElement('div');
  sub.textContent = `${t(lang, ('aspect.' + asp.kind) as MessageKey)} · ${t(lang, 'aspect.orbColumn')} ${fmtDeg(asp.orbDegrees)}`;
  const meaning = document.createElement('div');
  meaning.textContent = t(lang, ('aspect.meaning.' + asp.kind) as MessageKey);
  panel.replaceChildren(sub, meaning);
}

// ——— share / export / import / reset ———
let dataActionsController: AbortController | null = null;

function wireDataActions(c: Chart): void {
  // rewiring on every render must not duplicate listeners
  dataActionsController?.abort();

  const controller = new AbortController();
  dataActionsController = controller;
  const signal = controller.signal;

  document.getElementById('share-copy')?.addEventListener('click', async () => {
    const frag = encodeShareFragment(c.placements, c.ascendant);
    if (!frag) return;
    const url = `${location.origin}${location.pathname}#${frag}`;
    try {
      await navigator.clipboard.writeText(url);
      const note = document.getElementById('share-note');
      if (note) note.textContent = t(lang, 'share.copied');
    } catch {
      // clipboard blocked; show the link so the user can copy manually
      const note = document.getElementById('share-note');
      if (note) note.textContent = url;
    }
  }, { signal });

  document.getElementById('export-json')?.addEventListener('click', () => {
    if (!birthInstant) return;
    const stored: StoredBirthData = toStored({
      year: birthInstant.local.year,
      month: birthInstant.local.month,
      day: birthInstant.local.day,
      hour: birthInstant.localTime?.hour ?? null,
      minute: birthInstant.localTime?.minute ?? null,
      timeUnknown: birthInstant.timeUnknown,
      place: birthInstant.place,
      placeName,
    });
    const blob = new Blob([exportJson(stored)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'firstmate-astro-andmed.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }, { signal });

  document.getElementById('import-json')?.addEventListener('click', () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/json,.json';
    fileInput.addEventListener('change', async () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      const text = await file.text().catch(() => null);
      const stored = text === null ? null : importJson(text);
      if (!stored) {
        const note = document.getElementById('import-note');
        if (note) note.textContent = t(lang, 'import.error');
        return;
      }
      const input = toBirthInput(stored);
      placeName = stored.place.name;
      const ok = await showChartFromInput(input);
      const note = document.getElementById('import-note');
      if (note) note.textContent = ok ? t(lang, 'import.success') : '';
    });
    fileInput.click();
  }, { signal });

  document.getElementById('reset-data')?.addEventListener('click', () => {
    if (!confirm(t(lang, 'reset.confirm'))) return;
    clearStoredBirthData();
    location.reload();
  }, { signal });
}

// ——— shared trio view ———
let shareTrio: Trio | null = null;

function renderShareRows(trio: Trio): void {
  const list = document.getElementById('shareview-list');
  if (!list) return;
  const rows: string[] = [];
  if (trio.sun) rows.push(`${t(lang, 'body.sun')} ${SIGNS[trio.sun.signNum - 1].glyph} ${signName(trio.sun.signNum)}, ${fmtDegComma(trio.sun.degree)}°`);
  if (trio.moon) rows.push(`${t(lang, 'body.moon')} ${SIGNS[trio.moon.signNum - 1].glyph} ${signName(trio.moon.signNum)}, ${fmtDegComma(trio.moon.degree)}°`);
  if (trio.rising) rows.push(`${t(lang, 'glossary.rising')} ${SIGNS[trio.rising.signNum - 1].glyph} ${signName(trio.rising.signNum)}, ${fmtDegComma(trio.rising.degree)}°`);
  list.replaceChildren(...rows.map((r) => {
    const li = document.createElement('li');
    li.textContent = r;
    return li;
  }));
}

function renderShareView(trio: Trio): void {
  setView('shareview', true);
  renderShareRows(trio);
  document.getElementById('shareview-cta')?.addEventListener('click', () => {
    history.replaceState(null, '', location.pathname);
    shareTrio = null;
    setView('shareview', false);
    setView('birth-form', true);
  });
}

boot().catch((e) => console.error(e));
