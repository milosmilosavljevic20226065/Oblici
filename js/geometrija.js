// =====================================================================
//  GEOMETRIJA — elementi crteža i račun sa njima
//  ---------------------------------------------------------------------
//  Kao u Sketchpadu, crtež nije slika od piksela nego spisak elemenata:
//    linija  { tacke: [[x,y],...], zatvoren }   (izlomljena linija)
//    krug    { cx, cy, r }
//    luk     { cx, cy, r, a0, ugao }             (a0 početni ugao, ugao = zahvat)
//  Sve koordinate su u "rasteru" 1024 x 1024, koliko je imao ekran TX-2.
// =====================================================================

const Geo = (() => {
  let brojac = 0;
  const RASTER = 1024;

  function element(tip, podaci, autor, potez) {
    return Object.assign({ id: ++brojac, tip, autor, potez }, podaci);
  }

  const raz = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

  function doDuzi(p, a, b) {
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const l2 = dx * dx + dy * dy;
    let t = l2 ? ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2 : 0;
    t = Math.max(0, Math.min(1, t));
    const q = [a[0] + t * dx, a[1] + t * dy];
    return { d: raz(p, q), t, q };
  }

  // Ramer–Douglas–Peucker: od drhtave linije ostavlja samo bitne tačke.
  function rdp(tacke, eps) {
    if (tacke.length < 3) return tacke.slice();
    let max = 0, idx = 0;
    const a = tacke[0], b = tacke[tacke.length - 1];
    for (let i = 1; i < tacke.length - 1; i++) {
      const d = doDuzi(tacke[i], a, b).d;
      if (d > max) { max = d; idx = i; }
    }
    if (max > eps) {
      const l = rdp(tacke.slice(0, idx + 1), eps);
      const d = rdp(tacke.slice(idx), eps);
      return l.slice(0, -1).concat(d);
    }
    return [a, b];
  }

  function okvir(tacke) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const p of tacke) {
      if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0];
      if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1];
    }
    return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
  }

  // Tačke po obodu kruga/luka (za prikaz, prepoznavanje, izvoz).
  function tackeLuka(cx, cy, r, a0, ugao, n) {
    const t = [];
    for (let i = 0; i <= n; i++) {
      const a = a0 + ugao * i / n;
      t.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
    return t;
  }

  // Element -> izlomljena linija (preciznost = dužina jednog dela luka).
  function uLiniju(el, preciznost = 10) {
    if (el.tip === 'linija') {
      return el.zatvoren ? el.tacke.concat([el.tacke[0]]) : el.tacke.slice();
    }
    const ugao = el.tip === 'krug' ? Math.PI * 2 : el.ugao;
    const a0 = el.tip === 'krug' ? (el.a0 || 0) : el.a0;
    const n = Math.max(8, Math.ceil(Math.abs(ugao) * el.r / preciznost));
    return tackeLuka(el.cx, el.cy, el.r, a0, ugao, n);
  }

  function okvirElementa(el) {
    if (el.tip === 'krug') return { x0: el.cx - el.r, y0: el.cy - el.r, x1: el.cx + el.r, y1: el.cy + el.r, w: 2 * el.r, h: 2 * el.r, cx: el.cx, cy: el.cy };
    return okvir(uLiniju(el, 6));
  }

  function okvirElemenata(els) {
    if (!els.length) return null;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const el of els) {
      const o = okvirElementa(el);
      x0 = Math.min(x0, o.x0); y0 = Math.min(y0, o.y0);
      x1 = Math.max(x1, o.x1); y1 = Math.max(y1, o.y1);
    }
    return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
  }

  function duzina(tacke) {
    let s = 0;
    for (let i = 1; i < tacke.length; i++) s += raz(tacke[i - 1], tacke[i]);
    return s;
  }

  // Afina transformacija: x' = a x + c y + e,  y' = b x + d y + f
  const T = {
    ogledaloX: (osa) => ({ a: -1, b: 0, c: 0, d: 1, e: 2 * osa, f: 0 }),
    ogledaloY: (osa) => ({ a: 1, b: 0, c: 0, d: -1, e: 0, f: 2 * osa }),
    pomak: (dx, dy) => ({ a: 1, b: 0, c: 0, d: 1, e: dx, f: dy }),
    rotacija: (u, cx, cy) => {
      const c = Math.cos(u), s = Math.sin(u);
      return { a: c, b: s, c: -s, d: c, e: cx - c * cx + s * cy, f: cy - s * cx - c * cy };
    },
    skala: (k, cx, cy) => ({ a: k, b: 0, c: 0, d: k, e: cx - k * cx, f: cy - k * cy }),
    // prvo m1, pa m2
    spoj: (m1, m2) => ({
      a: m2.a * m1.a + m2.c * m1.b, b: m2.b * m1.a + m2.d * m1.b,
      c: m2.a * m1.c + m2.c * m1.d, d: m2.b * m1.c + m2.d * m1.d,
      e: m2.a * m1.e + m2.c * m1.f + m2.e, f: m2.b * m1.e + m2.d * m1.f + m2.f,
    }),
  };
  const primeni = (m, p) => [m.a * p[0] + m.c * p[1] + m.e, m.b * p[0] + m.d * p[1] + m.f];

  function transformisi(el, m, autor, potez) {
    const det = m.a * m.d - m.b * m.c;
    const k = Math.sqrt(Math.abs(det));
    const baza = { autor: autor ?? el.autor, potez: potez ?? el.potez };
    if (el.tip === 'linija') {
      return element('linija', { tacke: el.tacke.map(p => primeni(m, p)), zatvoren: el.zatvoren }, baza.autor, baza.potez);
    }
    const c = primeni(m, [el.cx, el.cy]);
    if (el.tip === 'krug') return element('krug', { cx: c[0], cy: c[1], r: el.r * k }, baza.autor, baza.potez);
    const p0 = primeni(m, [el.cx + el.r * Math.cos(el.a0), el.cy + el.r * Math.sin(el.a0)]);
    const a0 = Math.atan2(p0[1] - c[1], p0[0] - c[0]);
    return element('luk', { cx: c[0], cy: c[1], r: el.r * k, a0, ugao: det < 0 ? -el.ugao : el.ugao }, baza.autor, baza.potez);
  }

  // Najbolji krug kroz tačke (metod najmanjih kvadrata, Kåsa).
  function krugKroz(tacke) {
    const n = tacke.length;
    if (n < 5) return null;
    let sx = 0, sy = 0;
    for (const p of tacke) { sx += p[0]; sy += p[1]; }
    const mx = sx / n, my = sy / n;
    let suu = 0, svv = 0, suv = 0, suuu = 0, svvv = 0, suvv = 0, svuu = 0;
    for (const p of tacke) {
      const u = p[0] - mx, v = p[1] - my;
      suu += u * u; svv += v * v; suv += u * v;
      suuu += u * u * u; svvv += v * v * v; suvv += u * v * v; svuu += v * u * u;
    }
    const det = suu * svv - suv * suv;
    if (Math.abs(det) < 1e-9) return null;
    const b1 = 0.5 * (suuu + suvv), b2 = 0.5 * (svvv + svuu);
    const uc = (b1 * svv - b2 * suv) / det, vc = (suu * b2 - suv * b1) / det;
    const cx = uc + mx, cy = vc + my;
    const r = Math.sqrt(uc * uc + vc * vc + (suu + svv) / n);
    let g = 0;
    for (const p of tacke) g += Math.abs(raz(p, [cx, cy]) - r);
    return { cx, cy, r, greska: g / n / r };
  }

  function povrsina(poly) {
    let s = 0;
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length];
      s += a[0] * b[1] - b[0] * a[1];
    }
    return s / 2;
  }

  function teziste(tacke) {
    let sx = 0, sy = 0;
    for (const p of tacke) { sx += p[0]; sy += p[1]; }
    return [sx / tacke.length, sy / tacke.length];
  }

  // Šrafura: paralelne linije pod uglom, isečene unutar zatvorenog oblika.
  function srafura(poly, ugao, razmak) {
    const c = Math.cos(-ugao), s = Math.sin(-ugao);
    const rot = poly.map(p => [p[0] * c - p[1] * s, p[0] * s + p[1] * c]);
    const o = okvir(rot);
    const lin = [];
    const cb = Math.cos(ugao), sb = Math.sin(ugao);
    const nazad = (p) => [p[0] * cb - p[1] * sb, p[0] * sb + p[1] * cb];
    for (let y = o.y0 + razmak / 2; y < o.y1; y += razmak) {
      const xs = [];
      for (let i = 0; i < rot.length; i++) {
        const a = rot[i], b = rot[(i + 1) % rot.length];
        if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) {
          xs.push(a[0] + (y - a[1]) / (b[1] - a[1]) * (b[0] - a[0]));
        }
      }
      xs.sort((p, q) => p - q);
      for (let i = 0; i + 1 < xs.length; i += 2) {
        if (xs[i + 1] - xs[i] > razmak * 0.4) lin.push([nazad([xs[i], y]), nazad([xs[i + 1], y])]);
      }
    }
    return lin;
  }

  // Da li su dva elementa praktično isti (da mašina ne crta preko postojećeg).
  function slicni(e1, e2, tol) {
    const a = uLiniju(e1, 20), b = uLiniju(e2, 20);
    let s = 0;
    for (const p of a) {
      let min = Infinity;
      for (let i = 1; i < b.length; i++) min = Math.min(min, doDuzi(p, b[i - 1], b[i]).d);
      s += min;
    }
    return s / a.length < tol;
  }

  return {
    RASTER, element, raz, doDuzi, rdp, okvir, okvirElementa, okvirElemenata, uLiniju,
    tackeLuka, duzina, T, primeni, transformisi, krugKroz, povrsina, teziste, srafura, slicni,
  };
})();
