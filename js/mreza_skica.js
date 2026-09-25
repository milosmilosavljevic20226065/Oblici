// =====================================================================
//  MREŽA SKICA — "ruka" mašine (sketch-rnn)
//  ---------------------------------------------------------------------
//  sketch-rnn (David Ha i Douglas Eck, Google Magenta, 2017) je
//  rekurentna mreža (LSTM) koja crtež vidi kao niz pokreta olovke:
//  [pomak x, pomak y, olovka dole, olovka gore, kraj crteža].
//  Posle svakog pokreta ona ne kaže JEDAN sledeći potez, nego čitavu
//  raspodelu mogućih poteza (mešavina 20 Gausovih "oblaka"), pa se
//  sledeći potez IZVLAČI iz te raspodele. Zato mašina svaki put crta
//  malo drugačije. Parametar "temperatura" (dugme MAŠTA) određuje
//  koliko sme da skrene od najverovatnijeg.
//
//  Težine su Google-ove (unapred istrenirani modeli, jedan po motivu).
//  Proračun mreže (LSTM korak, raspodela, uzorkovanje) je napisan ovde,
//  u čistom JavaScript-u.
// =====================================================================

class MrezaSkica {
  constructor(podaci) {
    const info = podaci[0];
    const dim = podaci[1];
    const blobovi = podaci[2];
    this.info = info;
    this.ime = info.name;
    this.skala = info.scale_factor;              // normalizacija pokreta
    this.maxDuzina = info.max_seq_len || 250;

    const gen = (info.mode === 2 || info.mode === 'gen');
    if (!gen) throw new Error('Podržani su samo .gen modeli');
    const W = blobovi.map(s => MrezaSkica.dekodiraj(s));
    this.izlazW = W[0];                          // [u, 3 + 6*M]
    this.izlazB = W[1];
    this.Wxh = W[2];                             // [ulaz, 4u]
    this.Whh = W[3];                             // [u, 4u]
    this.b = W[4];                               // [4u]
    this.u = dim[3][0];
    this.nUlaz = dim[2][0];
    this.nIzlaz = dim[0][1];
    this.M = (this.nIzlaz - 3) / 6;              // broj Gausovih komponenti
    this.g = new Float32Array(4 * this.u);
  }

  // Težine su spakovane kao 16-bitni celi brojevi u base64.
  static dekodiraj(b64) {
    const bin = atob(b64);
    const u8 = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    const i16 = new Int16Array(u8.buffer, 0, u8.length >> 1);
    const f = new Float32Array(i16.length);
    for (let i = 0; i < i16.length; i++) f[i] = i16[i] / 32767 * 10;
    return f;
  }

  pocetnoStanje() {
    return { h: new Float32Array(this.u), c: new Float32Array(this.u) };
  }

  // Jedan korak LSTM-a: mreža "pročita" jedan pokret olovke i ažurira
  // svoje unutrašnje pamćenje (h = kratko, c = dugo pamćenje).
  korak(stanje, pokret) {
    const u = this.u, n4 = 4 * u, g = this.g;
    g.set(this.b);
    const x = [pokret[0] / this.skala, pokret[1] / this.skala, pokret[2], pokret[3], pokret[4]];
    for (let r = 0; r < this.nUlaz; r++) {
      const v = r < 5 ? x[r] : 0;
      if (v === 0) continue;
      const off = r * n4, W = this.Wxh;
      for (let k = 0; k < n4; k++) g[k] += v * W[off + k];
    }
    const h = stanje.h, Whh = this.Whh;
    for (let r = 0; r < u; r++) {
      const v = h[r];
      if (v === 0) continue;
      const off = r * n4;
      for (let k = 0; k < n4; k++) g[k] += v * Whh[off + k];
    }
    const h2 = new Float32Array(u), c2 = new Float32Array(u), c = stanje.c;
    for (let k = 0; k < u; k++) {
      const ul = sigmoida(g[k]);                 // ulazna kapija
      const nov = Math.tanh(g[u + k]);           // novi sadržaj
      const zab = sigmoida(g[2 * u + k] + 1.0);  // kapija zaboravljanja
      const izl = sigmoida(g[3 * u + k]);        // izlazna kapija
      c2[k] = c[k] * zab + nov * ul;
      h2[k] = Math.tanh(c2[k]) * izl;
    }
    return { h: h2, c: c2 };
  }

  // Iz pamćenja pravi raspodelu za sledeći pokret.
  raspodela(stanje) {
    const u = this.u, n = this.nIzlaz, M = this.M, W = this.izlazW;
    const z = Float32Array.from(this.izlazB);
    const h = stanje.h;
    for (let r = 0; r < u; r++) {
      const v = h[r];
      if (v === 0) continue;
      const off = r * n;
      for (let k = 0; k < n; k++) z[k] += v * W[off + k];
    }
    const deo = (a, b) => Array.from(z.subarray(a, b));
    return {
      olovka: softmaks(deo(0, 3)),
      pi: softmaks(deo(3, 3 + M)),
      mu1: deo(3 + M, 3 + 2 * M),
      mu2: deo(3 + 2 * M, 3 + 3 * M),
      s1: deo(3 + 3 * M, 3 + 4 * M).map(Math.exp),
      s2: deo(3 + 4 * M, 3 + 5 * M).map(Math.exp),
      rho: deo(3 + 5 * M, 3 + 6 * M).map(Math.tanh),
    };
  }

  // Izvlačenje sledećeg pokreta iz raspodele.
  uzorak(r, temp) {
    const st = 0.5 + temp * 0.5;
    const pi = podesiTemperaturu(r.pi, st);
    const ol = podesiTemperaturu(r.olovka, st);
    const i = izaberi(pi);
    const s1 = r.s1[i] * Math.sqrt(temp), s2 = r.s2[i] * Math.sqrt(temp), rho = r.rho[i];
    const n1 = gaus(), n2 = gaus();
    const dx = r.mu1[i] + s1 * n1;
    const dy = r.mu2[i] + s2 * (rho * n1 + Math.sqrt(Math.max(0, 1 - rho * rho)) * n2);
    const o = izaberi(ol);
    return [dx * this.skala, dy * this.skala, o === 0 ? 1 : 0, o === 1 ? 1 : 0, o === 2 ? 1 : 0];
  }
}

function sigmoida(x) { return 1 / (1 + Math.exp(-x)); }

function softmaks(a) {
  const m = Math.max(...a);
  const e = a.map(v => Math.exp(v - m));
  const s = e.reduce((x, y) => x + y, 0);
  return e.map(v => v / s);
}

function podesiTemperaturu(p, t) {
  const l = p.map(v => Math.log(Math.max(v, 1e-12)) / t);
  return softmaks(l);
}

function izaberi(p) {
  let x = Math.random(), s = 0;
  for (let i = 0; i < p.length; i++) { s += p[i]; if (s >= x) return i; }
  return p.length - 1;
}

function gaus() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// ---------------------------------------------------------------------
//  Pretvaranje crteža u pokrete i nazad
// ---------------------------------------------------------------------
//  Linije su u "QD" jedinicama (koordinate u kojima je mreža učila,
//  crtež od oko 256 jedinica). Vraća niz pokreta u formatu mreže.
function linijeUPokrete(linije) {
  const pokreti = [];
  let px = 0, py = 0, prvi = true;
  for (const l of linije) {
    if (l.length < 2) continue;
    for (let j = 0; j < l.length; j++) {
      const [x, y] = l[j];
      const kraj = j === l.length - 1;
      if (!prvi) pokreti.push([x - px, y - py, kraj ? 0 : 1, kraj ? 1 : 0, 0]);
      prvi = false;
      px = x; py = y;
    }
  }
  return { pokreti, poslednja: [px, py] };
}

// Mašina "pročita" postojeće linije, pa nastavlja crtež.
// Vraća nove linije u QD jedinicama. Radi u delovima (async) da se
// ekran ne zamrzne dok mreža računa.
// Mreža "pročita" postojeće linije (to je najskuplji deo). Pročitano
// pamćenje se može iskoristiti za više varijanti: korak() ne menja staro
// stanje, nego vraća novo, pa sve varijante kreću iz istog pamćenja.
async function pripremiCrtez(model, linije) {
  let stanje = model.pocetnoStanje();
  stanje = model.korak(stanje, [0, 0, 0, 0, 0]);
  const { pokreti, poslednja } = linijeUPokrete(linije);
  const pocetak = pokreti.length > 120 ? pokreti.length - 120 : 0;
  let brojac = 0;
  for (let i = pocetak; i < pokreti.length; i++) {
    stanje = model.korak(stanje, pokreti[i]);
    if (++brojac % 25 === 0) await predah();
  }
  return { model, stanje, poslednja, imaPokreta: pokreti.length > 0 };
}

async function nastaviCrtez(model, linije, opcije) {
  const temp = opcije.temperatura ?? 0.45;
  const maxPoteza = opcije.maxPoteza ?? 4;
  const maxKoraka = opcije.maxKoraka ?? 160;
  const prip = (opcije.priprema && opcije.priprema.model === model) ? opcije.priprema : await pripremiCrtez(model, linije);
  let stanje = prip.stanje;
  const pokreti = { length: prip.imaPokreta ? 1 : 0 };
  const poslednja = prip.poslednja;

  const nove = [];
  let [x, y] = poslednja;
  let prethodna = pokreti.length ? [0, 1, 0] : [1, 0, 0];
  let tekuca = pokreti.length ? null : [[x, y]];
  let zavrsenih = 0;
  for (let k = 0; k < maxKoraka; k++) {
    const r = model.raspodela(stanje);
    const p = model.uzorak(r, temp);
    if (p[4] === 1) break;                               // mreža kaže: gotovo
    const nx = x + p[0], ny = y + p[1];
    if (prethodna[0] === 1) {
      if (!tekuca) tekuca = [[x, y]];
      tekuca.push([nx, ny]);
    } else {
      if (tekuca && tekuca.length > 1) nove.push(tekuca);
      tekuca = [[nx, ny]];
    }
    if (p[3] === 1) {                                    // olovka se diže
      if (tekuca && tekuca.length > 1) { nove.push(tekuca); zavrsenih++; }
      tekuca = null;
      if (zavrsenih >= maxPoteza) break;
    }
    prethodna = [p[2], p[3], p[4]];
    stanje = model.korak(stanje, p);
    x = nx; y = ny;
    if (k % 20 === 19) await predah();
  }
  if (tekuca && tekuca.length > 1) nove.push(tekuca);
  return nove;
}

// Nov crtež od nule (bez ičega na ulazu).
async function nacrtajOdNule(model, opcije) {
  return nastaviCrtez(model, [], opcije);
}

function predah() { return new Promise(r => setTimeout(r, 0)); }
