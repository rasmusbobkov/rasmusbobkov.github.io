/**
 * The single message catalogue. Estonian is the source language; English is
 * structure only for now and marked as coming. No component may hardcode
 * user-facing copy — every string lives here.
 *
 * Vocabulary decisions from the concept board:
 * - sünnikaart (not "horoskoop", which is reserved for sun-sign content)
 * - tõusumärk in the UI; "asendents" appears once, in the glossary
 * - ruut (not "kvadraat"), vastasseis (not "opositsioon"), "trigoon" stays
 * - houses always with a numeral: "11. maja"
 * - local formats: 14.03.1991, 24-hour clock, decimal comma (12,4°)
 * - address form: sina throughout
 */

export type Lang = 'et' | 'en';

export const DEFAULT_LANG: Lang = 'et';

const et = {
  // App identity
  'app.name': 'Firstmate Astro',
  'app.comingSoon': 'Inglise tõlge on tulemas. Seni räägib Firstmate Astro sinuga eesti keeles.',

  // Birth form
  'form.heading': 'Sinu sünnikaart',
  'form.lede': 'Kaart arvutatakse sinu seadmes. Sünnikuupäev, -aeg ja -koht ei välju brauserist.',
  'form.date': 'Sünnikuupäev',
  'form.date.placeholder': '14.03.1991',
  'form.time': 'Sünniaeg',
  'form.time.placeholder': '14:30',
  'form.time.hint': '24-tunnine aeg. Mida täpsem aeg, seda täpsem on kuu ja tõusumärk.',
  'form.place': 'Sünnikoht',
  'form.place.placeholder': 'nt Tallinn',
  'form.place.hint': 'Ajavöönd tuleneb kohast, ka ajaloolistes piirides.',
  'form.place.noResults': 'Seda kohta ei leitud. Proovi lähimas suuremas asulas.',
  'form.place.resultsLabel': 'Vali nimekirjast',
  'form.unknownTime': 'Ma ei tea oma sünniaega',
  'form.unknownTime.note': 'Kuupäev ja koht piisavad planeetide ja märkide jaoks. Maju ja tõusumärki ei arvutata ega pakuta.',
  'form.submit': 'Arvuta sünnikaart',
  'form.error.date': 'Kirjuta kuupäev niimoodi: 14.03.1991.',
  'form.error.time': 'Kirjuta aeg 24-tunnise kella järgi: 14:30.',
  'form.error.place': 'Vali sünnikoht nimekirjast.',
  'form.error.unknownDate': 'Sellist kuupäeva ei ole.',
  'form.error.unknownTime': 'Sellist kellaaega ei ole.',

  // Chart view
  'chart.heading': 'Sinu sünnikaart',
  'chart.bornOn': 'Sündinud {date} kell {time}, {place}',
  'chart.bornOnUnknownTime': 'Sündinud {date}, {place}',
  'chart.wheel.aria': 'Sünnikaart: kaksteist sektorit märkide järgi, planeedid ringil, jooned aspektide vahel.',
  'chart.wheel.tapHint': 'Piikita planeete, maju ja aspektijoone, et lugeda nende selgitusi.',
  'chart.detailsHeading': 'Detailid',
  'chart.detailsEmpty': 'Vali kaardil planeet, maja või joon — selgitus ilmub siia.',
  'chart.listHeading': 'Kaart loeteluna',
  'chart.listNote': 'Ekraanilugeja ei saa kaardi pildilt lugeda, seepärast on sama info siin loeteluna.',
  'chart.planetsHeading': 'Planeedid',
  'chart.housesHeading': 'Majad',
  'chart.aspectsHeading': 'Aspektid',
  'chart.unknownTimeBanner': 'Sünniaeg on teadmata. Maju ja tõusumärki ei arvutata ega hiljem pakuta.',
  'chart.moonUncertain': 'Kuu märk võib olla teistsugune, sest sünniaeg on teadmata.',
  'chart.retroNote': 'Planeet liigub retrograadselt.',
  'chart.noTime': 'aeg teadmata',

  // Share / export / reset
  'share.heading': 'Jaga kolme peamist',
  'share.lede': 'Link sisaldab ainult päikese-, kuu- ja tõusumärgi asukohta. Sünniaega ega -kohta see ei sisalda.',
  'share.copy': 'Kopeeri link',
  'share.copied': 'Link kopeeritud',
  'export.heading': 'Võta oma andmed kaasa',
  'export.lede': 'Sünniandmed ja kaart JSON-failis.',
  'export.button': 'Laadi alla JSON',
  'import.heading': 'Laadi andmed tagasi',
  'import.button': 'Vali JSON-fail',
  'import.success': 'Andmed laaditud.',
  'import.error': 'Faili ei õnnestunud lugeda.',
  'reset.button': 'Kustuta sünniandmed',
  'reset.confirm': 'Kustutame siit seadmest sünniandmed. Jätka?',

  // Shared-read view
  'shareview.heading': 'Jagatud kolm peamist',
  'shareview.lede': 'Keegi on jaganud oma kolme peamist märki. Sinu enda sünnikaart ei sõltu sellest.',
  'shareview.cta': 'Tee oma sünnikaart',

  // Aspects
  'aspect.conjunction': 'konjunktsioon',
  'aspect.sextile': 'sekstiil',
  'aspect.square': 'ruut',
  'aspect.trine': 'trigoon',
  'aspect.opposition': 'vastasseis',
  'aspect.orbColumn': 'orbiit',
  'aspect.meaning.conjunction': 'Kaks mõjutust ühes kohas: nad töötavad koos.',
  'aspect.meaning.sextile': 'Avatud võimalus: vajab prodamist, et tekkis.',
  'aspect.meaning.square': 'Pinge: tõmbab tähelepanu ja nõuab rohkem õppimist.',
  'aspect.meaning.trine': 'Sujuvus: tugevad asjad liiguvad iseenesest.',
  'aspect.meaning.opposition': 'Tasakaal kahe poole vahel: jääkidele jääb vaatlus.',

  // Bodies
  'body.sun': 'Päike',
  'body.moon': 'Kuu',
  'body.mercury': 'Merkuur',
  'body.venus': 'Veenus',
  'body.mars': 'Marss',
  'body.jupiter': 'Jupiter',
  'body.saturn': 'Saturn',
  'body.uranus': 'Uraan',
  'body.neptune': 'Neptuun',
  'body.pluto': 'Pluuto',
  'body.meanNode': 'Kuu sõlm',
  'body.asc': 'Tõusumärk',
  'body.mc': 'MC',
  'body.sun.meaning': 'Elu põhisuund.',
  'body.moon.meaning': 'Sisemised vajadused.',
  'body.mercury.meaning': 'Kuidas mõtled ja räägid.',
  'body.venus.meaning': 'Armastus ja ilu.',
  'body.mars.meaning': 'Pürgimus ja kaitsevõime.',
  'body.jupiter.meaning': 'Kasv ja laienemine.',
  'body.saturn.meaning': 'Vastutus ja piirid.',
  'body.uranus.meaning': 'Vabadus ja uuenemine.',
  'body.neptune.meaning': 'Unistused ja siseelamus.',
  'body.pluto.meaning': 'Sügavus ja muutused.',
  'body.meanNode.meaning': 'Elu kasvu suund.',

  // Houses
  'house.item': '{number}. maja',
  'house.cusp': 'tipp {degree}',
  'house.cuspUnknown': 'tipp teadmata',
  'house.meaning.1': 'Sina ise: välimus ja algused.',
  'house.meaning.2': 'Raha ja väärtused.',
  'house.meaning.3': 'Igapäevane side: kõne, kirjad, lähedased.',
  'house.meaning.4': 'Kodu ja juured.',
  'house.meaning.5': 'Looming: lapsed, mäng, rõõmud.',
  'house.meaning.6': 'Töö ja keha igapäevaselt.',
  'house.meaning.7': 'Partnerid ja lepped.',
  'house.meaning.8': 'Sügavatõmmis: jagamine ja muutused.',
  'house.meaning.9': 'Parem mõte: õppimine, reisid, risti loengud.',
  'house.meaning.10': 'Avalik elu: roll ja vastutus.',
  'house.meaning.11': 'Sõbrad ja eesmärgid.',
  'house.meaning.12': 'Vaikus ja taastumine.',

  // Places
  'place.searchLabel': 'Sünnikoht',
  'place.timezoneNote': 'Ajaloolised ajavööndi nihe on kohas asuva andmetabeli põhjal.',

  // Language switch
  'lang.label': 'Keel',
  'lang.et': 'Eesti',
  'lang.en': 'Inglise',

  // Glossary
  'glossary.heading': 'Sõnastik',
  'glossary.lede': 'Sõnad, mida kaart kasutab.',
  'glossary.birthChart': 'sünnikaart',
  'glossary.birthChart.desc': 'Taevas olukord sinu sünnihetkel.',
  'glossary.rising': 'tõusumärk',
  'glossary.rising.desc': 'Märk, mis oli sünnihetkel tõusmas. Vajab sünniaega ja -kohta.',
  'glossary.sunSign': 'päikesemärk',
  'glossary.sunSign.desc': 'Märk, kus päike sünnihetkel oli.',
  'glossary.moonSign': 'kuumärk',
  'glossary.moonSign.desc': 'Märk, kus kuu sünnihetkel oli.',
  'glossary.house': 'maja',
  'glossary.house.desc': 'Elu valdkonna nr, kaardil numbriga: 11. maja.',
  'glossary.aspect': 'aspekt',
  'glossary.aspect.desc': 'Nurk kahe planeedi vahel: võib sujuv olla või pingeline.',
  'glossary.conjunction': 'konjunktsioon',
  'glossary.conjunction.desc': 'Mõjutused koos: nurk 0 kraadi.',
  'glossary.sextile': 'sekstiil',
  'glossary.sextile.desc': 'Nurk 60 kraadi: avatud võimalus, mis vajab ärksust.',
  'glossary.square': 'ruut',
  'glossary.square.desc': 'Pingenv nurk: 90 kraadi.',
  'glossary.trine': 'trigoon',
  'glossary.trine.desc': 'Sujuv nurk: 120 kraadi.',
  'glossary.opposition': 'vastasseis',
  'glossary.opposition.desc': 'Nurk 180 kraadi: mõjutused vastamisi.',
  'glossary.asc': 'asendents',
  'glossary.asc.desc': 'Tõusumärgi teaduslikum nimi.',
  'glossary.orb': 'orbiit',
  'glossary.orb.desc': 'Kui palju aspekt võib täisnurgast kõrvale olla ja siiski kehtida. Kasutame: konjunktsioon ±10°, vastasseis ±10°, ruut ±8°, trigoon ±8°, sekstiil ±6°.',
  'glossary.retrograde': 'retrograadne',
  'glossary.retrograde.desc': 'Planeet näib taevases vaates liiguvat tagasi.',
  'glossary.meanNode': 'Kuu sõlm',
  'glossary.meanNode.desc': 'Kuu keskmine sõlm (mean node).',
} as const;

export type MessageKey = keyof typeof et;

/** English is structure only; missing keys fall back to Estonian and the
 * language switch shows the "coming soon" notice. */
const en: Partial<Record<MessageKey, string>> = {
  'app.name': 'Firstmate Astro',
  'chart.planetsHeading': 'Planets',
  'chart.housesHeading': 'Houses',
  'chart.aspectsHeading': 'Aspects',
};

export function t(lang: Lang, key: MessageKey): string {
  if (lang === 'en' && en[key]) return en[key] as string;
  return et[key];
}

export function fmt(lang: Lang, key: MessageKey, vars: Record<string, string>): string {
  return t(lang, key).replace(/\{(\w+)\}/g, (_found, k: string) => vars[k] ?? `{${k}}`);
}
