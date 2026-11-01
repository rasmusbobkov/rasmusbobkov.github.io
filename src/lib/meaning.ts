/**
 * The meaning layer: one typed unit per transit shape, the single source
 * from which both renderings derive. A unit is keyed by the transiting
 * body, the aspect and the life domains it speaks into — the archetype
 * space is this finite table plus the explicit target→domain map, never
 * free-form string building.
 *
 * One unit carries: what today is open for, what is tight, one concrete
 * action, where this tends to go wrong, the astrology behind it, and the
 * four-part story (situation, turn, climax, meaning) whose final paragraph
 * is the action. Tier 1 (plain) renders only the astro-free fields; the
 * "Miks see?" reveal names the real transit hit and carries the astroNote.
 * Tier 2 (story) renders only the four paragraphs. Because both read the
 * same unit, the tiers cannot drift apart.
 *
 * Content rules: no results are promised — not profit, not health, not
 * luck — only tendencies and choices. The story paragraphs contain no
 * planet, sign, house or aspect names, ever (tests enforce this). The
 * address form is sina throughout; Estonian only.
 */
import type { AspectKind, FocusArea } from './astro-constants';
import { FOCUS_AREAS } from './astro-constants';
import type { AspectParticipant, TransitBody, TransitHit } from './transits';
import { TRANSIT_BODIES } from './transits';

export interface MeaningUnit {
  readonly id: string;
  /** the transiting body this shape belongs to; 'any' = tone-generic */
  readonly transitBody: TransitBody | 'any';
  readonly aspect: AspectKind;
  /** life domains this unit speaks into; empty = not domain-bound */
  readonly focus: readonly FocusArea[];
  /** what today is open for (astro-free) */
  readonly open: string;
  /** what is tight (astro-free) */
  readonly tight: string;
  /** one concrete action, imperative (astro-free) */
  readonly action: string;
  /** where this tends to go wrong (astro-free) */
  readonly pitfall: string;
  /** the astrology behind it — a plain sentence about what the aspect does */
  readonly astroNote: string;
  readonly story: {
    readonly situation: string;
    readonly turn: string;
    readonly climax: string;
    /** closes with the action, never a separate content set */
    readonly meaning: string;
  };
}

export interface QuietUnit {
  readonly id: 'quiet';
  readonly transitBody: 'none';
  readonly aspect: 'none';
  readonly focus: readonly FocusArea[];
  readonly open: string;
  readonly tight: string;
  readonly action: string;
  readonly pitfall: string;
  readonly astroNote: string;
  readonly story: { situation: string; turn: string; climax: string; meaning: string };
}

export type DayUnit = MeaningUnit | QuietUnit;

/**
 * The day reads one of three ways, each saying something true about the
 * sky: a unit is present (the daily story), or the day's shape has no
 * story yet (unit null, the hit still named in the reveal panel), or the
 * sky is genuinely empty (the quiet unit, the only day that says so).
 */
export type DayReading =
  | { readonly unit: DayUnit; readonly hit: TransitHit; readonly quiet: false }
  | { readonly unit: null; readonly hit: TransitHit; readonly quiet: false }
  | { readonly unit: QuietUnit; readonly hit: null; readonly quiet: true };

/**
 * Which life domains each natal target speaks into: the explicit finite
 * map that decides where a transit lands in the person's life. Deliberate
 * simplifications, kept in one place: Venus is closeness and what is
 * valued; mc is public standing; the node is growth direction and the
 * people along it; Jupiter is opportunity and what grows.
 */
export const TARGET_FOCUS: Readonly<Record<AspectParticipant, readonly FocusArea[]>> = {
  sun: ['work'],
  moon: ['relationships', 'creative'],
  mercury: ['work', 'creative'],
  venus: ['relationships', 'money'],
  mars: ['work', 'creative'],
  jupiter: ['money', 'work'],
  saturn: ['work', 'money'],
  uranus: ['work', 'creative'],
  neptune: ['creative', 'relationships'],
  pluto: ['money', 'work'],
  meanNode: ['work', 'relationships'],
  asc: ['relationships', 'work'],
  mc: ['work'],
};

export const MEANING_UNITS: readonly MeaningUnit[] = [
  {
    id: 'saturn-square-work',
    transitBody: 'saturn',
    aspect: 'square',
    focus: ['work'],
    open: 'Täna on hea hetk midagi ammu alustatud lõpuni tuua: midagi vana, mis juba poolenisti olemas, mitte midagi uut.',
    tight: 'Uued algused kipuvad täna kinni jääma: uks, mida lükkad, sulgub vaikselt tagasi.',
    action: 'Võta üks poolenisti pooleli olev asi ja vii see täna lõpuni. Uue alustuse jäta homme.',
    pitfall: 'Tundub, et kõik on vastu ja vajab jõudu. Tegelikult vajab seekord järjekorda: üks asi korraga, mitte kõik koos.',
    astroNote: 'Ringi liikub Saturn ja teeb ruutu: aeg nõuab täna korda, mitte kiirust — ja mis on pooleli, ei jää meenutamata.',
    story: {
      situation: 'Päev algab raskemana: tavaline rutiin, mis harilikult liugleb, nõuab täna igast sammust eraldi hinda.',
      turn: 'Keset päeva tuleb nähtavaks, miks üks asi nädalaid edasi ei liigu: selle lõpus ootab midagi pooleli jäänut, mis iga uue katse uuesti ukse ette jääb.',
      climax: 'Õhtul on see üks pooleli koht nii selge, et teda pole enam kuidagi mööda vaadata — kõik muu on jäänud valjuks, tema jääb kindlaks.',
      meaning: 'Kui jõud ei aita, aitab järjekord. Võta üks poolenisti pooleli olev asi ja vii see täna lõpuni. Uue alustuse jäta homme.',
    },
  },
  {
    id: 'saturn-conjunction-work',
    transitBody: 'saturn',
    aspect: 'conjunction',
    focus: ['work'],
    open: 'Täna istub ühele õlale midagi raskemat: kohus, mida keegi muu kanda ei saa.',
    tight: 'Täna antud lubadus kasvab aja jooksul üle enda: iga sõna tuleb hiljem täies mahus täita.',
    action: 'Võta täna kirja oma kolm praegust vastutust ja ütle millestki ühest kellelegi välja, et see on praegu sinu — või las ta sinult ära.',
    pitfall: 'Võib sündida, et võtad omale kogu elu massi korraga; õhtuks jääb järele ainult jõuetus. Vali üks, mitte kõik.',
    astroNote: 'Ringi liikub Saturn ja käib just üle sinu kaardi: mis on jäänud vastutamata, meenutab ennast täna kindlalt. Vastutus on valik, mida tohib ka ära anda.',
    story: {
      situation: 'Päev algab igapäevasena, kuid kuskil nurgas seisab asi, mida pole ammu puudutatud ja mis päevade kaupa vaikselt kasvab.',
      turn: 'Keset päeva tuleb kelleltki küsimus, mis selle asja päevavalgele toob: selle varjamine maksab nüüd rohkem kui selle ütlemine.',
      climax: 'Õhtul oled sa juba ise hakanud selle üle järele mõtlema: kas ta jääb sulle või läheb kellegi teisele — ja see küsimus pole enam kuidagi kappi panna.',
      meaning: 'Tegelikult on vastutus valik, mitte pärand: kui ütled välja, mis on sinu, läheb päev kergemaks kui hirm, millega ta endale hoitakse. Võta täna kirja oma kolm praegust vastutust ja ütle millestki ühest kellelegi välja, et see on praegu sinu — või las ta sinult ära.',
    },
  },
  {
    id: 'saturn-opposition-relationships',
    transitBody: 'saturn',
    aspect: 'opposition',
    focus: ['relationships'],
    open: 'Täna on hea hetk sõnastada, mida suhtes ammu pole välja öeldud.',
    tight: 'Vahemaa on täna tunda: kiirendada lähedust, mis ise ei liigu, ei õnnestu.',
    action: 'Ütle täna ühele lähedasele välja, mida sa temalt konkreetselt ootad, ja kuula ära, mis ta vastab.',
    pitfall: 'Vahemaa võib tunduda lahkumisena ja selle eest on kergesti rünnatud. Tegelikult on see lihtsalt hetk, kus mõlemad inimesed vajavad endale ruumi.',
    astroNote: 'Ringi liikub Saturn ja teeb vastasseisu: nähtavaks saab, kus suhtes on jäänud midagi lausumata, ja aeg ei salli täna kiirustamist.',
    story: {
      situation: 'Päev läheb rahulikult, aga ühega lähedasest on jäänud vaikus, mis kestnud on juba päevade kaupa.',
      turn: 'Keset päeva kirjutad sa vastuse tema sõnumile ja jätad selle saatmata: lause jääb kuidagi kõvaks, ja sa jääd kahtlema.',
      climax: 'Õhtul saad aru, et vaikus polnud kellegi süü: seal vahel oli jäänud midagi, mida keegi pole julgenud välja öelda.',
      meaning: 'Kui sa selle ise välja ütled, lakkab ta kahe vahel kasvamast. Ütle täna ühele lähedasele välja, mida sa temalt konkreetselt ootad, ja kuula ära, mis ta vastab.',
    },
  },
  {
    id: 'jupiter-trine-work',
    transitBody: 'jupiter',
    aspect: 'trine',
    focus: ['work'],
    open: 'Täna on hea hetk küsida midagi suuremat, kui tavaliselt julged.',
    tight: 'Kõik tundub täna võimalik — ja just sellepärast on liiga paljude asjade korraga hoidmine ohtlik.',
    action: 'Küsi täna üks asi, mida sa ammu ei julge küsida, ja palu vastus kirjalikult.',
    pitfall: 'Kergus võetakse kergesti omaks liiga suure lubadusena, ja õhtuks pole ükski asi päriselt paigas pandud.',
    astroNote: 'Ringi liikub Jupiter ja teeb trigooni: see, mis muidu vajab palju veenmist, liigub täna sujuvalt — aeg toetab küsimusi, mida on ammu hoitud.',
    story: {
      situation: 'Päev algab tavalisest kergemana: asjad, mis muidu nõuavad pikka veenmist, liiguvad täna iseenesest.',
      turn: 'Keset päeva pakutakse sulle midagi suuremat, kui sa tavaliselt omale võtad.',
      climax: 'Õhtul on alles ainult see üks koht, kus sa ise pead ütlema, mis edasi saab — kõik muu on täna sujuvalt maha langenud.',
      meaning: 'Nii harva küsitakse, sest küsimuses peidus on juba otsus. Küsi täna üks asi, mida sa ammu ei julge küsida, ja palu vastus kirjalikult.',
    },
  },
  {
    id: 'jupiter-square-money',
    transitBody: 'jupiter',
    aspect: 'square',
    focus: ['money'],
    open: 'Täna on hea hetk raha asjades korraks panna: mis tuleb, mis läheb ja mis peab ootama.',
    tight: 'Suurtele kulutustele on täna kerge jah öelda — ja just täna on nende jaoks kõige kehvem hetk.',
    action: 'Enne kui täna midagi suuremat ostad või lubad, kirjuta numbrid paberile ja jäta otsus homme.',
    pitfall: 'Hea meel ei tähenda head numbrit: huvi kipub lubama rohkem, kui on kindlalt olemas.',
    astroNote: 'Ringi liikub Jupiter ja teeb ruutu: kõik kipub täna kasvama, ka kulud. Kasv on hea siis, kui ta on numbriga kinnitatud, mitte tundega.',
    story: {
      situation: 'Päev algab hea tujuga ja suurte mõtetega: kuidas muuta midagi väikest suuremaks.',
      turn: 'Keset päeva tekib ette üks suur kulutus, millel on hea põhjendus ja ühtegi numbrit enda kõrval.',
      climax: 'Õhtul, kui numbrid on paberile kirjutatud, jäävad põhjendused kõrvale ja jääb alles ainult arv.',
      meaning: 'Numbrid rahustavad päeva jooksul: kasv on hea siis, kui ta on olemas ka paberil, mitte ainult peas. Enne kui täna midagi suuremat ostad või lubad, kirjuta numbrid paberile ja jäta otsus homme.',
    },
  },
  {
    id: 'mars-square-work',
    transitBody: 'mars',
    aspect: 'square',
    focus: ['work'],
    open: 'Täna on hea päev selleks, et midagi käegakosutavat teha: tööd, mis sõltub ainult sinust.',
    tight: 'Arutlustes on täna kerge teravus: energia, mis muidu juhib tööd, kipub hoopis kellegi kallale.',
    action: 'Kui täna miski kihutab vastu, tee ise üks käeline tööots tükk ära, kuhu keegi teine praegu midagi öelda ei saa.',
    pitfall: 'Teine inimene kipub täna saama selleks, kellele üleliigne energia välja lasta — ja asjad ise jäävad seisma.',
    astroNote: 'Ringi liikub Marss ja teeb ruutu: jõud on täna külluses ja otsib väljapääsu — ja kui asjadele väljapääsu pole, kipub ta kellegi kallale.',
    story: {
      situation: 'Hommik on tavaline, kuid igal asjal on täna pool sammu rohkem takistust kui tavaliselt.',
      turn: 'Keset päeva puhkeb üks arutlus teravamini, kui oleks tarvis — ja just seal saad aru, et päeva jõud otsib valest kohast väljapääsu.',
      climax: 'Õhtul on käeline töö tehtud ja teravus on maas: energia leidis selle, kuhu ta kuulub.',
      meaning: 'Jõud ise pole halb, halb on ainult sihtkoht. Kui täna miski kihutab vastu, tee ise üks käeline tööots tükk ära, kuhu keegi teine praegu midagi öelda ei saa.',
    },
  },
  {
    id: 'mars-conjunction-creative',
    transitBody: 'mars',
    aspect: 'conjunction',
    focus: ['creative'],
    open: 'Midagi uut saab täna kergesti käima pandud: mõte, visand, esimene samm.',
    tight: 'Algus on täna nii kerge, et ta võib jääda ainult alguseks: kolm asja käima, ükski edasi.',
    action: 'Alusta täna seda asja, mida sa juba nädalapäevade kaupa lükkad, ja tee sellest esimene käegapuutuv samm.',
    pitfall: 'Võidakse arvata, et täna jaksab kõike — ja homme jäävad järele ainult katkestatud algused. Üks, mitte kõik.',
    astroNote: 'Ringi liikub Marss ja käib just üle sinu kaardi: saadaval on rohkesti jõudu esimesteks sammudeks, mitte nii palju lõpule viimiseks.',
    story: {
      situation: 'Hommikul on peas juba mitu kohta, kus midagi uut võiks alata.',
      turn: 'Keset päeva tõstab üks neist ennast üle teiste — ja enne õhtut on ta juba saanud midagi käegapuutuvat tehtud.',
      climax: 'Õhtul on käes üks algus, mis on täna jõudnud kaugele — ja teadmisega, et teised algused ootavad oma järjekorda.',
      meaning: 'Kerge algus on hüve ainult siis, kui ta on üks. Alusta täna seda asja, mida sa juba nädalapäevade kaupa lükkad, ja tee sellest esimene käegapuutuv samm.',
    },
  },
  {
    id: 'venus-sextile-relationships',
    transitBody: 'venus',
    aspect: 'sextile',
    focus: ['relationships'],
    open: 'Täna on avatud väike aken nende jaoks, kellega side on jahtunud: üks soe sõna jõuab kergesti kohale.',
    tight: 'Suurteks teemadeks pole täna hetk: väikese sõna kandevõime on seekord suurem kui suurel vestlusel.',
    action: 'Kirjuta täna ühele inimesele, kellega suhtes on vaikus, üks soe lause.',
    pitfall: 'Üks lause ei kanna terve mure raskust — väike aken on väikese jaoks.',
    astroNote: 'Ringi liikub Veenus ja teeb sekstiili: pisike avatus jõuab täna kergesti kohale, kui teda proovitakse.',
    story: {
      situation: 'Päev möödub rahulikult, kuid ühe inimesega on jäänud vaikus, mida pole ammu kinni pandud.',
      turn: 'Keset päeva tuleb meelde üks soe pisike mõte tema kohta — ja ta tahab välja.',
      climax: 'Õhtul on see soe lause juba ära saadetud — ja kuigi vastust pole veel, on pärast saatmist kuidagi kergem: side ei ole kadunud, vaid ootas ainult sõna.',
      meaning: 'Väikese sõna vaheaken ei ole suureks vestluseks, aga ta on piisav, et side ei jääks jahtuma. Kirjuta täna ühele inimesele, kellega suhtes on vaikus, üks soe lause.',
    },
  },
  {
    id: 'venus-opposition-relationships',
    transitBody: 'venus',
    aspect: 'opposition',
    focus: ['relationships'],
    open: 'Täna on hea hetk ütelda, mida suhtes ootad.',
    tight: 'Kaks vajadust tõmbavad täna vastassuundades: enda oma ja kellegi teise oma.',
    action: 'Ütle täna ühele lähedasele selgelt välja, mida sa praegu kõige rohkem vajad.',
    pitfall: 'Oma vajadus jääb kergesti selle pärast tagaplaanile, et kellegi teise oma jääks vahetus ruumi — ja siis on mõlemad poolikud.',
    astroNote: 'Ringi liikub Veenus ja teeb vastasseisu: suhe ja sinu oma vajadus seisavad täna vastamisi, ja mõlemale saab ruumi, kui vajadus on nimetatud.',
    story: {
      situation: 'Päev kulgeb suhtes rahulikult, aga kusagil sees jääb tunne, et midagi omaga on jäänud sõnamata.',
      turn: 'Keset päeva teravneb see tunne hetkeks, kui kellegi teise vajadus tuleb vastu: mõlemad tahavad sama koha endale.',
      climax: 'Õhtul on kogu päev jõudnud ühte kohta: kas öelda oma vajadus välja või jätta ta jälle tagaplaanile.',
      meaning: 'Ruumi saab mõlemale ainult siis, kui kumb nimetab oma. Ütle täna ühele lähedasele selgelt välja, mida sa praegu kõige rohkem vajad.',
    },
  },
  {
    id: 'mercury-square-work',
    transitBody: 'mercury',
    aspect: 'square',
    focus: ['work'],
    open: 'Täna on hea hetk paar asja kirjalikult selgeks sõnastada: mis kokkuleti ja mis jäi sõnamata.',
    tight: 'Sõnad kipuvad täna sassi minema: kuulda on mõnda muud, kui öeldud, ja loetud mõnda muud, kui kirjutatud.',
    action: 'Enne kui täna vastused ära saadad, loe veel kord üle, mida teine tegelikult küsis, ja vasta sellele.',
    pitfall: 'Vastus kipub minema sinna, kuhu ise arvati küsimuse olevat, mitte sinna, kus ta tegelikult seisab.',
    astroNote: 'Ringi liikub Merkuur ja teeb ruutu: sõnad kippuvad täna sassi minema, ja üle lugemine enne saatmist säästab suure osa sassisolekust.',
    story: {
      situation: 'Päev läheb sõnades edasi: kiri, vastuskiri, jälle kiri — harilik rutiin, mis pole ammu tähelepanu väärinud.',
      turn: 'Keset päeva avaneb, et ühele küsimusele saadetud vastus vastas hoopis teisele küsimusele.',
      climax: 'Õhtul loed sa päeva kirjad veel kord üle ja näed, kui erinevalt on küsitud ja vastatud — päeva pinge ei tulnud asjadest, vaid paarist valesti arvatud sõnast.',
      meaning: 'Sõnad on tööriistad ja tööriistad vajavad midagi üle vaadata. Enne kui täna vastused ära saadad, loe veel kord üle, mida teine tegelikult küsis, ja vasta sellele.',
    },
  },
  {
    id: 'uranus-square-work',
    transitBody: 'uranus',
    aspect: 'square',
    focus: ['work'],
    open: 'Täna on hea hetk oma plaan paberile viia: just selle, mis praegu elab ainult peas.',
    tight: 'Plaanitud jääb täna kergesti pinnast: üks tuleb varem, teine hilineb, kolmas saabub hoopis teisel kujul.',
    action: 'Kui täna midagi plaanitust läheb sassi, hoia kinni ainult järgmisest käegapuutuvast sammust, mitte tervest päevast plaanist.',
    pitfall: 'Üks ootamatu kipub saama kogu päeva uueks plaaniks, ja vana jääb poolenisti tehtuna vahele.',
    astroNote: 'Ringi liikub Uraan ja teeb ruutu: olukorrad veeretavad kergesti plaanidest teisele teele — selle jaoks töötab ainult järgmine samm, mitte terve päeva plaan.',
    story: {
      situation: 'Hommikul on plaan juba peas: millal mis teha ja mis järjekorras.',
      turn: 'Keset päeva tuleb midagi ootamatut, mis loob plaanis augu: üks asi saab tulema hoopis teistsugune, kui plaanis seisab.',
      climax: 'Õhtul on päev läinud teistsuguselt ja ometi on oluline töö tehtud — mitte päeva plaani järgi, vaid järgmise sammu järjekorra järgi.',
      meaning: 'Päev valib ise, kui suured on sammud. Kui täna midagi plaanitust läheb sassi, hoia kinni ainult järgmisest käegapuutuvast sammust, mitte tervest päevast plaanist.',
    },
  },
  {
    id: 'pluto-trine-money',
    transitBody: 'pluto',
    aspect: 'trine',
    focus: ['money'],
    open: 'Täna on hea hetk vanast lahkuda: midagi, mis ammu pole kasutuses, saab täna vaikselt lahti.',
    tight: 'See, mis ammu pole kasutuses, hoiab kinni vaikselt, ja lahtilaskmine tundub hoopis raskemana, kui on.',
    action: 'Tühista täna üks tellimus või kokkulepe, mida sa pole ammu kasutanud.',
    pitfall: 'Mälestus, et midagi võib hiljem tarvis minna, hoiab vaikselt elus asju, mis viimastel aegadel pole ühtegi tööd teinud.',
    astroNote: 'Ringi liikub Pluuto ja teeb trigooni: sügav muutus läheb täna kergesti ja vaikselt — aeg toetab lõplikku sulgemist, mitte kinnihoidmist.',
    story: {
      situation: 'Päev möödub tavaliselt, kuni meelest tuleb midagi vana: tellimus või lepe, mis juba ammu pole kasutuses.',
      turn: 'Keset päeva saadakse aru, et vana hoidmine pole andnud midagi: kasu pole, valu ka pole — ainult harjumus.',
      climax: 'Õhtul on küsimus — kas jätta ta veel üheks ajaks — saanud selge vastuse.',
      meaning: 'See, mis ammu pole kasutuses, hoiab vaikselt kinni ega maksa hoida. Tühista täna üks tellimus või kokkulepe, mida sa pole ammu kasutanud.',
    },
  },
  {
    id: 'neptune-square-creative',
    transitBody: 'neptune',
    aspect: 'square',
    focus: ['creative'],
    open: 'Täna on hea päev visandada: midagi teha kergelt ja ootamata, et see valmis saaks.',
    tight: 'Mõte ujub täna: selgust on vähe ja valmisversioon kipub hapuks jääma.',
    action: 'Tee täna ainult visand või mustand ja jäta vaatamine homme.',
    pitfall: 'Udu meelitab midagi kergesti lõpuni vedama, kuigi poolik mustand on täna ainus reaalne tulemus, mida pidada silmas.',
    astroNote: 'Ringi liikub Neptuun ja teeb ruutu: piirid hägustuvad täna ning selgusetus on osa päevast — alustus toimib, lõpule viimine mitte.',
    story: {
      situation: 'Päev voolab laiali: mõtted kõrvalevad ühelt asjalt teisele, ja mõnes neis on midagi meeldivat.',
      turn: 'Keset päeva, kui midagi pikemalt teha peaks, on selgus kadunud: eristada, mis on oluline, ei toimi.',
      climax: 'Õhtul on tehtud ainult visand — ja ometi on see kõige ausam, mis täna saadud.',
      meaning: 'Kui mõte ujub, ei maksa teda taga ajada: pane talle paber ette. Tee täna ainult visand või mustand ja jäta vaatamine homme.',
    },
  },
  {
    id: 'any-opposition',
    transitBody: 'any',
    aspect: 'opposition',
    focus: [],
    open: 'Kaks asja tõmbavad täna eri suundades: hea hetk valida, kumb jääb täna ootama.',
    tight: 'Mõlemad on õiged ja kumbki ei anna järele — korraga neid kanda pole jõudu.',
    action: 'Ütle täna kellelegi välja, et üks asi jääb täna ootama, kuni teine on lõpuni viidud.',
    pitfall: 'Mõlemale tahetakse korraga jah öelda — ja õhtuks pole kumbki veel tehtud.',
    astroNote: 'Vastasseis paneb kaks õigust vastamisi: kumbki pool pole vale, ja mõlemale saab ruumi ainult vaheldumisi.',
    story: {
      situation: 'Keset päeva tuleb kaks asja samal ajal ette: mõlemad on tähtsad, mõlemat korraga teha ei saa.',
      turn: 'Ühte sammu siia, ühte sammu sinna — ja kumbki pool pole enne päeva lõppu päriselt lõpuni jõudnud.',
      climax: 'Valiku hetk jõuab ometi: midagi peab täna lõpuni saama, ja teine peab selleks ootama.',
      meaning: 'Kui mõlemale korraga jah öelda, jäävad mõlemad pooleli; järjekorras minnes saab mõlemad tehtud. Ütle täna kellelegi välja, et üks asi jääb täna ootama, kuni teine on lõpuni viidud.',
    },
  },
  {
    id: 'any-sextile',
    transitBody: 'any',
    aspect: 'sextile',
    focus: [],
    open: 'Midagi väikest, mida pole varem proovitud, kipub täna kergelt käima.',
    tight: 'Suureks muudatuseks on tänane hetk liiga väike: töötab ainult väike proovisamm.',
    action: 'Proovi täna ühel tüütul asjal üht uut viisi: pisike proov, mitte suur korraldus.',
    pitfall: 'Pisikesest proovist areneb kergesti suur lubadus, millest on homme raske taganeda.',
    astroNote: 'Sekstiil avab väikese ukse, mida peab ise lükkama: üks pisike proov liigub täna kergesti.',
    story: {
      situation: 'Päev on tavaline ja asjad liiguvad tavapärasel rajal.',
      turn: 'Keset päeva tuleb ette üks tüütu asi, mis saab alati vana viisi järgi tehtud.',
      climax: 'Nipp käib kergemalt, kui vana rada — ja sellest piisab, et päev on pisut kergem.',
      meaning: 'Suur muudatus algab pisikesest proovist. Proovi täna ühel tüütul asjal üht uut viisi: pisike proov, mitte suur korraldus.',
    },
  },
  {
    id: 'any-conjunction',
    transitBody: 'any',
    aspect: 'conjunction',
    focus: [],
    open: 'Täna jäävad kaks asja ühte kohta: hea hetk panna mõlemad paberile ja otsustada, kumb alustab.',
    tight: 'Ühes kohas katavad kaks asja kindlalt üksteist: tundub üks ülesanne, tegelikult on neid kaks.',
    action: 'Kirjuta täna paberile, millised kaks asja ühte kohta jäävad, ja otsusta, kumb neist täna alustab.',
    pitfall: 'Üks asi jääb teise varju ja vaikselt tegemata: ühes kohas mahub korraga edasi ainult üks.',
    astroNote: 'Konjunktsioon paneb mõjutused ühte kohta: nad töötavad koos, kui kumbki saab omale nime ja järje.',
    story: {
      situation: 'Kaks asja jäävad täna omadega ühte kohta, ja esialgu tundub see üks asi, mitte kaks.',
      turn: 'Keset päeva on just selles ühes kohas midagi pidevalt sassi, sest kaks asja tahavad sinna korraga.',
      climax: 'Enne õhtu jõudmist on tehtud ainult üks ja teine on jäänud ootama: järjekorda pole keegi välja öelnud.',
      meaning: 'Järjekorra võib täna ise ette võtta. Kirjuta täna paberile, millised kaks asja ühte kohta jäävad, ja otsusta, kumb neist täna alustab.',
    },
  },
  {
    id: 'any-trine',
    transitBody: 'any',
    aspect: 'trine',
    focus: [],
    open: 'Osad asjad liiguvad täna kergemini kui muud: hea hetk võtta ette just see, mis sulle harilikult raske tundub.',
    tight: 'Kergel päeval jääb kerge kergesti kasutamata: ta töötab ainult siis, kui üks asi saab päriselt edasi.',
    action: 'Võta täna ette see asi, mis sulle harilikult raske tundub, ja tee selle esimene samm lõpuni.',
    pitfall: 'Kerge meelitab korraga käima rohkem asju, kui jaksad: nii jäävad tehtud ainult need, mis ise edasi liikusid.',
    astroNote: 'Trigoon annab sujuvuse: see, mis muidu jõudu nõuab, liigub täna iseenesest — kui talle üks konkreetne asi ette pannakse.',
    story: {
      situation: 'Päev algab kergelt: esimene asi, mida puudutad, ei seisa vastu.',
      turn: 'Keset päeva saad aru, et just üks asi liigub täna eriti kergelt — ja just see on jäänud sulle ammu raskeks.',
      climax: 'Enne õhtut on see ammu raske asi jõudnud päriselt edasi, sest kergus töötas täna tema poolt, mitte vastu.',
      meaning: 'Kergus on täna just ühe asja juures. Võta täna ette see asi, mis sulle harilikult raske tundub, ja tee selle esimene samm lõpuni.',
    },
  },
  {
    id: 'any-square',
    transitBody: 'any',
    aspect: 'square',
    focus: [],
    open: 'Üks asi seisab täna otse vastu: hea hetk vaadata, kus ta täpselt kinni jääb, ja just selle kohta samm alla kirjutada.',
    tight: 'Vastu seisvad kohad ei anna järele enne, kui sa neile otseselt vaatad: kõrvale jäämine toob selle homme samale kohale tagasi.',
    action: 'Kirjuta täna paberile, mis selle asja järgmiseks sammuks nõutav on, ja tee sellest esimene tükk ära.',
    pitfall: 'Vastu seisvatest asjadest on täna kerge panna süü teisele inimesele: kibedus kasvab, aga asi ei nõua jõudu, vaid ühte selgemat sammu.',
    astroNote: 'Ruut toob pinge: ta tõmbab tähelepanu ja nõuab rohkem õppimist — kinni jääv asi vajab selgemat sammu, mitte kiiremat.',
    story: {
      situation: 'Päevas on üks koht, kus asi korduvalt kinni jääb, ja päeva sõnum tuleb täna just sellelt kohalt.',
      turn: 'Keset päeva on selge, et sellele kohale ei saa enam kõrvale jätta: ta tuleb iga sammu vahele.',
      climax: 'Enne õhtut jääb alles ainult see üks koht, ja sellest, mida ta päriselt nõuab, pole enam midagi järele arvata.',
      meaning: 'Kinni jääv koht ei nõua jõudu, vaid ühte selget kirjet. Kirjuta täna paberile, mis selle asja järgmiseks sammuks nõutav on, ja tee sellest esimene tükk ära.',
    },
  },
];

export const QUIET_UNIT: QuietUnit = {
  id: 'quiet',
  transitBody: 'none',
  aspect: 'none',
  focus: [],
  open: '',
  tight: '',
  action: 'Jäta täna pooleli üks asi, mida pole vaja täna lõpetada, ja mine vaikselt iseendale tegele.',
  pitfall: '',
  astroNote: '',
  story: {
    situation: 'Päev algab ja jääb tihi: ükski asi ei nõua täna midagi erilist.',
    turn: 'Päeva keskel on sama vaikus — ja sellega kaasas küsimus, kas vaikus ise on juba vastus.',
    climax: 'Pärastlõunal on sama vaikus ikka alles, ja ta ütleb, et midagi suurt täna ei tule.',
    meaning: 'Tihi päev on ikka päev: vaikus pole kohustus täita. Jäta täna pooleli üks asi, mida pole vaja täna lõpetada, ja mine vaikselt iseendale tegele.',
  },
};

// ——— selection ———

/** Prefer exact-body units over tone-generic ones, and domain-bound over
 * domain-free: the more the unit is chosen FOR this exact transit shape,
 * the earlier it wins. */
function unitRank(u: MeaningUnit): number {
  return (u.transitBody === 'any' ? 10 : 0) + (u.focus.length === 0 ? 5 : 0);
}

/** The unit for one hit, honouring the user's focus selection. focusAreas
 * empty (skip) means no steering: any domain qualifies. */
export function unitForHit(
  hit: TransitHit,
  focusAreas: readonly FocusArea[],
): MeaningUnit | null {
  const active = focusAreas.length > 0 ? focusAreas : FOCUS_AREAS;
  const wanted = TARGET_FOCUS[hit.target].filter((f) => active.includes(f));
  const candidates = MEANING_UNITS.filter(
    (u) => u.aspect === hit.aspect && (u.transitBody === hit.transitBody || u.transitBody === 'any'),
  );
  const matched = candidates.filter(
    (u) => u.focus.length === 0 || u.focus.some((f) => wanted.includes(f)),
  );
  if (matched.length === 0) return null;
  matched.sort((a, b) => unitRank(a) - unitRank(b));
  return matched[0]!;
}

/**
 * Whether the day's transit lands outside every focus area the reader
 * chose. Stored per unit rather than derived from the chosen unit's domain:
 * a generic unit can be shown without implying it belongs to the chosen
 * area. With no focus (setup skipped) nothing is steered, so nothing is
 * outside. The app says this plainly instead of selling relevance.
 */
export function hitMissesFocus(
  hit: TransitHit,
  focusAreas: readonly FocusArea[],
): boolean {
  if (focusAreas.length === 0) return false;
  return !TARGET_FOCUS[hit.target].some((f) => focusAreas.includes(f));
}

/** Tightest orb first; ties break in the fixed transit-body order, so the
 * same sky always picks the same story. */
function compareHits(a: TransitHit, b: TransitHit): number {
  if (a.orbDegrees !== b.orbDegrees) return a.orbDegrees - b.orbDegrees;
  return TRANSIT_BODIES.indexOf(a.transitBody) - TRANSIT_BODIES.indexOf(b.transitBody);
}

/**
 * The day's single reading: hits that touch a chosen focus area are read
 * before hits that miss them, tightest orb first inside each group, so the
 * shipped promise — the day speaks to the chosen areas whenever the sky
 * touches one — holds even when a tighter transit sits outside them. Only
 * when no in-orb hit touches a chosen area does the global tightest hit
 * carry the day, and the focus line says so. A hit with no unit at all
 * says only that the story for this shape is not written yet; the quiet
 * unit is reserved for a genuinely empty sky — never for a hit that is in
 * orb. "Mitte iga päev ei ole draama."
 */
export function selectDayReading(
  hits: readonly TransitHit[],
  focusAreas: readonly FocusArea[],
): DayReading {
  const ranked = [...hits].sort(compareHits);
  const order = focusAreas.length > 0
    ? [
        ...ranked.filter((h) => !hitMissesFocus(h, focusAreas)),
        ...ranked.filter((h) => hitMissesFocus(h, focusAreas)),
      ]
    : ranked;
  for (const hit of order) {
    const unit = unitForHit(hit, focusAreas);
    if (unit) return { unit, hit, quiet: false };
  }
  if (ranked.length > 0) return { unit: null, hit: ranked[0]!, quiet: false };
  return { unit: QUIET_UNIT, hit: null, quiet: true };
}
