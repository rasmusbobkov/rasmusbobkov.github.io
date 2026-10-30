/**
 * The client application: birth entry, chart computation, wheel + text
 * rendering, share/export/import, language switching. All user-facing
 * strings come from the message catalogue; nothing is hardcoded here.
 */
import { DEFAULT_LANG, t, fmt, type Lang, type MessageKey } from '../messages/catalogue';
import { SIGNS, type BodyId } from '../lib/astro-constants';
import { computeChart, type Chart } from '../lib/chart';
import { parseDateEt, parseTimeEt, resolveInstant, type BirthInput, type BirthInstant } from '../lib/time';
import {
  clampParts, dateAriaText, daysInMonth, keyboardStep, monthName, timeAriaText,
  type BirthParts,
} from '../lib/birth-parts';
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

function setView(id: string, visible: boolean): void {
  const node = document.getElementById(id);
  if (node) node.hidden = !visible;
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

  wireBirthSliders();
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
  refreshBirthSliders?.();
  if (shareTrio) renderShareRows(shareTrio);
  if (chart && birthInstant) {
    renderChartView(chart, birthInstant);
  }
}

// ——— birth form ———
let chosenPlace: Place | null = null;

/**
 * Sliders are the primary birth entry: five range inputs (day, month, year,
 * hour, minute) that render into the same dd.mm.yyyy / HH:MM text fields the
 * form has always parsed — the two representations stay in sync both ways.
 * The submit path itself (parseDateEt/parseTimeEt -> resolveInstant) is
 * untouched, so DST-gap rejection and the fall-back notice keep working.
 */
let refreshBirthSliders: (() => void) | null = null;
let writeBirthParts: ((parts: BirthParts, timeUnknown: boolean) => void) | null = null;

function wireBirthSliders(): void {
  const dayEl = document.getElementById('birth-day') as HTMLInputElement | null;
  const monthEl = document.getElementById('birth-month') as HTMLInputElement | null;
  const yearEl = document.getElementById('birth-year') as HTMLInputElement | null;
  const hourEl = document.getElementById('birth-hour') as HTMLInputElement | null;
  const minuteEl = document.getElementById('birth-minute') as HTMLInputElement | null;
  const dayOut = document.getElementById('birth-day-out') as HTMLOutputElement | null;
  const monthOut = document.getElementById('birth-month-out') as HTMLOutputElement | null;
  const yearOut = document.getElementById('birth-year-out') as HTMLOutputElement | null;
  const hourOut = document.getElementById('birth-hour-out') as HTMLOutputElement | null;
  const minuteOut = document.getElementById('birth-minute-out') as HTMLOutputElement | null;
  const dateEl = document.getElementById('birth-date') as HTMLInputElement | null;
  const timeEl = document.getElementById('birth-time') as HTMLInputElement | null;
  const unknownEl = document.getElementById('birth-unknown-time') as HTMLInputElement | null;
  const timeSlidersEl = document.getElementById('birth-time-sliders');
  if (!dayEl || !monthEl || !yearEl || !hourEl || !minuteEl || !dateEl || !timeEl || !unknownEl) return;
  if (!dayOut || !monthOut || !yearOut || !hourOut || !minuteOut) return;

  const readParts = (): BirthParts => ({
    day: dayEl.valueAsNumber,
    month: monthEl.valueAsNumber,
    year: yearEl.valueAsNumber,
    hour: hourEl.valueAsNumber,
    minute: minuteEl.valueAsNumber,
  });

  const writeParts = (parts: BirthParts): void => {
    const clamped = clampParts(parts);
    dayEl.max = String(daysInMonth(clamped.year, clamped.month));
    dayEl.value = String(clamped.day);
    monthEl.value = String(clamped.month);
    yearEl.value = String(clamped.year);
    hourEl.value = String(clamped.hour);
    minuteEl.value = String(clamped.minute);
  };

  /** Paint the current slider state: readouts, aria-valuetext, day clamp
   * and (optionally) the synced text fields. */
  const syncFromParts = ({ toText }: { toText: boolean }): void => {
    const parts = clampParts(readParts());
    const dayMax = daysInMonth(parts.year, parts.month);
    if (Number(dayEl.max) !== dayMax) dayEl.max = String(dayMax);
    if (dayEl.valueAsNumber > dayMax) dayEl.value = String(dayMax);
    const current = readParts();
    dayOut.textContent = String(current.day);
    monthOut.textContent = monthName(lang, current.month);
    yearOut.textContent = String(current.year);
    hourOut.textContent = String(current.hour);
    minuteOut.textContent = String(current.minute);
    const dateTxt = dateAriaText(lang, current);
    for (const el of [dayEl, monthEl, yearEl]) el.ariaValueText = dateTxt;
    const timeTxt = timeAriaText(lang, current);
    for (const el of [hourEl, minuteEl]) el.ariaValueText = timeTxt;
    if (toText) {
      dateEl.value = fmtDateEt(current.year, current.month, current.day);
      if (!unknownEl.checked) timeEl.value = fmtTime(current.hour, current.minute) ?? '';
    }
  };

  for (const el of [dayEl, monthEl, yearEl, hourEl, minuteEl]) {
    el.addEventListener('input', () => syncFromParts({ toText: true }));
    el.addEventListener('keydown', (ev) => {
      const step = keyboardStep(ev.key, el.valueAsNumber, Number(el.min) || 0, Number(el.max));
      if (step === null) return;
      ev.preventDefault();
      el.value = String(step);
      syncFromParts({ toText: true });
    });
  }

  // The text fallback types into the same state: a value the existing
  // parser accepts moves the sliders; while typing stays open-ended the
  // sliders wait. Submit keeps parsing the text field, so nothing here can
  // slip around resolveInstant's calendar or DST validation.
  dateEl.addEventListener('input', () => {
    const parsed = parseDateEt(dateEl.value);
    if (parsed) {
      writeParts({ ...readParts(), ...parsed });
      // repaint readouts and aria immediately, but leave the field the
      // user is typing in alone
      syncFromParts({ toText: false });
    }
  });
  dateEl.addEventListener('change', () => {
    if (parseDateEt(dateEl.value)) syncFromParts({ toText: true });
  });
  const onTimeText = () => {
    const parsed = parseTimeEt(timeEl.value);
    if (parsed) {
      writeParts({ ...readParts(), ...parsed });
      syncFromParts({ toText: false });
    }
  };
  timeEl.addEventListener('input', onTimeText);
  timeEl.addEventListener('change', () => {
    if (parseTimeEt(timeEl.value)) syncFromParts({ toText: true });
  });

  // "I don't know my birth time" hides the time sliders with the text
  // field; houses and the Rising sign stay unavailable, nothing guessed.
  const applyUnknown = ({ toText }: { toText: boolean }): void => {
    if (timeSlidersEl) timeSlidersEl.hidden = unknownEl.checked;
    timeEl.disabled = unknownEl.checked;
    if (unknownEl.checked) {
      timeEl.value = '';
      for (const el of [hourEl, minuteEl]) {
        el.disabled = true;
        el.ariaValueText = null;
      }
    } else {
      for (const el of [hourEl, minuteEl]) el.disabled = false;
      syncFromParts({ toText });
    }
  };
  unknownEl.addEventListener('change', () => applyUnknown({ toText: true }));

  writeBirthParts = (parts, timeUnknown) => {
    writeParts(parts);
    unknownEl.checked = timeUnknown;
    applyUnknown({ toText: false });
  };

  refreshBirthSliders = () => syncFromParts({ toText: false });
  syncFromParts({ toText: true });
  applyUnknown({ toText: false });
}


function wireBirthForm(): void {
  const dateEl = document.getElementById('birth-date') as HTMLInputElement | null;
  const timeEl = document.getElementById('birth-time') as HTMLInputElement | null;
  const placeEl = document.getElementById('birth-place') as HTMLInputElement | null;
  const unknownEl = document.getElementById('birth-unknown-time') as HTMLInputElement | null;
  const resultsEl = document.getElementById('place-results');
  const errorEl = document.getElementById('form-error');
  let searchSeq = 0;

  // the unknown-time checkbox, the sliders and the sync all live in wireBirthSliders

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
      if (errorEl) errorEl.textContent = t(lang, 'form.error.date');
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
  // the sliders slide to the restored birth entry, unknown-time state included
  writeBirthParts?.(
    {
      day: input.day,
      month: input.month,
      year: input.year,
      hour: input.hour ?? 12,
      minute: input.minute ?? 0,
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
