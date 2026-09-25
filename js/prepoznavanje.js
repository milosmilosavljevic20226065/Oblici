// =====================================================================
//  PREPOZNAVANJE — "oko" mašine
//  ---------------------------------------------------------------------
//  Mašina gleda deo crteža na kom si upravo radio, smanji ga na mrežu
//  od 28 x 28 tačaka (784 tačke, to je sve što ona "vidi") i pušta ga
//  kroz DoodleNet: malu konvolucionu neuronsku mrežu koju je ml5.js tim
//  istrenirao na Google-ovom Quick, Draw! skupu (345 kategorija).
//
//  Težine mreže su tuđe (ml5.js / Yining Shi). Sam proračun mreže
//  (konvolucija, sažimanje, gusti slojevi) napisan je ovde, u čistom
//  JavaScript-u, bez TensorFlow-a, da bi radio svuda, i bez interneta.
// =====================================================================

const Prepoznavanje = (() => {
  let tezine = null;          // ime sloja -> Float32Array
  let klase = [];             // 345 engleskih imena kategorija
  const VEL = 28;             // mreža vidi 28 x 28
  const PLATNO = 280;         // crtamo na 280 x 280 pa uzorkujemo (kao ml5)

  // --- učitavanje težina iz modeli/doodlenet.js ----------------------
  function ucitaj() {
    if (tezine) return true;
    const D = window.DOODLENET;
    if (!D) return false;
    const bin = atob(D.tezine);
    const bajtovi = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bajtovi[i] = bin.charCodeAt(i);
    const sve = new Float32Array(bajtovi.buffer);
    tezine = {};
    let poz = 0;
    for (const [ime, oblik] of D.tezine_opis) {
      const n = oblik.reduce((a, b) => a * b, 1);
      tezine[ime] = sve.subarray(poz, poz + n);
      poz += n;
    }
    klase = D.klase;
    return true;
  }

  // --- slojevi mreže ---------------------------------------------------
  // Konvolucija 3x3, "same" okvir, korak 1, pa ReLU. Raspored podataka:
  // [red][kolona][kanal] (kao u Keras-u, channels_last).
  function konvolucija(ulaz, h, w, cin, ime) {
    const K = tezine[ime + '/kernel'];      // oblik [3, 3, cin, cout]
    const B = tezine[ime + '/bias'];
    const cout = B.length;
    const izlaz = new Float32Array(h * w * cout);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const o = (y * w + x) * cout;
        for (let co = 0; co < cout; co++) izlaz[o + co] = B[co];
        for (let ky = 0; ky < 3; ky++) {
          const yy = y + ky - 1;
          if (yy < 0 || yy >= h) continue;
          for (let kx = 0; kx < 3; kx++) {
            const xx = x + kx - 1;
            if (xx < 0 || xx >= w) continue;
            const ui = (yy * w + xx) * cin;
            const ki = (ky * 3 + kx) * cin * cout;
            for (let ci = 0; ci < cin; ci++) {
              const v = ulaz[ui + ci];
              if (v === 0) continue;
              const kk = ki + ci * cout;
              for (let co = 0; co < cout; co++) izlaz[o + co] += v * K[kk + co];
            }
          }
        }
        for (let co = 0; co < cout; co++) if (izlaz[o + co] < 0) izlaz[o + co] = 0;
      }
    }
    return izlaz;
  }

  // Sažimanje (max pooling) 2x2, korak 2.
  function sazimanje(ulaz, h, w, c) {
    const h2 = Math.floor(h / 2), w2 = Math.floor(w / 2);
    const izlaz = new Float32Array(h2 * w2 * c);
    for (let y = 0; y < h2; y++) {
      for (let x = 0; x < w2; x++) {
        for (let k = 0; k < c; k++) {
          let m = -Infinity;
          for (let dy = 0; dy < 2; dy++) {
            for (let dx = 0; dx < 2; dx++) {
              const v = ulaz[((2 * y + dy) * w + (2 * x + dx)) * c + k];
              if (v > m) m = v;
            }
          }
          izlaz[(y * w2 + x) * c + k] = m;
        }
      }
    }
    return { a: izlaz, h: h2, w: w2 };
  }

  // Gusti (potpuno povezani) sloj.
  function gust(ulaz, ime, aktivacija) {
    const K = tezine[ime + '/kernel'];
    const B = tezine[ime + '/bias'];
    const nIzl = B.length;
    const izlaz = Float32Array.from(B);
    for (let i = 0; i < ulaz.length; i++) {
      const v = ulaz[i];
      if (v === 0) continue;
      const off = i * nIzl;
      for (let j = 0; j < nIzl; j++) izlaz[j] += v * K[off + j];
    }
    if (aktivacija === 'tanh') {
      for (let j = 0; j < nIzl; j++) izlaz[j] = Math.tanh(izlaz[j]);
    } else if (aktivacija === 'softmax') {
      let max = -Infinity, zbir = 0;
      for (let j = 0; j < nIzl; j++) if (izlaz[j] > max) max = izlaz[j];
      for (let j = 0; j < nIzl; j++) { izlaz[j] = Math.exp(izlaz[j] - max); zbir += izlaz[j]; }
      for (let j = 0; j < nIzl; j++) izlaz[j] /= zbir;
    }
    return izlaz;
  }

  // Ceo prolaz kroz mrežu: 784 tačke -> 345 verovatnoća.
  function mreza(slika) {
    return gust(skriveni(slika), 'dense_1', 'softmax');             // 345
  }

  // Sve do poslednjeg sloja: 512 brojeva koji opisuju crtež ("otisak").
  // Slični crteži imaju slične otiske — na tome mašina uči nove stvari.
  function skriveni(slika) {
    let a = konvolucija(slika, 28, 28, 1, 'conv2d');
    a = konvolucija(a, 28, 28, 16, 'conv2d_1');
    let s = sazimanje(a, 28, 28, 16);                 // 14 x 14
    a = konvolucija(s.a, s.h, s.w, 16, 'conv2d_2');
    a = konvolucija(a, s.h, s.w, 32, 'conv2d_3');
    s = sazimanje(a, s.h, s.w, 32);                   // 7 x 7
    a = konvolucija(s.a, s.h, s.w, 32, 'conv2d_4');
    a = konvolucija(a, s.h, s.w, 64, 'conv2d_5');
    s = sazimanje(a, s.h, s.w, 64);                   // 3 x 3 x 64 = 576
    return gust(s.a, 'dense', 'tanh');                // 512
  }

  function normiraj(v) {
    let n = 0;
    for (let i = 0; i < v.length; i++) n += v[i] * v[i];
    n = Math.sqrt(n) || 1;
    const r = new Float32Array(v.length);
    for (let i = 0; i < v.length; i++) r[i] = v[i] / n;
    return r;
  }

  // --- od crteža do 28 x 28 ----------------------------------------------
  let platno = null;
  function rasterizuj(linije) {
    if (!platno) {
      platno = document.createElement('canvas');
      platno.width = platno.height = PLATNO;
    }
    const ctx = platno.getContext('2d', { willReadFrequently: true });
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, PLATNO, PLATNO);

    // okvir svih tačaka
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const l of linije) for (const p of l) {
      if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0];
      if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1];
    }
    const slika = new Float32Array(VEL * VEL);
    if (!isFinite(x0)) return slika;

    // crtež se centrira i razvuče preko cele mreže (ostavi se jedno polje
    // ivice), jer su tako izgledale sličice na kojima je mreža učila
    const korak = PLATNO / VEL;             // 10 piksela = jedno polje mreže
    const margina = korak;
    const mera = Math.max(x1 - x0, y1 - y0, 1);
    const k = (PLATNO - 2 * margina) / mera;
    const ox = (PLATNO - (x1 - x0) * k) / 2 - x0 * k;
    const oy = (PLATNO - (y1 - y0) * k) / 2 - y0 * k;

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const l of linije) {
      if (!l.length) continue;
      ctx.beginPath();
      ctx.moveTo(l[0][0] * k + ox, l[0][1] * k + oy);
      if (l.length === 1) ctx.lineTo(l[0][0] * k + ox + 0.1, l[0][1] * k + oy);
      for (let i = 1; i < l.length; i++) ctx.lineTo(l[i][0] * k + ox, l[i][1] * k + oy);
      ctx.stroke();
    }

    // Svako polje mreže = prosek 10 x 10 piksela (0 = papir, 1 = mastilo).
    // (Isprobano na probnim crtežima: ovako mreža pogađa 11 od 12,
    //  a sa ml5 načinom uzorkovanja 9 od 12.)
    const px = ctx.getImageData(0, 0, PLATNO, PLATNO).data;
    for (let y = 0; y < VEL; y++) {
      for (let x = 0; x < VEL; x++) {
        let z = 0;
        for (let yy = 0; yy < korak; yy++) {
          for (let xx = 0; xx < korak; xx++) {
            z += 1 - px[((y * korak + yy) * PLATNO + x * korak + xx) * 4] / 255;
          }
        }
        slika[y * VEL + x] = z / (korak * korak);
      }
    }
    return slika;
  }

  // --- javno: prepoznaj --------------------------------------------------
  // linije: niz izlomljenih linija [[x, y], ...] u logičkim jedinicama ekrana.
  function prepoznaj(linije) {
    if (!ucitaj()) return null;
    const slika = rasterizuj(linije);
    const h = skriveni(slika);
    const p = gust(h, 'dense_1', 'softmax');
    const redosled = Array.from(p.keys()).sort((a, b) => p[b] - p[a]);
    const top = redosled.slice(0, 5).map(i => ({ klasa: klase[i], p: p[i] }));
    return { verovatnoce: p, klase, top, slika, otisak: normiraj(h) };
  }

  // samo otisak crteža (512 brojeva, dužine 1)
  function otisak(linije) {
    if (!ucitaj()) return null;
    return normiraj(skriveni(rasterizuj(linije)));
  }

  // Koliko crtež liči na date klase (zbir verovatnoća, najviše 1).
  // Tako mašina ocenjuje svoje zamišljene varijante.
  let indeksi = null;
  function slicnost(linije, imenaKlasa) {
    if (!ucitaj() || !imenaKlasa.length) return 0;
    if (!indeksi) { indeksi = {}; klase.forEach((k, i) => { indeksi[k] = i; }); }
    const p = mreza(rasterizuj(linije));
    let s = 0;
    for (const k of imenaKlasa) if (indeksi[k] !== undefined) s += p[indeksi[k]];
    return Math.min(1, s);
  }

  return { ucitaj, prepoznaj, slicnost, otisak, mreza, rasterizuj, get spremno() { return !!tezine; } };
})();
