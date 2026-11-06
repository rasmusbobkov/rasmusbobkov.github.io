/**
 * The client application: birth entry, chart computation, wheel + text
 * rendering, share/export/import, language switching. Interface strings come
 * from the message catalogue and the day's copy from its meaning unit;
 * nothing is hardcoded here.
 */
import { DEFAULT_LANG, t, fmt, type Lang, type MessageKey } from '../messages/catalogue';
import { SIGNS, MAX_FOCUS_AREAS, FOCUS_AREAS, type BodyId, type FocusArea } from '../lib/astro-constants';
import { computeChart, norm360, type Chart } from '../lib/chart';
import { currentTransitReading, nearestMiss, natalAspectTargets, type AspectInput, type TransitPosition } from '../lib/transits';
import {
  selectDayReading, hitMissesFocus, type DayReading,
} from '../lib/meaning';
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
  loadStoredFocus, saveStoredFocus, clearStoredFocus,
} from '../lib/storage';
import { encodeShareFragment, decodeShareFragment, type Trio } from '../lib/share';
import { getEphemeris } from '../lib/ephemeris';
import { counterSink, emit, setSink } from '../lib/events';
import { renderWheel, type Selection } from './wheel';
// the WASM asset is imported at build time; the browser resolves it from our own origin
import wasmUrl from '@swisseph/browser/dist/swisseph.wasm?url';

const LANG_KEY = 'firstmate-astro.lang';

let lang: Lang = DEFAULT_LANG;
let chart: Chart | null = null;
let birthInstant: BirthInstant | null = null;
let placeName = '';
let selected: Selection | null = null;

// ——— daily story state ———
let focusAreas: FocusArea[] = [];
let tier: 'story' | 'plain' = 'plain';
let dayReading: DayReading | null = null;
let dayKey = '';
let dayTime = '';
/** kept for the quiet-day "why" panel: the exact sky and targets that were read */
let lastTransitPositions: TransitPosition[] = [];
let lastNatalTargets: AspectInput[] = [];
let chartRendered = false;
let storySeq = 0;
/** the story surface currently shows the recompute failure note */
let storyFailed = false;
/** the story has been opened once this page load: one event per visit */
let storyOpenedSent = false;

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
  setSink(counterSink());
  emit('visit');
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === 'et' || saved === 'en') lang = saved;
  } catch { /* private mode */ }
  fillStaticI18n();

  document.getElementById('lang-et')?.addEventListener('click', () => setLang('et'));
  document.getElementById('lang-en')?.addEventListener('click', () => setLang('en'));

  wireBirthWheels();
  wireBirthForm();
  wireFocusSetup();
  wireStoryControls();
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
  if (dayReading) {
    renderStory();
    renderWhyPanel();
  } else if (storyFailed) {
    renderStoryFailure();
  } else {
    paintStoryHead();
  }
  paintWhyToggle();
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
    const ok = await showChartFromInput(input);
    if (ok) emit('birthDataGiven');
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
    setView('story-view', false);
    setView('birth-form', true);
    restoreBirthForm(input);
    const errorEl = document.getElementById('form-error');
    if (errorEl) errorEl.textContent = t(lang, input.timeUnknown ? 'form.error.unknownDate' : 'form.error.unknownTime');
    return false;
  }
  setView('story-view', true);
  const progress = document.getElementById('chart-progress');
  if (progress) progress.hidden = false;
  try {
    await getEphemeris(wasmUrl);
    if (seq !== chartSeq) return false;
    const computed = await computeChart(inst, wasmUrl);
    if (seq !== chartSeq) return false;
    chart = computed;
    birthInstant = inst;
    chartRendered = false;
    // persist locally
    const stored = toStored({ ...input, placeName });
    saveStoredBirthData(stored);
    await routeAfterChart();
    return true;
  } catch (err) {
    if (seq !== chartSeq) return false;
    console.error(err);
    setView('chart-view', false);
    setView('story-view', false);
    setView('birth-form', true);
    restoreBirthForm(input);
    const errorEl = document.getElementById('form-error');
    if (errorEl) errorEl.textContent = t(lang, 'form.error.compute');
    return false;
  } finally {
    if (seq === chartSeq && progress) progress.hidden = true;
  }
}

// ——— daily story: the landing surface ———

/** After a chart exists: the one-time focus setup, then the daily story. */
async function routeAfterChart(): Promise<void> {
  const focusData = loadStoredFocus();
  if (!focusData) {
    showFocusSetup();
    return;
  }
  focusAreas = focusData.skipped ? [] : [...focusData.areas];
  await enterStory();
}

/** The focus setup as it is shown: current selection pre-ticked, the other
 * story surfaces out of the way. Reopenable — the saved or skipped choice
 * is never permanent. */
function showFocusSetup(): void {
  for (const box of document.querySelectorAll<HTMLInputElement>('.focus-option')) {
    box.checked = focusAreas.includes(box.value as FocusArea);
  }
  setView('story-view', false);
  setView('chart-view', false);
  setView('focus-setup', true);
  document.getElementById('focus-setup')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function wireFocusSetup(): void {
  const noteEl = document.getElementById('focus-note');
  const clearNote = () => { if (noteEl) noteEl.textContent = ''; };
  for (const box of Array.from(document.querySelectorAll<HTMLInputElement>('.focus-option'))) {
    box.addEventListener('change', () => {
      const count = document.querySelectorAll<HTMLInputElement>('.focus-option:checked').length;
      if (count > MAX_FOCUS_AREAS) {
        box.checked = false;
        if (noteEl) noteEl.textContent = t(lang, 'focus.error');
      } else {
        clearNote();
      }
    });
  }
  document.getElementById('focus-save')?.addEventListener('click', () => {
    clearNote();
    const areas = Array.from(document.querySelectorAll<HTMLInputElement>('.focus-option:checked'))
      .map((b) => b.value)
      .filter((v): v is FocusArea => (FOCUS_AREAS as readonly string[]).includes(v));
    // never exceed the cap, whatever slipped past the change handler
    const capped = areas.slice(0, MAX_FOCUS_AREAS);
    saveStoredFocus({ schemaVersion: 1, areas: capped, skipped: false });
    focusAreas = capped;
    setView('focus-setup', false);
    void enterStory();
  });
  document.getElementById('focus-skip')?.addEventListener('click', () => {
    clearNote();
    saveStoredFocus({ schemaVersion: 1, areas: [], skipped: true });
    focusAreas = [];
    setView('focus-setup', false);
    void enterStory();
  });
  document.getElementById('focus-reopen')?.addEventListener('click', showFocusSetup);
}

function wireStoryControls(): void {
  document.getElementById('tier-story')?.addEventListener('click', () => {
    tier = 'story';
    paintTierSwitch();
    renderStory();
  });
  document.getElementById('tier-plain')?.addEventListener('click', () => {
    tier = 'plain';
    paintTierSwitch();
    renderStory();
  });
  document.getElementById('story-why')?.addEventListener('click', () => {
    const panel = document.getElementById('story-why-panel');
    if (!panel) return;
    const opening = panel.hidden;
    panel.hidden = !opening;
    if (opening) {
      renderWhyPanel();
      panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    paintWhyToggle();
  });
  document.getElementById('open-chart')?.addEventListener('click', () => {
    setView('chart-view', true);
    if (!chartRendered && chart && birthInstant) {
      renderChartView(chart, birthInstant);
      chartRendered = true;
    }
    document.getElementById('chart-view')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

function paintTierSwitch(): void {
  for (const id of ['tier-story', 'tier-plain']) {
    const btn = document.getElementById(id) as HTMLButtonElement | null;
    if (btn) btn.setAttribute('aria-pressed', String(btn.id === `tier-${tier}`));
  }
}

/** One control for both states: it asks the question while the sheet is
 * closed and offers the way back while it is open. */
function paintWhyToggle(): void {
  const btn = document.getElementById('story-why');
  const panel = document.getElementById('story-why-panel');
  if (!btn || !panel) return;
  btn.textContent = t(lang, panel.hidden ? 'story.why' : 'story.whyClose');
  btn.setAttribute('aria-expanded', String(!panel.hidden));
}

async function enterStory(): Promise<void> {
  if (!chart) return;
  const seq = ++storySeq;
  setView('story-view', true);
  paintTierSwitch();
  try {
    await getEphemeris(wasmUrl);
    if (seq !== storySeq || !chart) return;
    const reading = await currentTransitReading(new Date(), chart, wasmUrl);
    if (seq !== storySeq) return;
    dayReading = selectDayReading(reading.hits, focusAreas);
    dayKey = reading.dayKey;
    dayTime = reading.tallinnTime;
    lastTransitPositions = reading.positions;
    lastNatalTargets = natalAspectTargets(chart);
    storyFailed = false;
    renderStory();
    renderWhyPanel();
    if (!storyOpenedSent) {
      storyOpenedSent = true;
      emit('storyOpened');
    }
  } catch (err) {
    if (seq !== storySeq) return;
    console.error(err);
    // a failed recompute invalidates the previous reading: nothing stale
    // may remain reachable from the "Miks see?" panel or a language switch
    dayReading = null;
    lastTransitPositions = [];
    lastNatalTargets = [];
    storyFailed = true;
    const panel = document.getElementById('story-why-panel');
    if (panel) {
      panel.hidden = true;
      panel.replaceChildren();
    }
    renderStoryFailure();
  }
}

/** One failure surface, re-derived at render time so a language switch
 * after a failed recompute re-localizes it: the heading follows the active
 * tier and the failure note replaces any story content. */
function renderStoryFailure(): void {
  dayKey = '';
  dayTime = '';
  paintStoryHead();
  const dateEl = document.getElementById('story-date-text');
  if (dateEl) dateEl.textContent = '';
  const asofEl = document.getElementById('story-asof');
  if (asofEl) asofEl.textContent = '';
  const c = document.getElementById('story-content');
  if (c) {
    c.replaceChildren();
    const p = document.createElement('p');
    p.className = 'note';
    p.textContent = t(lang, 'story.error');
    c.appendChild(p);
  }
  const panel = document.getElementById('story-why-panel');
  if (panel && !panel.hidden) renderWhyPanel();
  paintWhyToggle();
}

function storyParagraphsFrom(unit: NonNullable<DayReading['unit']>): HTMLParagraphElement[] {
  const ps: HTMLParagraphElement[] = [];
  const push = (text: string, cls?: string) => {
    const p = document.createElement('p');
    if (cls) p.className = cls;
    p.textContent = text;
    ps.push(p);
    return p;
  };
  push(unit.story.situation);
  push(unit.story.turn);
  push(unit.story.climax);
  push(unit.story.meaning, 'story-final');
  return ps;
}

function dayBlock(labelKey: MessageKey, text: string): HTMLDivElement {
  const block = document.createElement('div');
  block.className = 'day-block';
  const label = document.createElement('h4');
  label.className = 'day-label';
  label.textContent = t(lang, labelKey);
  block.appendChild(label);
  const p = document.createElement('p');
  p.className = 'day-text';
  p.textContent = text;
  block.appendChild(p);
  return block;
}

/** The day's one action gets the mock's emphasis box, kicker inside it. */
function actionBlock(text: string): HTMLDivElement {
  const act = document.createElement('div');
  act.className = 'day-act';
  const label = document.createElement('h4');
  label.className = 'day-label';
  label.textContent = t(lang, 'story.plain.action');
  act.appendChild(label);
  const p = document.createElement('p');
  p.textContent = text;
  act.appendChild(p);
  return act;
}

/** Heading, tier and the honest focus line share one render path so a
 * language switch or a tier toggle cannot leave stale text behind. */
function paintStoryHead(): void {
  const titleEl = document.getElementById('story-title');
  if (titleEl) titleEl.textContent = t(lang, tier === 'story' ? 'story.tierStory' : 'story.heading');
  const noteEl = document.getElementById('story-focus-note');
  if (!noteEl) return;
  const misses = dayReading !== null && !dayReading.quiet && hitMissesFocus(dayReading.hit, focusAreas);
  noteEl.hidden = !misses;
  noteEl.textContent = misses ? t(lang, 'story.focus.none') : '';
}

function renderStory(): void {
  paintStoryHead();

  const c = document.getElementById('story-content');
  if (!c || !dayReading) return;

  const dateEl = document.getElementById('story-date-text');
  if (dateEl && dayKey) {
    const [y, m, d] = dayKey.split('-').map(Number);
    dateEl.textContent = fmtDateEt(y!, m!, d!);
  }
  const asofEl = document.getElementById('story-asof');
  if (asofEl) asofEl.textContent = dayTime ? fmt(lang, 'story.asOf', { time: dayTime }) : '';

  c.replaceChildren();

  if (dayReading.quiet) {
    const tag = document.createElement('p');
    tag.className = 'quiet-tag';
    tag.textContent = t(lang, 'story.quiet.tag');
    c.appendChild(tag);
    const explain = document.createElement('p');
    explain.textContent = t(lang, 'story.quiet.explain');
    c.appendChild(explain);
    if (tier === 'story') {
      const copy = document.createElement('div');
      copy.className = 'story-copy';
      copy.style.marginTop = '14px';
      for (const p of storyParagraphsFrom(dayReading.unit)) copy.appendChild(p);
      c.appendChild(copy);
    } else {
      const action = actionBlock(dayReading.unit.action);
      action.classList.add('quiet-action');
      c.appendChild(action);
    }
    return;
  }

  if (!dayReading.unit) {
    // a transit is in orb, but its shape has no story yet: say that and
    // nothing more — the reveal panel below names the actual transit
    const tag = document.createElement('p');
    tag.className = 'quiet-tag';
    tag.textContent = t(lang, 'story.untold.tag');
    c.appendChild(tag);
    const explain = document.createElement('p');
    explain.textContent = t(lang, 'story.untold.explain');
    c.appendChild(explain);
    return;
  }

  if (tier === 'story') {
    const copy = document.createElement('div');
    copy.className = 'story-copy';
    for (const p of storyParagraphsFrom(dayReading.unit)) copy.appendChild(p);
    c.appendChild(copy);
    return;
  }

  // plain: the same unit, astro-free — open / tight / action / pitfall.
  // The reveal is the only surface that names the sky behind it.
  const copy = document.createElement('div');
  copy.className = 'day-copy';
  copy.appendChild(dayBlock('story.plain.open', dayReading.unit.open));
  copy.appendChild(dayBlock('story.plain.tight', dayReading.unit.tight));
  copy.appendChild(actionBlock(dayReading.unit.action));
  copy.appendChild(dayBlock('story.plain.pitfall', dayReading.unit.pitfall));
  c.appendChild(copy);
}

const SVG_NS = 'http://www.w3.org/2000/svg';

/** Schematic of the real hit: the transiting body on the outer ring in
 * gold, the natal point it touches in sage, joined across the circle. The
 * two angles are the bodies' longitudes, the same convention as the wheel. */
function whyDial(hit: NonNullable<DayReading['hit']>): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg') as SVGSVGElement;
  svg.setAttribute('viewBox', '0 0 150 150');
  svg.setAttribute('class', 'why-dial');
  svg.setAttribute('aria-hidden', 'true');

  const circle = (cx: number, cy: number, r: number, cls: string): SVGCircleElement => {
    const node = document.createElementNS(SVG_NS, 'circle') as SVGCircleElement;
    node.setAttribute('cx', String(cx));
    node.setAttribute('cy', String(cy));
    node.setAttribute('r', String(r));
    node.setAttribute('class', cls);
    svg.appendChild(node);
    return node;
  };
  const at = (longitude: number): readonly [number, number] => {
    const rad = ((norm360(longitude) - 90) * Math.PI) / 180;
    return [75 + 66 * Math.cos(rad), 75 + 66 * Math.sin(rad)];
  };

  circle(75, 75, 66, 'why-dial-ring');
  circle(75, 75, 44, 'why-dial-ring why-dial-ring-inner');
  const [tx, ty] = at(hit.transitLongitude);
  const [nx, ny] = at(hit.targetLongitude);
  const line = document.createElementNS(SVG_NS, 'line');
  line.setAttribute('x1', String(tx));
  line.setAttribute('y1', String(ty));
  line.setAttribute('x2', String(nx));
  line.setAttribute('y2', String(ny));
  line.setAttribute('class', 'why-dial-line');
  svg.appendChild(line);
  circle(tx, ty, 6.5, 'why-dial-node why-dial-transit');
  circle(nx, ny, 6.5, 'why-dial-node why-dial-natal');
  circle(75, 75, 3, 'why-dial-center');
  return svg;
}

/** The natal house the transit lands in, when the birth time is known. */
function targetHouse(target: string): number | null {
  if (!chart || !ASPECT_PARTICIPANT_BODIES.has(target)) return null;
  return chart.placements.find((p) => p.body === (target as BodyId))?.house ?? null;
}

/** The reveal sheet: the one surface that names the real transit, its
 * aspect and orb, the natal house it lands in, plus the unit's
 * plain-language note. */
function renderWhyPanel(): void {
  const panel = document.getElementById('story-why-panel');
  if (!panel) return;
  panel.replaceChildren();

  if (!dayReading) {
    const p = document.createElement('p');
    p.className = 'note';
    p.textContent = t(lang, 'story.error');
    panel.appendChild(p);
    return;
  }

  const eyebrow = document.createElement('p');
  eyebrow.className = 'day-date';
  eyebrow.textContent = t(lang, 'story.why');
  panel.appendChild(eyebrow);

  if (!dayReading.hit) {
    const h = document.createElement('h3');
    h.className = 'day-title';
    h.textContent = t(lang, 'story.quiet.tag');
    panel.appendChild(h);
    const explain = document.createElement('p');
    explain.className = 'why-note';
    explain.textContent = t(lang, 'story.quiet.explain');
    panel.appendChild(explain);
    const miss = nearestMiss(lastTransitPositions, lastNatalTargets);
    if (miss) {
      const pair = `${participantName(miss.transitBody)} ${t(lang, ('aspect.' + miss.aspect) as MessageKey)} ${participantName(miss.target)}`;
      const line = document.createElement('p');
      line.className = 'why-meta';
      line.textContent = fmt(lang, 'story.quiet.nearest', { pair, degrees: fmtDeg(miss.overBy) });
      panel.appendChild(line);
      const note = document.createElement('p');
      note.className = 'why-plain';
      note.textContent = t(lang, 'story.why.quiet');
      panel.appendChild(note);
    }
    return;
  }

  const hit = dayReading.hit;
  const h = document.createElement('h3');
  h.className = 'day-title';
  h.textContent = `${participantName(hit.transitBody)} ${t(lang, ('aspect.' + hit.aspect) as MessageKey)} ${participantName(hit.target)}`;
  panel.appendChild(h);

  panel.appendChild(whyDial(hit));

  const meta = document.createElement('p');
  meta.className = 'why-meta';
  meta.textContent = [
    transitPlacementText(hit.transitBody, hit.transitLongitude),
    natalTargetText(hit.target, hit.targetLongitude, chart),
    `${t(lang, 'story.why.orb')} ${fmtDeg(hit.orbDegrees)}`,
  ].join(' · ');
  panel.appendChild(meta);

  const note = document.createElement('p');
  note.className = 'why-note';
  note.textContent = dayReading.unit ? dayReading.unit.astroNote : t(lang, 'story.untold.note');
  panel.appendChild(note);

  if (!dayReading.unit) return;

  const block = document.createElement('div');
  block.className = 'why-block';
  const heading = document.createElement('h4');
  heading.className = 'day-label';
  heading.textContent = t(lang, 'story.whyHeading');
  block.appendChild(heading);
  const aspectLine = document.createElement('p');
  aspectLine.className = 'why-plain';
  aspectLine.textContent = t(lang, ('aspect.meaning.' + hit.aspect) as MessageKey);
  block.appendChild(aspectLine);
  const house = targetHouse(hit.target);
  if (house !== null) {
    const houseLine = document.createElement('p');
    houseLine.className = 'why-plain';
    houseLine.textContent = t(lang, ('house.meaning.' + house) as MessageKey);
    block.appendChild(houseLine);
  }
  panel.appendChild(block);
}

const ASPECT_PARTICIPANT_BODIES = new Set(['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'meanNode']);

/** "Marss, Kaksikud 12,4°" — the same wording the chart lists use. */
function transitPlacementText(body: import('../lib/astro-constants').BodyId, longitude: number): string {
  const sign = Math.floor(norm360(longitude) / 30) + 1;
  return `${participantName(body)}, ${signName(sign)} ${fmtDegComma(norm360(longitude) % 30)}°`;
}

/** The natal placement a transit touches, house included when known. */
function natalTargetText(target: string, longitude: number, c: Chart | null): string {
  const sign = Math.floor(norm360(longitude) / 30) + 1;
  let s = `${participantName(target)} ${signName(sign)} ${fmtDegComma(norm360(longitude) % 30)}°`;
  if (c && ASPECT_PARTICIPANT_BODIES.has(target)) {
    const p = c.placements.find((x) => x.body === (target as BodyId));
    if (p?.house) s += ` · ${fmt(lang, 'house.item', { number: String(p.house) })}`;
  }
  return s;
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
      if (ok) emit('birthDataGiven');
      const note = document.getElementById('import-note');
      if (note) note.textContent = ok ? t(lang, 'import.success') : '';
    });
    fileInput.click();
  }, { signal });

  document.getElementById('reset-data')?.addEventListener('click', () => {
    if (!confirm(t(lang, 'reset.confirm'))) return;
    clearStoredBirthData();
    clearStoredFocus();
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
