// =====================================================================
//  KATEGORIJE — šta mašina ume da prepozna i šta ume da nacrta
// =====================================================================

// Srpski nazivi za 345 kategorija koje DoodleNet prepoznaje.
const SRPSKI = {
  flashlight: 'BATERIJSKA LAMPA', belt: 'KAIŠ', mushroom: 'PEČURKA', pond: 'BARA',
  strawberry: 'JAGODA', pineapple: 'ANANAS', sun: 'SUNCE', cow: 'KRAVA', ear: 'UVO',
  bush: 'ŽBUN', pliers: 'KLEŠTA', watermelon: 'LUBENICA', apple: 'JABUKA',
  baseball: 'BEJZBOL LOPTA', feather: 'PERO', shoe: 'CIPELA', leaf: 'LIST',
  lollipop: 'LIZALICA', crown: 'KRUNA', ocean: 'OKEAN', horse: 'KONJ', mountain: 'PLANINA',
  mosquito: 'KOMARAC', mug: 'ŠOLJA', hospital: 'BOLNICA', saw: 'TESTERA', castle: 'ZAMAK',
  angel: 'ANĐEO', underwear: 'DONJI VEŠ', traffic_light: 'SEMAFOR', cruise_ship: 'KRUZER',
  marker: 'MARKER', blueberry: 'BOROVNICA', flamingo: 'FLAMINGO', face: 'LICE',
  hockey_stick: 'HOKEJAŠKA PALICA', bucket: 'KANTA', campfire: 'LOGORSKA VATRA',
  asparagus: 'ŠPARGLA', skateboard: 'SKEJTBORD', door: 'VRATA', suitcase: 'KOFER',
  skull: 'LOBANJA', cloud: 'OBLAK', paint_can: 'KANTA BOJE', hockey_puck: 'HOKEJAŠKI PAK',
  steak: 'STEK', house_plant: 'SOBNA BILJKA', sleeping_bag: 'VREĆA ZA SPAVANJE',
  bench: 'KLUPA', snowman: 'SNEŠKO BELIĆ', arm: 'RUKA', crayon: 'BOJICA', fan: 'VENTILATOR',
  shovel: 'LOPATA', leg: 'NOGA', washing_machine: 'VEŠ MAŠINA', harp: 'HARFA',
  toothbrush: 'ČETKICA ZA ZUBE', tree: 'DRVO', bear: 'MEDVED', rake: 'GRABULJE',
  megaphone: 'MEGAFON', knee: 'KOLENO', guitar: 'GITARA', calculator: 'DIGITRON',
  hurricane: 'URAGAN', grapes: 'GROŽĐE', paintbrush: 'KIČICA', couch: 'KAUČ', nose: 'NOS',
  square: 'KVADRAT', wristwatch: 'RUČNI SAT', penguin: 'PINGVIN', bridge: 'MOST',
  octagon: 'OSMOUGAO', submarine: 'PODMORNICA', screwdriver: 'ŠRAFCIGER',
  rollerskates: 'KOTURALJKE', ladder: 'MERDEVINE', wine_bottle: 'BOCA VINA', cake: 'TORTA',
  bracelet: 'NARUKVICA', broom: 'METLA', yoga: 'JOGA', finger: 'PRST', fish: 'RIBA',
  line: 'LINIJA', truck: 'KAMION', snake: 'ZMIJA', bus: 'AUTOBUS', stitches: 'ŠAVOVI',
  snorkel: 'DISALICA', shorts: 'ŠORC', bowtie: 'LEPTIR MAŠNA', pickup_truck: 'PIKAP',
  tooth: 'ZUB', snail: 'PUŽ', foot: 'STOPALO', crab: 'RAK', school_bus: 'ŠKOLSKI AUTOBUS',
  train: 'VOZ', dresser: 'KOMODA', sock: 'ČARAPA', tractor: 'TRAKTOR', map: 'MAPA',
  hedgehog: 'JEŽ', coffee_cup: 'ŠOLJA KAFE', computer: 'RAČUNAR', matches: 'ŠIBICE',
  beard: 'BRADA', frog: 'ŽABA', crocodile: 'KROKODIL', bathtub: 'KADA', rain: 'KIŠA',
  moon: 'MESEC', bee: 'PČELA', knife: 'NOŽ', boomerang: 'BUMERANG', lighthouse: 'SVETIONIK',
  chandelier: 'LUSTER', jail: 'ZATVOR', pool: 'BAZEN', stethoscope: 'STETOSKOP',
  frying_pan: 'TIGANJ', cell_phone: 'MOBILNI TELEFON', binoculars: 'DVOGLED', purse: 'TAŠNA',
  lantern: 'FENJER', birthday_cake: 'ROĐENDANSKA TORTA', clarinet: 'KLARINET',
  palm_tree: 'PALMA', aircraft_carrier: 'NOSAČ AVIONA', vase: 'VAZA', eraser: 'GUMICA',
  shark: 'AJKULA', skyscraper: 'NEBODER', bicycle: 'BICIKL', sink: 'LAVABO',
  teapot: 'ČAJNIK', circle: 'KRUG', tornado: 'TORNADO', bird: 'PTICA', stereo: 'STEREO',
  mouth: 'USTA', key: 'KLJUČ', hot_dog: 'HOT DOG', spoon: 'KAŠIKA', laptop: 'LAPTOP',
  cup: 'ČAŠA', bottlecap: 'ČEP', The_Great_Wall_of_China: 'KINESKI ZID',
  The_Mona_Lisa: 'MONA LIZA', smiley_face: 'SMAJLI', waterslide: 'TOBOGAN',
  eyeglasses: 'NAOČARE', ceiling_fan: 'PLAFONSKI VENTILATOR', lobster: 'JASTOG',
  moustache: 'BRKOVI', carrot: 'ŠARGAREPA', garden: 'BAŠTA', police_car: 'POLICIJSKI AUTO',
  postcard: 'RAZGLEDNICA', necklace: 'OGRLICA', helmet: 'KACIGA', blackberry: 'KUPINA',
  beach: 'PLAŽA', golf_club: 'PALICA ZA GOLF', car: 'AUTOMOBIL', panda: 'PANDA',
  alarm_clock: 'BUDILNIK', 't-shirt': 'MAJICA', dog: 'PAS', bread: 'HLEB',
  wine_glass: 'ČAŠA ZA VINO', lighter: 'UPALJAČ', flower: 'CVET', bandage: 'FLASTER',
  drill: 'BUŠILICA', butterfly: 'LEPTIR', swan: 'LABUD', owl: 'SOVA', raccoon: 'RAKUN',
  squiggle: 'ŠKRABOTINA', calendar: 'KALENDAR', giraffe: 'ŽIRAFA', elephant: 'SLON',
  trumpet: 'TRUBA', rabbit: 'ZEC', trombone: 'TROMBON', sheep: 'OVCA', onion: 'CRNI LUK',
  church: 'CRKVA', flip_flops: 'JAPANKE', spreadsheet: 'TABELA', pear: 'KRUŠKA',
  clock: 'SAT', roller_coaster: 'ROLERKOSTER', parachute: 'PADOBRAN', kangaroo: 'KENGUR',
  duck: 'PATKA', remote_control: 'DALJINSKI', compass: 'KOMPAS', monkey: 'MAJMUN',
  rainbow: 'DUGA', tennis_racquet: 'TENISKI REKET', lion: 'LAV', pencil: 'OLOVKA',
  string_bean: 'BORANIJA', oven: 'RERNA', star: 'ZVEZDA', cat: 'MAČKA', pizza: 'PICA',
  soccer_ball: 'FUDBALSKA LOPTA', syringe: 'ŠPRIC', flying_saucer: 'LETEĆI TANJIR',
  eye: 'OKO', cookie: 'KEKS', floor_lamp: 'PODNA LAMPA', mouse: 'MIŠ', toilet: 'WC ŠOLJA',
  toaster: 'TOSTER', The_Eiffel_Tower: 'AJFELOV TORANJ', airplane: 'AVION', stove: 'ŠPORET',
  cello: 'ČELO', stop_sign: 'ZNAK STOP', tent: 'ŠATOR', diving_board: 'SKAKAONICA',
  light_bulb: 'SIJALICA', hammer: 'ČEKIĆ', scorpion: 'ŠKORPIJA', headphones: 'SLUŠALICE',
  basket: 'KORPA', spider: 'PAUK', paper_clip: 'SPAJALICA', sweater: 'DŽEMPER',
  ice_cream: 'SLADOLED', envelope: 'KOVERTA', sea_turtle: 'MORSKA KORNJAČA', donut: 'KROFNA',
  hat: 'ŠEŠIR', hourglass: 'PEŠČANI SAT', broccoli: 'BROKOLI', jacket: 'JAKNA',
  backpack: 'RANAC', book: 'KNJIGA', lightning: 'MUNJA', drums: 'BUBNJEVI',
  snowflake: 'PAHULJA', radio: 'RADIO', banana: 'BANANA', camel: 'KAMILA', canoe: 'KANU',
  toothpaste: 'PASTA ZA ZUBE', chair: 'STOLICA', picture_frame: 'RAM ZA SLIKU',
  parrot: 'PAPAGAJ', sandwich: 'SENDVIČ', lipstick: 'KARMIN', pants: 'PANTALONE',
  violin: 'VIOLINA', brain: 'MOZAK', power_outlet: 'UTIČNICA', triangle: 'TROUGAO',
  hamburger: 'HAMBURGER', dragon: 'ZMAJ', bulldozer: 'BULDOŽER', cannon: 'TOP',
  dolphin: 'DELFIN', zebra: 'ZEBRA', animal_migration: 'SEOBA ŽIVOTINJA',
  camouflage: 'KAMUFLAŽA', scissors: 'MAKAZE', basketball: 'KOŠARKAŠKA LOPTA',
  elbow: 'LAKAT', umbrella: 'KIŠOBRAN', windmill: 'VETRENJAČA', table: 'STO', rifle: 'PUŠKA',
  hexagon: 'ŠESTOUGAO', potato: 'KROMPIR', anvil: 'NAKOVANJ', sword: 'MAČ',
  peanut: 'KIKIRIKI', axe: 'SEKIRA', television: 'TELEVIZOR', rhinoceros: 'NOSOROG',
  baseball_bat: 'BEJZBOL PALICA', speedboat: 'GLISER', sailboat: 'JEDRILICA',
  zigzag: 'CIK-CAK', garden_hose: 'BAŠTENSKO CREVO', river: 'REKA', house: 'KUĆA',
  pillow: 'JASTUK', ant: 'MRAV', tiger: 'TIGAR', stairs: 'STEPENICE',
  cooler: 'RUČNI FRIŽIDER', see_saw: 'KLACKALICA', piano: 'KLAVIR', fireplace: 'KAMIN',
  popsicle: 'SLADOLED NA ŠTAPIĆU', dumbbell: 'TEG', mailbox: 'POŠTANSKO SANDUČE',
  barn: 'ŠTALA', hot_tub: 'ĐAKUZI', 'teddy-bear': 'PLIŠANI MEDA', fork: 'VILJUŠKA',
  dishwasher: 'MAŠINA ZA SUĐE', peas: 'GRAŠAK', hot_air_balloon: 'BALON',
  keyboard: 'TASTATURA', microwave: 'MIKROTALASNA', wheel: 'TOČAK', fire_hydrant: 'HIDRANT',
  van: 'KOMBI', camera: 'FOTOAPARAT', whale: 'KIT', candle: 'SVEĆA', octopus: 'HOBOTNICA',
  pig: 'SVINJA', swing_set: 'LJULJAŠKA', helicopter: 'HELIKOPTER', saxophone: 'SAKSOFON',
  passport: 'PASOŠ', bat: 'SLEPI MIŠ', ambulance: 'HITNA POMOĆ', diamond: 'DIJAMANT',
  goatee: 'KOZJA BRADICA', fence: 'OGRADA', grass: 'TRAVA', mermaid: 'SIRENA',
  motorbike: 'MOTOR', microphone: 'MIKROFON', toe: 'NOŽNI PRST', cactus: 'KAKTUS',
  nail: 'EKSER', telephone: 'TELEFON', hand: 'ŠAKA', squirrel: 'VEVERICA',
  streetlight: 'ULIČNA LAMPA', bed: 'KREVET', firetruck: 'VATROGASNO VOZILO',
  // modeli koji nisu u DoodleNet-u (mešani motivi)
  everything: 'SVAŠTA', the_mona_lisa: 'MONA LIZA',
};

// Svi motivi za koje postoji Google-ov sketch-rnn model (mreža koja CRTA).
const MODELI_SKICA = new Set(('alarm_clock ambulance angel ant antyoga backpack barn basket bear bee ' +
  'beeflower bicycle bird book brain bridge bulldozer bus butterfly cactus calendar castle cat catbus ' +
  'catpig chair couch crab crabchair crabrabbitfacepig cruise_ship diving_board dog dogbunny dolphin duck ' +
  'elephant elephantpig eye face fan fire_hydrant firetruck flamingo flower floweryoga frog frogsofa garden ' +
  'hand hedgeberry hedgehog helicopter kangaroo key lantern lighthouse lion lionsheep lobster map mermaid ' +
  'monapassport monkey mosquito octopus owl paintbrush palm_tree parrot passport peas penguin pig pigsheep ' +
  'pineapple pool postcard power_outlet rabbit rabbitturtle radio radioface rain rhinoceros rifle ' +
  'roller_coaster sandwich scorpion sea_turtle sheep skull snail snowflake speedboat spider squirrel steak ' +
  'stove strawberry swan swing_set the_mona_lisa tiger toothbrush toothpaste tractor trombone truck whale ' +
  'windmill yoga yogabicycle everything').split(' '));

// Google je istrenirao i "mešane" modele, na dva ili više motiva odjednom.
// Mašina ih koristi za strategiju SPOJI NESPOJIVO (kombinacija).
const KOMPONENTE = {
  catpig: ['cat', 'pig'], catbus: ['cat', 'bus'], dogbunny: ['dog', 'rabbit'],
  elephantpig: ['elephant', 'pig'], lionsheep: ['lion', 'sheep'], rabbitturtle: ['rabbit', 'sea_turtle'],
  beeflower: ['bee', 'flower'], radioface: ['radio', 'face'], frogsofa: ['frog', 'couch'],
  crabchair: ['crab', 'chair'], yogabicycle: ['yoga', 'bicycle'], hedgeberry: ['hedgehog', 'strawberry'],
  pigsheep: ['pig', 'sheep'], floweryoga: ['flower', 'yoga'], antyoga: ['ant', 'yoga'],
  crabrabbitfacepig: ['crab', 'rabbit', 'face', 'pig'], monapassport: ['The_Mona_Lisa', 'passport'],
};
const HIBRIDNI_MODELI = Object.keys(KOMPONENTE);

// Svi pojedinačni motivi koje mašina ume da nacrta (jedan model = jedan motiv).
const REPERTOAR = [...MODELI_SKICA].filter(m => !KOMPONENTE[m] && m !== 'rifle' && m !== 'everything');

// Svi modeli koje preuzmi_modele skida (isti spisak piše u .bat i .sh fajlu).
const ZA_PREUZIMANJE = REPERTOAR.concat(HIBRIDNI_MODELI, ['everything']);

// Za motiv -> mešani modeli koji ga sadrže.
const HIBRIDI = {};
for (const [ime, delovi] of Object.entries(KOMPONENTE)) {
  for (const d of delovi) (HIBRIDI[d] = HIBRIDI[d] || []).push(ime);
}

// Kad mašina prepozna nešto za šta nema model, uzima najbliži motiv koji zna.
// (Ovo je ručni spisak; ako postoji js/profili.js, mašina radije veruje onome
//  što je sama izmerila — vidi SAMOSPOZNAJA niže.)
const NAJBLIZE = {
  house: 'barn', church: 'castle', smiley_face: 'face', car: 'truck', police_car: 'ambulance',
  pickup_truck: 'truck', van: 'ambulance', school_bus: 'bus', train: 'bus', 'teddy-bear': 'bear',
  panda: 'bear', motorbike: 'bicycle', shark: 'dolphin', fish: 'dolphin', tree: 'palm_tree',
  sun: 'flower', mouse: 'rabbit', raccoon: 'squirrel', cow: 'pig', horse: 'dog',
  sailboat: 'speedboat', canoe: 'speedboat', cloud: 'rain', snowman: 'face',
  circle: 'face', nose: 'face', mouth: 'face', ear: 'face', beard: 'face',
  moustache: 'face', eyeglasses: 'eye', goatee: 'face', arm: 'hand', finger: 'hand',
  The_Mona_Lisa: 'the_mona_lisa', house_plant: 'cactus', bush: 'garden', grass: 'garden',
  leaf: 'flower', clock: 'alarm_clock', wristwatch: 'alarm_clock', compass: 'alarm_clock',
  television: 'radio', stereo: 'radio', computer: 'radio', laptop: 'radio',
  skyscraper: 'lighthouse', The_Eiffel_Tower: 'lighthouse', jail: 'castle', hospital: 'barn',
  crocodile: 'frog', snake: 'snail', dragon: 'lion', zebra: 'tiger', giraffe: 'kangaroo',
  camel: 'sheep', bat: 'bird', feather: 'bird', airplane: 'helicopter', flying_saucer: 'helicopter',
  hot_air_balloon: 'lantern', light_bulb: 'lantern', candle: 'lantern', bench: 'couch', bed: 'couch',
  table: 'chair', envelope: 'postcard', picture_frame: 'postcard', oven: 'stove', microwave: 'stove',
  toaster: 'stove', ceiling_fan: 'fan', blueberry: 'peas', grapes: 'peas', apple: 'strawberry',
  pear: 'strawberry', hamburger: 'sandwich', hot_dog: 'sandwich', bread: 'sandwich',
  aircraft_carrier: 'cruise_ship', submarine: 'whale',
  waterslide: 'roller_coaster', hot_tub: 'pool',
  bathtub: 'pool', suitcase: 'backpack', purse: 'backpack', parachute: 'lantern',
};

// ---------------------------------------------------------------------
//  SEMANTIČKO PAMĆENJE — teme i asocijacije
//  ---------------------------------------------------------------------
//  Po S. Mednicku (1962) kreativnost je sposobnost da se stigne do
//  DALEKIH asocijacija: kreativan čovek ima "ravnu" hijerarhiju
//  asocijacija, pa mu i daleke ideje padaju na pamet. Mašina zato ima
//  četiri kruga: bliske (ručno upisane), iz iste teme (scena), iz
//  susedne teme (daleke) i nasumične. MAŠTA određuje koliko je njena
//  hijerarhija ravna — koliko daleko sme da ode.
// ---------------------------------------------------------------------
const TEME = {
  FARMA: ['barn', 'sheep', 'pig', 'dog', 'cat', 'duck', 'tractor', 'windmill', 'garden', 'peas', 'basket', 'rabbit', 'strawberry'],
  MORE: ['whale', 'dolphin', 'octopus', 'crab', 'lobster', 'sea_turtle', 'mermaid', 'lighthouse', 'cruise_ship', 'speedboat', 'palm_tree', 'flamingo', 'penguin'],
  BAŠTA: ['flower', 'bee', 'butterfly', 'snail', 'garden', 'strawberry', 'peas', 'rabbit', 'hedgehog', 'squirrel', 'spider', 'ant', 'mosquito', 'frog', 'bird'],
  DŽUNGLA: ['lion', 'tiger', 'elephant', 'rhinoceros', 'monkey', 'parrot', 'palm_tree', 'kangaroo', 'flamingo', 'pineapple'],
  PUSTINJA: ['cactus', 'scorpion', 'snail', 'kangaroo', 'palm_tree', 'lion'],
  GRAD: ['bus', 'truck', 'firetruck', 'ambulance', 'fire_hydrant', 'bridge', 'bulldozer', 'bicycle', 'helicopter', 'dog'],
  SOBA: ['chair', 'couch', 'stove', 'fan', 'radio', 'lantern', 'alarm_clock', 'book', 'calendar', 'key', 'power_outlet', 'cat', 'basket'],
  KUPATILO: ['toothbrush', 'toothpaste', 'face', 'hand', 'power_outlet', 'duck'],
  NOĆ: ['owl', 'lantern', 'castle', 'skull', 'spider', 'key', 'alarm_clock', 'angel'],
  BAJKA: ['castle', 'angel', 'mermaid', 'swan', 'key', 'owl', 'the_mona_lisa', 'frog'],
  TELO: ['face', 'eye', 'hand', 'yoga', 'skull', 'brain'],
  UMETNOST: ['the_mona_lisa', 'paintbrush', 'postcard', 'face', 'eye', 'hand', 'trombone', 'radio', 'book'],
  PUTOVANJE: ['passport', 'map', 'postcard', 'backpack', 'bicycle', 'bus', 'cruise_ship', 'castle', 'lighthouse', 'helicopter', 'speedboat'],
  KUHINJA: ['stove', 'sandwich', 'steak', 'pineapple', 'strawberry', 'peas', 'basket', 'lobster'],
  ZABAVA: ['roller_coaster', 'swing_set', 'pool', 'diving_board', 'bicycle', 'yoga', 'trombone'],
  NEBO: ['rain', 'snowflake', 'bird', 'owl', 'helicopter', 'angel', 'windmill', 'butterfly'],
  ZIMA: ['snowflake', 'penguin', 'lantern', 'castle', 'bear'],
  ŠUMA: ['bear', 'owl', 'squirrel', 'hedgehog', 'snail', 'spider', 'rabbit', 'mosquito'],
};
// Teme za česte stvari koje DoodleNet prepoznaje, a za koje nema modela.
const TEME_KLASA = {
  house: ['SOBA', 'FARMA'], tree: ['ŠUMA', 'BAŠTA'], sun: ['NEBO', 'PUSTINJA', 'MORE'], moon: ['NOĆ', 'NEBO'],
  cloud: ['NEBO'], star: ['NOĆ', 'NEBO'], mountain: ['PUTOVANJE', 'ZIMA'], car: ['GRAD'], fish: ['MORE'],
  sailboat: ['MORE', 'PUTOVANJE'], boat: ['MORE'], ocean: ['MORE'], beach: ['MORE'], airplane: ['NEBO', 'PUTOVANJE'],
  train: ['PUTOVANJE', 'GRAD'], church: ['BAJKA', 'NOĆ'], cow: ['FARMA'], horse: ['FARMA'], apple: ['KUHINJA', 'BAŠTA'],
  banana: ['KUHINJA', 'DŽUNGLA'], umbrella: ['NEBO'], clock: ['SOBA', 'NOĆ'], hat: ['SOBA'], cup: ['KUHINJA'],
  mug: ['KUHINJA'], candle: ['NOĆ', 'SOBA'], guitar: ['UMETNOST'], piano: ['UMETNOST', 'SOBA'], bed: ['SOBA', 'NOĆ'],
  table: ['SOBA', 'KUHINJA'], door: ['SOBA'], snowman: ['ZIMA'], smiley_face: ['TELO'], circle: ['NEBO'],
  square: ['SOBA'], triangle: ['PUSTINJA'], leaf: ['BAŠTA', 'ŠUMA'], mushroom: ['ŠUMA'], river: ['ŠUMA', 'PUTOVANJE'],
  bridge: ['GRAD', 'PUTOVANJE'], tent: ['PUTOVANJE', 'ŠUMA'], campfire: ['ŠUMA', 'NOĆ'], lightning: ['NEBO'],
  rainbow: ['NEBO'], tornado: ['NEBO'], hurricane: ['NEBO'], crown: ['BAJKA'], dragon: ['BAJKA'], light_bulb: ['SOBA'],
  eyeglasses: ['TELO', 'SOBA'], book: ['SOBA', 'UMETNOST'], cat: ['SOBA', 'FARMA'], line: ['PUTOVANJE'],
};

// Bliske asocijacije: prvo što padne na pamet (od bliskih ka daljim).
const ASOCIJACIJE = {
  alarm_clock: ['key', 'chair', 'calendar', 'face', 'lantern', 'radio'],
  ambulance: ['firetruck', 'fire_hydrant', 'bus', 'truck', 'bridge'],
  angel: ['castle', 'face', 'bird', 'lantern', 'snowflake'],
  ant: ['bee', 'spider', 'sandwich', 'mosquito', 'garden', 'strawberry'],
  backpack: ['book', 'map', 'passport', 'bicycle', 'bus'],
  barn: ['windmill', 'sheep', 'pig', 'tractor', 'garden'],
  basket: ['strawberry', 'pineapple', 'peas', 'rabbit', 'flower', 'sandwich'],
  bear: ['bee', 'squirrel', 'owl', 'rabbit', 'basket'],
  bee: ['flower', 'butterfly', 'garden', 'strawberry', 'windmill'],
  bicycle: ['truck', 'bus', 'dog', 'backpack', 'map'],
  bird: ['owl', 'parrot', 'flower', 'palm_tree', 'windmill', 'rain'],
  book: ['brain', 'lantern', 'chair', 'alarm_clock', 'eye', 'paintbrush'],
  brain: ['face', 'eye', 'book', 'skull', 'hand'],
  bridge: ['truck', 'bus', 'speedboat', 'cruise_ship', 'lighthouse'],
  bulldozer: ['truck', 'tractor', 'bridge', 'fire_hydrant'],
  bus: ['truck', 'bicycle', 'fire_hydrant', 'bridge', 'backpack'],
  butterfly: ['flower', 'bee', 'garden', 'cactus'],
  cactus: ['scorpion', 'snail', 'palm_tree', 'kangaroo'],
  calendar: ['alarm_clock', 'book', 'key', 'postcard'],
  castle: ['angel', 'lantern', 'key', 'swan', 'bridge', 'windmill'],
  cat: ['dog', 'owl', 'bird', 'rabbit', 'couch', 'chair', 'lantern'],
  chair: ['couch', 'cat', 'lantern', 'alarm_clock', 'book', 'fan'],
  couch: ['chair', 'cat', 'dog', 'radio', 'fan', 'lantern'],
  crab: ['octopus', 'lobster', 'palm_tree', 'sea_turtle', 'whale', 'lighthouse'],
  cruise_ship: ['speedboat', 'lighthouse', 'whale', 'dolphin', 'bridge'],
  diving_board: ['pool', 'swing_set', 'dolphin', 'speedboat'],
  dog: ['cat', 'rabbit', 'sheep', 'fire_hydrant', 'bicycle', 'couch'],
  dolphin: ['whale', 'octopus', 'speedboat', 'sea_turtle', 'crab'],
  duck: ['swan', 'frog', 'rain', 'pool', 'whale'],
  elephant: ['palm_tree', 'lion', 'rhinoceros', 'monkey', 'tiger'],
  eye: ['face', 'owl', 'hand', 'brain', 'the_mona_lisa'],
  face: ['hand', 'eye', 'angel', 'skull', 'the_mona_lisa', 'brain'],
  fan: ['chair', 'couch', 'stove', 'radio', 'power_outlet'],
  fire_hydrant: ['firetruck', 'dog', 'ambulance', 'bus'],
  firetruck: ['fire_hydrant', 'ambulance', 'bus', 'truck', 'bridge'],
  flamingo: ['palm_tree', 'swan', 'pool', 'parrot', 'flower'],
  flower: ['bee', 'butterfly', 'snail', 'garden', 'rain', 'cactus'],
  frog: ['duck', 'snail', 'rain', 'mosquito', 'flower', 'pool'],
  garden: ['flower', 'bee', 'snail', 'rabbit', 'peas', 'strawberry'],
  hand: ['face', 'flower', 'key', 'bird', 'paintbrush'],
  hedgehog: ['snail', 'squirrel', 'owl', 'rabbit', 'strawberry'],
  helicopter: ['bird', 'bridge', 'ambulance', 'lighthouse', 'cruise_ship'],
  kangaroo: ['palm_tree', 'cactus', 'scorpion', 'monkey'],
  key: ['castle', 'lantern', 'alarm_clock', 'chair', 'passport', 'book'],
  lantern: ['owl', 'key', 'castle', 'lighthouse', 'spider', 'book'],
  lighthouse: ['whale', 'crab', 'cruise_ship', 'speedboat', 'bird'],
  lion: ['palm_tree', 'elephant', 'tiger', 'cactus', 'monkey', 'rhinoceros'],
  lobster: ['crab', 'octopus', 'sea_turtle', 'steak', 'stove'],
  map: ['passport', 'postcard', 'backpack', 'castle', 'lighthouse', 'cruise_ship'],
  mermaid: ['whale', 'octopus', 'crab', 'lighthouse', 'castle', 'dolphin'],
  monkey: ['palm_tree', 'parrot', 'tiger', 'elephant', 'lion'],
  mosquito: ['frog', 'spider', 'ant', 'rain'],
  octopus: ['crab', 'whale', 'mermaid', 'lighthouse', 'dolphin', 'lobster'],
  owl: ['lantern', 'castle', 'key', 'bird', 'book'],
  paintbrush: ['the_mona_lisa', 'hand', 'postcard', 'face', 'flower'],
  palm_tree: ['crab', 'parrot', 'monkey', 'lighthouse', 'flamingo'],
  parrot: ['palm_tree', 'monkey', 'bird', 'pineapple', 'flamingo'],
  passport: ['map', 'postcard', 'backpack', 'cruise_ship', 'the_mona_lisa'],
  peas: ['garden', 'basket', 'stove', 'rabbit'],
  penguin: ['snowflake', 'whale', 'dolphin', 'octopus', 'duck'],
  pig: ['barn', 'sheep', 'duck', 'windmill', 'tractor'],
  pineapple: ['palm_tree', 'parrot', 'strawberry', 'basket'],
  pool: ['diving_board', 'duck', 'swan', 'flamingo', 'palm_tree'],
  postcard: ['passport', 'map', 'lighthouse', 'palm_tree', 'castle'],
  power_outlet: ['fan', 'radio', 'stove', 'toothbrush'],
  rabbit: ['flower', 'cat', 'snail', 'hedgehog', 'garden', 'basket'],
  radio: ['couch', 'trombone', 'fan', 'alarm_clock', 'face'],
  rain: ['flower', 'duck', 'snail', 'frog', 'lantern', 'snowflake'],
  rhinoceros: ['elephant', 'lion', 'tiger', 'palm_tree'],
  roller_coaster: ['swing_set', 'bicycle', 'bridge', 'pool'],
  sandwich: ['basket', 'steak', 'ant', 'stove'],
  scorpion: ['cactus', 'spider', 'kangaroo', 'crab'],
  sea_turtle: ['crab', 'octopus', 'dolphin', 'whale', 'palm_tree'],
  sheep: ['windmill', 'barn', 'dog', 'pig'],
  skull: ['spider', 'lantern', 'angel', 'owl', 'hand', 'brain'],
  snail: ['flower', 'rain', 'garden', 'hedgehog', 'frog', 'strawberry'],
  snowflake: ['penguin', 'rain', 'lantern', 'castle', 'angel'],
  speedboat: ['dolphin', 'lighthouse', 'cruise_ship', 'whale', 'bridge'],
  spider: ['skull', 'lantern', 'butterfly', 'mosquito', 'ant'],
  squirrel: ['hedgehog', 'owl', 'rabbit', 'bear', 'bird'],
  steak: ['stove', 'sandwich', 'lobster', 'pig'],
  stove: ['steak', 'peas', 'sandwich', 'fan', 'chair'],
  strawberry: ['basket', 'pineapple', 'snail', 'garden', 'hedgehog'],
  swan: ['duck', 'castle', 'pool', 'flamingo', 'rain'],
  swing_set: ['roller_coaster', 'pool', 'dog', 'bird'],
  the_mona_lisa: ['face', 'paintbrush', 'angel', 'eye', 'hand'],
  tiger: ['lion', 'elephant', 'monkey', 'palm_tree', 'rhinoceros'],
  toothbrush: ['toothpaste', 'face', 'power_outlet', 'hand'],
  toothpaste: ['toothbrush', 'face', 'hand'],
  tractor: ['barn', 'windmill', 'pig', 'sheep', 'garden'],
  trombone: ['radio', 'face', 'hand'],
  truck: ['bus', 'bicycle', 'barn', 'bridge', 'fire_hydrant'],
  whale: ['octopus', 'dolphin', 'crab', 'penguin', 'lighthouse', 'speedboat'],
  windmill: ['barn', 'sheep', 'flower', 'bird', 'tractor'],
  yoga: ['palm_tree', 'face', 'angel', 'bicycle', 'pool'],
  // česti motivi za koje nema modela za crtanje
  house: ['palm_tree', 'windmill', 'truck', 'sheep', 'flower', 'dog'],
  sun: ['flower', 'palm_tree', 'bird', 'snail', 'cactus'],
  moon: ['owl', 'lantern', 'snowflake', 'castle'],
  cloud: ['rain', 'bird', 'snowflake', 'windmill', 'helicopter'],
  tree: ['bird', 'owl', 'snail', 'sheep', 'squirrel'],
  circle: ['face', 'eye', 'owl', 'flower'],
  square: ['chair', 'key', 'castle', 'truck', 'book'],
  triangle: ['castle', 'palm_tree', 'bird', 'lighthouse'],
  car: ['truck', 'bus', 'bicycle', 'palm_tree', 'fire_hydrant'],
  fish: ['whale', 'octopus', 'crab', 'duck', 'dolphin'],
  star: ['snowflake', 'owl', 'angel', 'lighthouse'],
  mountain: ['windmill', 'sheep', 'castle', 'bird'],
  smiley_face: ['hand', 'flower', 'face', 'bird'],
  ocean: ['whale', 'octopus', 'lighthouse', 'crab', 'cruise_ship'],
  line: ['snail', 'bicycle', 'bird', 'truck'],
  sailboat: ['lighthouse', 'whale', 'dolphin', 'crab'],
  airplane: ['helicopter', 'bird', 'cruise_ship', 'passport'],
  church: ['castle', 'angel', 'lantern', 'owl'],
  cow: ['barn', 'sheep', 'pig', 'windmill'],
  horse: ['barn', 'dog', 'sheep', 'windmill'],
  apple: ['strawberry', 'basket', 'snail', 'pineapple'],
  umbrella: ['rain', 'duck', 'frog', 'snail'],
  clock: ['alarm_clock', 'key', 'calendar', 'chair'],
};

// Kako mašina bira asocijaciju (Mednick). Vraća redosled kandidata i
// koliko je daleko otišla: 'bliska' | 'scena' | 'daleka' | 'nasumicna'.
function temeZa(klasa) {
  const k = klasa ? (klasa.toLowerCase ? klasa : String(klasa)) : null;
  if (!k) return [];
  if (TEME_KLASA[k]) return TEME_KLASA[k];
  const m = modelZaKlasu(k) || k;
  return Object.keys(TEME).filter(t => TEME[t].includes(m));
}

function krugoviAsocijacija(klasa, dostupni) {
  const ima = (x) => dostupni.includes(x);
  const svoj = klasa ? (modelZaKlasu(klasa) || klasa.toLowerCase()) : null;
  const bez = (lista, ...iskljuci) => [...new Set(lista)].filter(x => ima(x) && x !== svoj && !iskljuci.some(s => s.includes(x)));
  const bliske = bez((klasa && (ASOCIJACIJE[klasa] || ASOCIJACIJE[klasa.toLowerCase()])) || (svoj && ASOCIJACIJE[svoj]) || []);
  const moje = temeZa(klasa);
  const scena = bez(moje.flatMap(t => TEME[t]), bliske);
  // daleke: teme koje dele bar jedan motiv sa mojim temama, ali nisu moje
  const susedne = Object.keys(TEME).filter(t => !moje.includes(t) && TEME[t].some(x => moje.some(m => TEME[m].includes(x))));
  const daleke = bez(susedne.flatMap(t => TEME[t]), bliske, scena);
  const nasumicne = bez(dostupni, bliske, scena, daleke);
  return { bliske, scena, daleke, nasumicne };
}

// ---------------------------------------------------------------------
//  APSTRAKTNO — klase iz Quick, Draw! skupa koje su zapravo čista forma
//  (krug, kvadrat, cik-cak, škrabotina...) ili tekstura (trava, ograda,
//  kiša, šavovi). Broj = koliko je ta klasa "apstraktna" (1 = sasvim).
// ---------------------------------------------------------------------
const APSTRAKTNO = {
  circle: 1, square: 1, triangle: 1, hexagon: 1, octagon: 1, line: 1, squiggle: 1, zigzag: 1,
  diamond: 0.9, stitches: 0.9, spreadsheet: 0.8, camouflage: 0.8, animal_migration: 0.8,
  hurricane: 0.7, star: 0.6, stairs: 0.6, fence: 0.6, river: 0.6, ocean: 0.6, tornado: 0.6,
  string_bean: 0.6, The_Great_Wall_of_China: 0.6, lightning: 0.5, grass: 0.5, bracelet: 0.5,
  necklace: 0.5, paper_clip: 0.5, donut: 0.5, bottlecap: 0.5, hockey_puck: 0.5, snake: 0.4,
  wheel: 0.4, cookie: 0.4, rain: 0.35, compass: 0.3, basketball: 0.3, soccer_ball: 0.3, beach: 0.3,
};

function srpskiNaziv(klasa) {
  return SRPSKI[klasa] || klasa.replace(/_/g, ' ').toUpperCase();
}

// Imena DoodleNet klasa po kojima mašina ocenjuje crtež nekog modela.
function klaseZaOcenu(ime) {
  if (KOMPONENTE[ime]) return KOMPONENTE[ime];
  if (ime === 'the_mona_lisa') return ['The_Mona_Lisa'];
  const sve = window.DOODLENET ? window.DOODLENET.klase : [];
  return sve.includes(ime) ? [ime] : [];
}

// ---------------------------------------------------------------------
//  SAMOSPOZNAJA — mašina je pre prvog crteža "pogledala sopstvene ruke":
//  svakim modelom nacrtala po nekoliko crteža i dala ih svom oku da
//  pogodi šta su. Tako zna koji njen model crta stvari koje liče na
//  nešto što je prepoznala (i koje su stvari slične na oko — vizuelne
//  rime). Rezultat je u js/profili.js (window.PROFILI), ako postoji.
// ---------------------------------------------------------------------
function modelZaKlasu(klasa) {
  const k = klasa.toLowerCase();
  if (MODELI_SKICA.has(k) && k !== 'rifle' && k !== 'everything') return k;
  if (klasa === 'The_Mona_Lisa') return 'the_mona_lisa';
  if (NAJBLIZE[klasa]) return NAJBLIZE[klasa];
  // vizuelna rima: model čiji crteži oku liče na tu stvar (samospoznaja)
  const P = window.PROFILI && window.PROFILI.klase && window.PROFILI.klase[klasa];
  if (P && P.length && P[0][1] >= 0.08) return P[0][0];
  return null;
}

// Modeli čiji crteži liče na datu klasu (vizuelne rime), po samospoznaji.
function rimeZa(klasa) {
  const P = window.PROFILI && window.PROFILI.klase && window.PROFILI.klase[klasa];
  return P ? P.filter(x => x[1] >= 0.04).map(x => x[0]) : [];
}
