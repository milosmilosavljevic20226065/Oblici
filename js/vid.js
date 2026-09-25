// =====================================================================
//  VID — kako mašina gleda sliku sa kamere
//  ---------------------------------------------------------------------
//  Kamera daje piksele, a Sketchpad zna samo za LINIJE. Zato mašina
//  sliku prvo pretvori u linije, na dva načina:
//
//   IVICE   gde se svetlina naglo menja, tu je ivica (Kenijev postupak,
//           J. Canny, 1986: zamućenje, Sobelov gradijent, stanjivanje,
//           dvostruki prag). Ivice se zatim prate piksel po piksel i
//           spajaju u izlomljene linije.
//   OBLICI  sliku podeli na "ono" i "pozadinu" (oblak i nebo, mrlja i
//           zid): Otsuov prag (N. Otsu, 1979) na belini, svetlini ili
//           tami, pa izdvoji povezane oblasti i obiđe im obris
//           (marširajući kvadrati, W. Lorensen i H. Cline, 1987).
//
//  Sve je napisano u čistom JavaScript-u, bez biblioteka.
// =====================================================================

const Vid = (() => {
  // --- svetlina i "belina" ---------------------------------------------------
  function siva(rgba, w, h) {
    const g = new Float32Array(w * h);
    for (let i = 0, j = 0; i < g.length; i++, j += 4) g[i] = 0.299 * rgba[j] + 0.587 * rgba[j + 1] + 0.114 * rgba[j + 2];
    return g;
  }

  // belina: svetlo i bez boje (oblak) nasuprot plavom nebu
  function belina(rgba, w, h) {
    const g = new Float32Array(w * h);
    for (let i = 0, j = 0; i < g.length; i++, j += 4) {
      const r = rgba[j], gg = rgba[j + 1], b = rgba[j + 2];
      const mx = Math.max(r, gg, b), mn = Math.min(r, gg, b);
      const L = (mx + mn) / 510, S = (mx - mn) / 255;
      g[i] = 255 * Math.max(0, Math.min(1, L - 0.9 * S + 0.35));
    }
    return g;
  }

  // zamućenje (binomno 1-2-1, horizontalno pa vertikalno), n prolaza
  function zamuti(g, w, h, n = 1) {
    let a = g, b = new Float32Array(g.length);
    for (let k = 0; k < n; k++) {
      for (let y = 0; y < h; y++) {
        const o = y * w;
        for (let x = 0; x < w; x++) {
          const l = a[o + Math.max(0, x - 1)], d = a[o + Math.min(w - 1, x + 1)];
          b[o + x] = (l + 2 * a[o + x] + d) * 0.25;
        }
      }
      for (let y = 0; y < h; y++) {
        const g0 = Math.max(0, y - 1) * w, g1 = y * w, g2 = Math.min(h - 1, y + 1) * w;
        for (let x = 0; x < w; x++) a[g1 + x] = (b[g0 + x] + 2 * b[g1 + x] + b[g2 + x]) * 0.25;
      }
    }
    return a;
  }

  // --- IVICE (Canny) -----------------------------------------------------------
  //  osetljivost 0..1: koliko ivica prolazi (veće = više linija)
  function ivice(g, w, h, osetljivost = 0.5) {
    const n = w * h;
    const mag = new Float32Array(n), smer = new Uint8Array(n);
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        const a = g[i - w - 1], b = g[i - w], c = g[i - w + 1];
        const d = g[i - 1], f = g[i + 1];
        const p = g[i + w - 1], q = g[i + w], r = g[i + w + 1];
        const gx = (c + 2 * f + r) - (a + 2 * d + p);
        const gy = (p + 2 * q + r) - (a + 2 * b + c);
        mag[i] = Math.hypot(gx, gy);
        let u = Math.atan2(gy, gx);
        if (u < 0) u += Math.PI;
        smer[i] = u < Math.PI / 8 || u >= 7 * Math.PI / 8 ? 0 : u < 3 * Math.PI / 8 ? 1 : u < 5 * Math.PI / 8 ? 2 : 3;
      }
    }
    // stanjivanje: ostaje samo vrh gradijenta
    const tanko = new Float32Array(n);
    const pomeraji = [[1, 0], [1, 1], [0, 1], [-1, 1]];
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = y * w + x, m = mag[i];
        if (m < 1) continue;
        const [dx, dy] = pomeraji[smer[i]];
        if (m >= mag[i + dy * w + dx] && m >= mag[i - dy * w - dx]) tanko[i] = m;
      }
    }
    // pragovi iz raspodele jačina (prilagođava se svakoj slici)
    const uzorak = [];
    for (let i = 0; i < n; i += 3) if (tanko[i] > 0) uzorak.push(tanko[i]);
    uzorak.sort((a, b) => a - b);
    const q = uzorak.length ? uzorak[Math.floor(uzorak.length * (0.93 - 0.25 * osetljivost))] : 60;
    const visok = Math.max(28, q), nizak = visok * 0.45;
    // dvostruki prag: jake ivice + slabe koje se na njih nastavljaju
    const e = new Uint8Array(n);
    const stek = [];
    for (let i = 0; i < n; i++) if (tanko[i] >= visok) { e[i] = 1; stek.push(i); }
    while (stek.length) {
      const i = stek.pop();
      const x = i % w, y = (i - x) / w;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const X = x + dx, Y = y + dy;
        if (X < 1 || Y < 1 || X >= w - 1 || Y >= h - 1) continue;
        const j = Y * w + X;
        if (!e[j] && tanko[j] >= nizak) { e[j] = 1; stek.push(j); }
      }
    }
    return e;
  }

  // ivice -> izlomljene linije (prati susede piksel po piksel)
  const SUSEDI = [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, 1], [-1, -1], [1, -1]];
  function lanci(e, w, h, minDuz = 8) {
    const vid = new Uint8Array(e.length);
    const rez = [];
    const idi = (pocetak) => {
      const t = [];
      let i = pocetak;
      for (;;) {
        const x = i % w, y = (i - x) / w;
        let dalje = -1;
        for (const [dx, dy] of SUSEDI) {
          const X = x + dx, Y = y + dy;
          if (X < 0 || Y < 0 || X >= w || Y >= h) continue;
          const j = Y * w + X;
          if (e[j] && !vid[j]) { dalje = j; break; }
        }
        if (dalje < 0) break;
        vid[dalje] = 1;
        t.push([dalje % w, Math.floor(dalje / w)]);
        i = dalje;
      }
      return t;
    };
    for (let i = 0; i < e.length; i++) {
      if (!e[i] || vid[i]) continue;
      vid[i] = 1;
      const napred = idi(i);
      const nazad = idi(i);
      const t = nazad.reverse().concat([[i % w, Math.floor(i / w)]], napred);
      if (t.length >= minDuz) rez.push(Geo.rdp(t, 0.9));
    }
    return rez;
  }

  // --- OBLICI ---------------------------------------------------------------
  function otsu(v) {
    const hist = new Float64Array(256);
    for (let i = 0; i < v.length; i++) hist[Math.max(0, Math.min(255, v[i] | 0))]++;
    const n = v.length;
    let zbir = 0;
    for (let t = 0; t < 256; t++) zbir += t * hist[t];
    let zB = 0, wB = 0, naj = 0, prag = 128;
    for (let t = 0; t < 256; t++) {
      wB += hist[t];
      if (!wB) continue;
      const wF = n - wB;
      if (!wF) break;
      zB += t * hist[t];
      const mB = zB / wB, mF = (zbir - zB) / wF;
      const izmedju = wB * wF * (mB - mF) * (mB - mF);
      if (izmedju > naj) { naj = izmedju; prag = t; }
    }
    return prag;
  }

  // povezane oblasti maske (4-susedstvo)
  function oblasti(mask, w, h) {
    const oznake = new Int32Array(w * h);
    const oblasti = [];
    let id = 0;
    const stek = [];
    for (let i = 0; i < mask.length; i++) {
      if (!mask[i] || oznake[i]) continue;
      id++;
      let pov = 0, x0 = w, y0 = h, x1 = 0, y1 = 0, ivica = 0, sx = 0, sy = 0;
      oznake[i] = id; stek.push(i);
      while (stek.length) {
        const j = stek.pop();
        const x = j % w, y = (j - x) / w;
        pov++; sx += x; sy += y;
        if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
        if (x === 0 || y === 0 || x === w - 1 || y === h - 1) ivica++;
        if (x > 0 && mask[j - 1] && !oznake[j - 1]) { oznake[j - 1] = id; stek.push(j - 1); }
        if (x < w - 1 && mask[j + 1] && !oznake[j + 1]) { oznake[j + 1] = id; stek.push(j + 1); }
        if (y > 0 && mask[j - w] && !oznake[j - w]) { oznake[j - w] = id; stek.push(j - w); }
        if (y < h - 1 && mask[j + w] && !oznake[j + w]) { oznake[j + w] = id; stek.push(j + w); }
      }
      oblasti.push({ id, povrsina: pov, okvir: { x0, y0, x1, y1, w: x1 - x0 + 1, h: y1 - y0 + 1 }, ivica, cx: sx / pov, cy: sy / pov });
    }
    return { oznake, oblasti };
  }

  // obris oblasti: marširajući kvadrati po njenoj maski, spojeni u petlje
  function obris(oznake, w, h, obl) {
    const { x0, y0, x1, y1 } = obl.okvir;
    const X0 = x0 - 1, Y0 = y0 - 1, W = x1 - x0 + 3, H = y1 - y0 + 3;
    const u = (x, y) => {
      const X = x + X0, Y = y + Y0;
      return X >= 0 && Y >= 0 && X < w && Y < h && oznake[Y * w + X] === obl.id ? 1 : 0;
    };
    // segmenti: svaka ćelija 2x2 daje 0, 1 ili 2 duži između sredina ivica ćelije
    const kraj = new Map();                        // tačka -> [susedi]
    const kljuc = (x, y) => x * 2 + ',' + y * 2;
    const dodaj = (a, b) => {
      const ka = kljuc(a[0], a[1]), kb = kljuc(b[0], b[1]);
      if (!kraj.has(ka)) kraj.set(ka, { p: a, s: [] });
      if (!kraj.has(kb)) kraj.set(kb, { p: b, s: [] });
      kraj.get(ka).s.push(kb); kraj.get(kb).s.push(ka);
    };
    for (let y = 0; y < H - 1; y++) {
      for (let x = 0; x < W - 1; x++) {
        const a = u(x, y), b = u(x + 1, y), c = u(x + 1, y + 1), d = u(x, y + 1);
        const k = a * 8 + b * 4 + c * 2 + d;
        if (k === 0 || k === 15) continue;
        const G = [x + 0.5, y], D = [x + 1, y + 0.5], Do = [x + 0.5, y + 1], L = [x, y + 0.5];
        switch (k) {
          case 1: case 14: dodaj(L, Do); break;
          case 2: case 13: dodaj(Do, D); break;
          case 3: case 12: dodaj(L, D); break;
          case 4: case 11: dodaj(G, D); break;
          case 6: case 9: dodaj(G, Do); break;
          case 7: case 8: dodaj(L, G); break;
          case 5: dodaj(L, G); dodaj(Do, D); break;
          case 10: dodaj(G, D); dodaj(L, Do); break;
        }
      }
    }
    // spoji segmente u petlje, vrati najdužu (spoljni obris)
    const vidjen = new Set();
    let naj = [];
    for (const [k0] of kraj) {
      if (vidjen.has(k0)) continue;
      const petlja = [];
      let k = k0, pret = null;
      for (let guard = 0; guard < 100000; guard++) {
        vidjen.add(k);
        const t = kraj.get(k);
        petlja.push([t.p[0] + X0, t.p[1] + Y0]);
        const dalje = t.s.find(s => s !== pret && !vidjen.has(s)) || null;
        if (!dalje) break;
        pret = k; k = dalje;
      }
      if (petlja.length > naj.length) naj = petlja;
    }
    return naj;
  }

  // Maska oblika: probaj belinu (oblaci), svetlo i tamno (mrlje, senke),
  // i uzmi onu koja daje najbolje "predmete" (ne dodiruju ivicu slike,
  // nisu ni sitni ni ogromni).
  function oblici(rgba, w, h, izvori = ['belina', 'svetlo', 'tamno']) {
    const n = w * h;
    const polja = {};
    const L = zamuti(siva(rgba, w, h), w, h, 2);
    if (izvori.includes('belina')) polja.belina = zamuti(belina(rgba, w, h), w, h, 2);
    if (izvori.includes('svetlo') || izvori.includes('tamno')) polja.svetlo = L;
    let najbolje = null;
    const probe = [];
    for (const izvor of izvori) {
      const v = izvor === 'tamno' ? polja.svetlo : polja[izvor];
      if (!v) continue;
      const p0 = otsu(v);
      // i strožiji prag: razdvaja oblake koji su se stopili u jedan
      probe.push([izvor, v, p0], [izvor, v, izvor === 'tamno' ? p0 * 0.72 : p0 + (255 - p0) * 0.3]);
      if (izvor !== 'tamno') probe.push([izvor, v, p0 + (255 - p0) * 0.55]);     // samo najsvetlija jezgra
    }
    for (const [izvor, v, prag] of probe) {
      const mask = new Uint8Array(n);
      let broj = 0;
      for (let i = 0; i < n; i++) {
        const u = izvor === 'tamno' ? v[i] < prag : v[i] > prag;
        if (u) { mask[i] = 1; broj++; }
      }
      if (broj < n * 0.03 || broj > n * 0.85) continue;
      const { oznake, oblasti: sve } = oblasti(mask, w, h);
      const dobre = sve.filter(o => o.povrsina >= n * 0.008 && o.povrsina <= n * 0.7);
      if (!dobre.length) continue;
      let ocena = 0;
      for (const o of dobre) {
        const obod = 2 * (o.okvir.w + o.okvir.h);
        ocena += o.povrsina * (1 - Math.min(1, o.ivica / (obod * 0.35)));
      }
      ocena /= n;
      if (izvor === 'belina') ocena *= 1.15;       // oblaci su povod za ovu aplikaciju
      if (!najbolje || ocena > najbolje.ocena) najbolje = { izvor, ocena, oznake, oblasti: dobre, w, h };
    }
    if (!najbolje) return { izvor: null, oblici: [] };
    const rez = najbolje.oblasti
      .sort((a, b) => b.povrsina - a.povrsina)
      .slice(0, 6)
      .map(o => {
        const t = obris(najbolje.oznake, w, h, o);
        const vel = Math.max(o.okvir.w, o.okvir.h);
        return Object.assign(o, { obris: t.length > 8 ? Geo.rdp(t.concat([t[0]]), Math.max(0.6, vel * 0.012)) : [] });
      })
      .filter(o => o.obris.length > 5);
    return { izvor: najbolje.izvor, oblici: rez, oznake: najbolje.oznake };
  }

  // --- pomeranje kamere između dva kadra (grubo praćenje) -----------------------
  //  Poredi dve male sive slike za sve pomake do ±max piksela i vraća
  //  onaj za koji se najbolje poklapaju.
  function pomak(a, b, w, h, max = 7) {
    let naj = [0, 0], min = Infinity;
    for (let dy = -max; dy <= max; dy++) {
      for (let dx = -max; dx <= max; dx++) {
        let s = 0, n = 0;
        for (let y = max; y < h - max; y += 2) {
          const oa = y * w, ob = (y + dy) * w + dx;
          for (let x = max; x < w - max; x += 2) { s += Math.abs(a[oa + x] - b[ob + x]); n++; }
        }
        s /= n;
        if (s < min) { min = s; naj = [dx, dy]; }
      }
    }
    return { dx: naj[0], dy: naj[1], greska: min };
  }

  // grubo pa fino: prvo na upola manjoj slici (veći domet), pa tačnije
  function umanji(a, w, h) {
    const w2 = w >> 1, h2 = h >> 1, r = new Float32Array(w2 * h2);
    for (let y = 0; y < h2; y++) for (let x = 0; x < w2; x++) {
      const i = 2 * y * w + 2 * x;
      r[y * w2 + x] = (a[i] + a[i + 1] + a[i + w] + a[i + w + 1]) * 0.25;
    }
    return { a: r, w: w2, h: h2 };
  }
  function pomakFino(a, b, w, h, x0, y0, r) {
    let naj = [x0, y0], min = Infinity;
    const m = Math.max(Math.abs(x0), Math.abs(y0)) + r;
    for (let dy = y0 - r; dy <= y0 + r; dy++) {
      for (let dx = x0 - r; dx <= x0 + r; dx++) {
        let s = 0, n = 0;
        for (let y = m; y < h - m; y += 2) {
          const oa = y * w, ob = (y + dy) * w + dx;
          for (let x = m; x < w - m; x += 2) { s += Math.abs(a[oa + x] - b[ob + x]); n++; }
        }
        if (!n) continue;
        s /= n;
        if (s < min) { min = s; naj = [dx, dy]; }
      }
    }
    return { dx: naj[0], dy: naj[1], greska: min };
  }
  function pomakPiramida(a, b, w, h) {
    const A = umanji(a, w, h), B = umanji(b, w, h);
    const grubo = pomak(A.a, B.a, A.w, A.h, 7);
    return pomakFino(a, b, w, h, grubo.dx * 2, grubo.dy * 2, 2);
  }

  return { siva, belina, zamuti, ivice, lanci, otsu, oblasti, obris, oblici, pomak, pomakPiramida };
})();
