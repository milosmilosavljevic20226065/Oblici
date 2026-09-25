// =====================================================================
//  SKETCHPAD · OBLACI — mašina gleda svet kroz kameru telefona
//  ---------------------------------------------------------------------
//  Isto oko (DoodleNet) i ista ruka (sketch-rnn) kao u Sketchpad Duetu,
//  ali ovde mašina ne gleda tvoje linije, nego obrise koje vidi kamera.
//
//   OBRISI       svaka slika sa kamere postaje Sketchpad-ov crtež:
//                ivice se pretvore u svetleće vektorske linije.
//   PAREIDOLIJA  mašina izdvoji oblike (oblake, mrlje, senke), pita svoje
//                oko šta bi to moglo da bude — i onda to "vidi": docrta
//                obris do životinje, lica ili predmeta, ili u oblak upiše
//                ceo crtež koji mu najbolje leži. Kao u Duetu, prvo
//                zamisli nekoliko varijanti (bledi duhovi), pa izabere
//                najbolju (D. T. Campbell: slepa varijacija i selektivno
//                zadržavanje). Leonardo je slikarima savetovao da gledaju
//                mrlje na zidu dok u njima ne ugledaju predele i lica.
// =====================================================================

(() => {
  const $ = (s) => document.querySelector(s);
  const platno = $('#crtez');
  const g = platno.getContext('2d');
  const video = $('#video');
  let W = 0, H = 0, dpr = 1;

  const stanje = {
    rezim: 'pareidolija',       // 'obrisi' | 'pareidolija'
    izvor: null,                // 'kamera' | 'slika'
    slika: null,                // nepokretna slika (galerija, proba ili zamrznut kadar)
    zamrznuto: false,
    prikaziSliku: true,
    masta: 0.55,
    status: '',
    ivice: [],                  // poslednje ivice (OBRISI), u koordinatama analize
    iviceVel: [1, 1],
    oblici: [],                 // živi obrisi oblika (PAREIDOLIJA)
    obliciVel: [1, 1],
    vizije: [],                 // šta je mašina videla: { obris, linije, naziv, p, drugi, duhovi, faza }
    vizijeVel: [1, 1],
    zauzeto: false,
    poslednjaAnaliza: 0,
    pomak: { x: 0, y: 0 },      // koliko se kamera pomerila od analize (u pikselima ekrana)
    ref: null,                  // mala siva slika u trenutku analize (za praćenje)
    poruka: null,
  };

  // ---------------------------------------------------------------------
  //  Ekran
  // ---------------------------------------------------------------------
  function velicina() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = Math.round(window.innerWidth * dpr);
    H = Math.round(window.innerHeight * dpr);
    platno.width = W; platno.height = H;
    fosfor.width = W; fosfor.height = H;
  }
  const fosfor = document.createElement('canvas');     // trag koji polako bledi (OBRISI)
  const gF = fosfor.getContext('2d');
  window.addEventListener('resize', velicina);

  // izvorna slika (video ili nepokretna) i deo koji se vidi na ekranu (cover)
  function izvorSlike() {
    if (stanje.slika) return { el: stanje.slika, w: stanje.slika.width, h: stanje.slika.height };
    if (stanje.izvor === 'kamera' && video.videoWidth) return { el: video, w: video.videoWidth, h: video.videoHeight };
    return null;
  }
  function vidljivo(iz) {
    const s = Math.max(W / iz.w, H / iz.h);
    const vw = W / s, vh = H / s;
    return { sx: (iz.w - vw) / 2, sy: (iz.h - vh) / 2, sw: vw, sh: vh };
  }

  // koliko ekrana se vidi iznad dugmadi (samo taj deo mašina gleda)
  function vidnoH() {
    const k = document.getElementById('kontrole');
    return Math.max(H * 0.5, H - (k && !k.hidden ? k.offsetHeight * dpr : 0));
  }

  // mali kadar za analizu: tačno ono što se vidi na ekranu, širine aw
  const kadarPlatno = document.createElement('canvas');
  const kG = kadarPlatno.getContext('2d', { willReadFrequently: true });
  function uhvati(aw) {
    const iz = izvorSlike();
    if (!iz) return null;
    const Hv = vidnoH();
    const ah = Math.max(8, Math.round(aw * Hv / W));
    kadarPlatno.width = aw; kadarPlatno.height = ah;
    const v = vidljivo(iz);
    kG.drawImage(iz.el, v.sx, v.sy, v.sw, v.sh * Hv / H, 0, 0, aw, ah);
    return { rgba: kG.getImageData(0, 0, aw, ah).data, w: aw, h: ah };
  }
  function uhvatiSivo(aw) {
    const k = uhvati(aw);
    return k ? { g: Vid.siva(k.rgba, k.w, k.h), w: k.w, h: k.h } : null;
  }

  // ---------------------------------------------------------------------
  //  Crtanje: fosforne linije kao na TX-2
  // ---------------------------------------------------------------------
  function putanja(linije, sx, sy, dx = 0, dy = 0) {
    g.beginPath();
    for (const l of linije) {
      if (!l || l.length < 2) continue;
      g.moveTo(l[0][0] * sx + dx, l[0][1] * sy + dy);
      for (let i = 1; i < l.length; i++) g.lineTo(l[i][0] * sx + dx, l[i][1] * sy + dy);
    }
  }
  function fosforno(jacina, debljina, crtice) {
    g.lineCap = 'round'; g.lineJoin = 'round';
    if (stanje.prikaziSliku) { g.strokeStyle = 'rgba(0,0,0,' + (0.5 * jacina) + ')'; g.lineWidth = debljina * 3.4; g.stroke(); }
    g.strokeStyle = 'rgba(90,225,195,' + (0.22 * jacina) + ')'; g.lineWidth = debljina * 4.2; g.stroke();
    g.strokeStyle = 'rgba(222,252,246,' + (0.95 * jacina) + ')'; g.lineWidth = debljina;
    if (crtice) g.setLineDash(crtice.map(x => x * dpr));
    g.stroke();
    g.setLineDash([]);
  }
  function tekst(t, x, y, vel, poravnanje = 'levo', jacina = 1) {
    const linije = Font.linije(t, x, y, vel, { poravnanje });
    putanja(linije, 1, 1);
    fosforno(jacina, Math.max(1.2, vel * 0.11), null);
  }

  function crtajPozadinu() {
    const iz = izvorSlike();
    g.globalCompositeOperation = 'source-over';
    if (iz && stanje.prikaziSliku) {
      const v = vidljivo(iz);
      g.drawImage(iz.el, v.sx, v.sy, v.sw, v.sh, 0, 0, W, H);
      // kao da gledaš kroz tamno staklo katodne cevi
      g.fillStyle = 'rgba(2,10,8,0.5)';
      g.fillRect(0, 0, W, H);
    } else {
      g.fillStyle = '#030706';
      g.fillRect(0, 0, W, H);
    }
  }

  // ---------------------------------------------------------------------
  //  OBRISI
  // ---------------------------------------------------------------------
  let sirinaIvica = 200, poslednjeIvice = 0;
  function obradiIvice() {
    const t0 = performance.now();
    const k = uhvati(sirinaIvica);
    if (!k) return;
    const siva = Vid.zamuti(Vid.siva(k.rgba, k.w, k.h), k.w, k.h, 1);
    const e = Vid.ivice(siva, k.w, k.h, stanje.masta);
    stanje.ivice = Vid.lanci(e, k.w, k.h, 6);
    stanje.iviceVel = [k.w, k.h];
    // ako telefon ne stiže, gleda sitnije
    const dt = performance.now() - t0;
    if (dt > 45 && sirinaIvica > 120) sirinaIvica -= 20;
    else if (dt < 18 && sirinaIvica < 280) sirinaIvica += 10;
  }

  function crtajIvice() {
    gF.globalCompositeOperation = 'destination-out';
    gF.fillStyle = 'rgba(0,0,0,0.42)';
    gF.fillRect(0, 0, W, H);
    gF.globalCompositeOperation = 'source-over';
    const [aw, ah] = stanje.iviceVel;
    const sx = W / aw, sy = vidnoH() / ah;
    const gg = g;
    // crtamo u fosfor (trag), pa fosfor na ekran
    const stari = g;
    const pom = gF;
    pom.save();
    pom.lineCap = 'round'; pom.lineJoin = 'round';
    pom.beginPath();
    for (const l of stanje.ivice) {
      pom.moveTo(l[0][0] * sx, l[0][1] * sy);
      for (let i = 1; i < l.length; i++) pom.lineTo(l[i][0] * sx, l[i][1] * sy);
    }
    pom.strokeStyle = 'rgba(90,225,195,0.25)'; pom.lineWidth = 4.5 * dpr; pom.stroke();
    pom.strokeStyle = 'rgba(222,252,246,0.95)'; pom.lineWidth = 1.3 * dpr; pom.setLineDash([2.2 * dpr, 2.6 * dpr]); pom.stroke();
    pom.restore();
    stari.globalCompositeOperation = stanje.prikaziSliku ? 'source-over' : 'lighter';
    gg.drawImage(fosfor, 0, 0);
    gg.globalCompositeOperation = 'source-over';
  }

  // ---------------------------------------------------------------------
  //  PAREIDOLIJA
  // ---------------------------------------------------------------------
  const SIRINA_OBLIKA = 180;
  let poslednjiObrisi = 0;
  function obradiOblike() {
    const k = uhvati(120);
    if (!k) return;
    const s = Vid.oblici(k.rgba, k.w, k.h);
    stanje.oblici = s.oblici.map(o => o.obris);
    stanje.obliciVel = [k.w, k.h];
  }

  const pauza = (ms) => new Promise(r => setTimeout(r, ms));
  const pct = (p) => Math.round(p * 100) + '%';

  function uzorkuj(linije, korak) {
    const r = [];
    for (const l of linije) for (let i = 1; i < l.length; i++) {
      const a = l[i - 1], b = l[i];
      const n = Math.max(1, Math.round(Geo.raz(a, b) / korak));
      for (let k = 0; k < n; k++) r.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]);
    }
    return r;
  }

  // konveksni omotač (silueta crteža)
  function omotac(tacke) {
    const t = tacke.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    if (t.length < 3) return t;
    const kr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const dole = [], gore = [];
    for (const p of t) { while (dole.length >= 2 && kr(dole[dole.length - 2], dole[dole.length - 1], p) <= 0) dole.pop(); dole.push(p); }
    for (let i = t.length - 1; i >= 0; i--) { const p = t[i]; while (gore.length >= 2 && kr(gore[gore.length - 2], gore[gore.length - 1], p) <= 0) gore.pop(); gore.push(p); }
    const h = dole.slice(0, -1).concat(gore.slice(0, -1));
    return h.concat([h[0]]);
  }

  // koliko crtež "leži" u obrisu oblaka (Chamfer rastojanje, u oba smera)
  function prileganje(linije, obris, vel) {
    const A = uzorkuj(linije, vel / 40), B = uzorkuj([obris], vel / 40);
    if (!A.length || !B.length) return 0;
    const najm = (p, S) => { let m = Infinity; for (const q of S) { const d = (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2; if (d < m) m = d; } return Math.sqrt(m); };
    let ab = 0; for (const p of A) ab += najm(p, B); ab /= A.length;
    let ba = 0; for (const p of B) ba += najm(p, A); ba /= B.length;
    return Math.max(0, Math.min(1, 1 - (0.6 * ab + 0.4 * ba) / (0.14 * vel)));
  }

  // nastavak obrisa mrežom (kao DOVRŠI ZAPOČETO u Duetu); ono što ode
  // daleko od oblaka se odseca
  async function nastavi(model, obris, o, cilj, temp) {
    const mera = Math.max(o.w, o.h, 8), f = cilj / mera;
    const qd = [Geo.rdp(obris.map(p => [(p[0] - o.x0) * f, (p[1] - o.y0) * f]), 2.5)];
    const nove = await nastaviCrtez(model, qd, { temperatura: temp, maxPoteza: 14, maxKoraka: 150 });
    const m = mera * 0.35;
    const b = { x0: o.x0 - m, y0: o.y0 - m, x1: o.x0 + o.w + m, y1: o.y0 + o.h + m };
    const rez = [];
    for (const l of nove) {
      let deo = [];
      for (const q of l) {
        const p = [q[0] / f + o.x0, q[1] / f + o.y0];
        if (p[0] >= b.x0 && p[0] <= b.x1 && p[1] >= b.y0 && p[1] <= b.y1) deo.push(p);
        else { if (deo.length > 1) rez.push(deo); deo = []; }
      }
      if (deo.length > 1) rez.push(deo);
    }
    return rez;
  }

  // ceo crtež motiva, upisan u okvir oblaka
  async function upisi(model, o, temp) {
    const qd = await nacrtajOdNule(model, { temperatura: temp, maxPoteza: 25, maxKoraka: 130 });
    if (!qd.length) return [];
    const oq = Geo.okvir(qd.flat());
    // pareidolija je popustljiva: crtež sme malo da se razvuče da prati oblak
    let sx = o.w / Math.max(oq.w, 1), sy = o.h / Math.max(oq.h, 1);
    const g = Math.sqrt(sx * sy), odnos = Math.max(0.75, Math.min(1.33, sx / sy));
    sx = g * Math.sqrt(odnos) * 0.94; sy = g / Math.sqrt(odnos) * 0.94;
    const ox = o.x0 + (o.w - oq.w * sx) / 2, oy = o.y0 + (o.h - oq.h * sy) / 2;
    return qd.map(l => l.map(p => [ox + (p[0] - oq.x0) * sx, oy + (p[1] - oq.y0) * sy]));
  }

  // šta mašina vidi u jednom obliku
  async function zamisliOblik(o, vizija) {
    const obris = o.obris;
    // oko gleda obris i ono što je unutra (senke, pukotine) — kao kad u
    // oblaku vidiš oči i usta
    const rez = Prepoznavanje.prepoznaj([obris].concat(o.unutra || []));
    if (!rez) return false;
    const red = Array.from(rez.verovatnoce.keys()).sort((a, b) => rez.verovatnoce[b] - rez.verovatnoce[a]);
    const kand = [];
    for (const i of red.slice(0, 40)) {
      const k = rez.klase[i];
      if ((APSTRAKTNO[k] || 0) >= 0.5 || k === 'cloud') continue;        // "oblak" nije odgovor
      const m = modelZaKlasu(k);
      if (!m || m === 'everything') continue;
      kand.push({ klasa: k, model: m, p: rez.verovatnoce[i] });
      if (kand.length >= 5) break;
    }
    if (!kand.length) return false;
    // MAŠTA: što je veća, to se češće odlučuje za manje verovatno čitanje
    const T = 0.35 + 1.3 * stanje.masta;
    const tez = kand.map(k => Math.pow(k.p, 1 / T));
    let r = Math.random() * tez.reduce((a, b) => a + b, 0), izbor = kand[0];
    for (let i = 0; i < kand.length; i++) { r -= tez[i]; if (r <= 0) { izbor = kand[i]; break; } }
    let naziv = srpskiNaziv(izbor.klasa), modelIme = izbor.model, klase = [izbor.klasa];
    // hibrid: ako oko vidi dve stvari od kojih postoji mešani model
    if (Math.random() < 0.25 + 0.5 * stanje.masta) {
      for (const [hib, delovi] of Object.entries(KOMPONENTE)) {
        const ima = delovi.filter(d => kand.slice(0, 4).some(k => k.klasa === d || k.model === d));
        if (ima.length >= 2) { modelIme = hib; naziv = delovi.slice(0, 2).map(srpskiNaziv).join(' + '); klase = delovi; break; }
      }
    }
    vizija.naziv = naziv;
    vizija.p = izbor.p;
    vizija.drugi = kand.filter(k => k !== izbor).slice(0, 2).map(k => srpskiNaziv(k.klasa));
    vizija.faza = 'ucitava';
    let model = await Modeli.dobavi(modelIme);
    if (!model && modelIme !== izbor.model) {
      // mešani model nije stigao: ostaje pri prvom čitanju
      model = await Modeli.dobavi(izbor.model);
      naziv = srpskiNaziv(izbor.klasa); klase = [izbor.klasa];
      vizija.naziv = naziv;
    }
    if (!model) { vizija.faza = 'gotovo'; vizija.bezModela = true; return true; }
    // ZAMIŠLJA: četiri varijante — dve nastavljaju obris, dve upisuju ceo crtež
    vizija.faza = 'zamislja';
    const vel = Math.max(o.okvir.w, o.okvir.h);
    const temp = 0.25 + 0.6 * stanje.masta;
    const okvir = { x0: o.okvir.x0, y0: o.okvir.y0, w: o.okvir.w, h: o.okvir.h };
    let naj = null;
    for (let i = 0; i < 5; i++) {
      let linije, ocena;
      if (i === 2) {
        linije = await nastavi(model, obris, okvir, 480, temp);
        const duz = linije.reduce((s, l) => s + Geo.duzina(l), 0);
        ocena = 0.7 * Prepoznavanje.slicnost([obris].concat(linije), klase) + 0.3 * Math.min(1, duz / (vel * 1.4)) - 0.05;
      } else {
        // ceo crtež, pa se gleda koliko mu silueta liči na oblak
        linije = await upisi(model, okvir, temp);
        const sil = linije.length ? omotac(linije.flat()) : [];
        ocena = 0.4 * Prepoznavanje.slicnost(linije, klase) + 0.6 * prileganje([sil], obris, vel);
      }
      linije = linije.filter(l => l.length >= 2).map(l => Geo.rdp(l, vel * 0.006));
      if (!linije.length) continue;
      vizija.duhovi.push(linije);
      if (!naj || ocena > naj.ocena) naj = { linije, ocena, nacin: i % 2 === 0 ? 'nastavak' : 'upis' };
      await pauza(40);
    }
    if (naj) { vizija.linije = naj.linije; vizija.nacin = naj.nacin; vizija.ocena = naj.ocena; }
    vizija.duhovi = [];
    vizija.faza = 'gotovo';
    return true;
  }

  async function vidi(dodir) {
    if (stanje.zauzeto) return;
    stanje.zauzeto = true;
    try {
      stanje.status = 'MAŠINA GLEDA';
      const k = uhvati(SIRINA_OBLIKA);
      if (!k) return;
      const ref = uhvatiSivo(80);
      const s = Vid.oblici(k.rgba, k.w, k.h);
      if (!s.oblici.length) { stanje.status = 'NE VIDIM OBLIKE — POKAŽI MI OBLAKE'; return; }
      let izbor = s.oblici.slice(0, 1 + Math.round(stanje.masta * 2));
      // ivice unutar svakog oblika (senke, pukotine)
      const siva = Vid.zamuti(Vid.siva(k.rgba, k.w, k.h), k.w, k.h, 1);
      const lanci = Vid.lanci(Vid.ivice(siva, k.w, k.h, 0.55), k.w, k.h, 5);
      for (const o of s.oblici) {
        o.unutra = lanci.filter(l => {
          let u = 0;
          for (const p of l) { const x = Math.round(p[0]), y = Math.round(p[1]); if (s.oznake[y * k.w + x] === o.id) u++; }
          return u / l.length > 0.8;
        }).slice(0, 12);
      }
      if (dodir) {
        const x = Math.round(dodir[0] * k.w), y = Math.round(dodir[1] * k.h);
        const id = s.oznake ? s.oznake[y * k.w + x] : 0;
        const pogodjen = s.oblici.find(o => o.id === id) ||
          s.oblici.slice().sort((a, b) => Math.hypot(a.cx - x, a.cy - y) - Math.hypot(b.cx - x, b.cy - y))[0];
        izbor = [pogodjen];
      }
      stanje.ref = ref;
      stanje.pomak = { x: 0, y: 0 };
      stanje.vizijeVel = [k.w, k.h];
      const nove = izbor.map(o => ({ obris: o.obris, unutra: o.unutra, okvir: o.okvir, linije: [], duhovi: [], naziv: '', p: 0, drugi: [], faza: 'gleda' }));
      stanje.vizije = nove;
      for (let i = 0; i < izbor.length; i++) {
        stanje.status = 'MAŠINA ZAMIŠLJA (' + (i + 1) + '/' + izbor.length + ')';
        const ok = await zamisliOblik(izbor[i], nove[i]);
        if (!ok) nove[i].faza = 'nista';
      }
      stanje.vizije = nove.filter(v => v.faza !== 'nista');
      const prvi = stanje.vizije[0];
      stanje.status = prvi ? 'VIDIM: ' + stanje.vizije.map(v => v.naziv).join(' · ') : 'NIŠTA NE VIDIM U OVIM OBLICIMA';
    } catch (e) {
      console.warn(e);
      stanje.status = 'GREŠKA — POKUŠAJ PONOVO';
    } finally {
      stanje.zauzeto = false;
      stanje.poslednjaAnaliza = performance.now();
    }
  }

  // praćenje: koliko se kamera pomerila od trenutka kad je mašina gledala
  let poslednjePracenje = 0;
  function prati() {
    if (!stanje.ref || stanje.slika) { stanje.pomak = { x: 0, y: 0 }; return; }
    const cur = uhvatiSivo(80);
    if (!cur || cur.w !== stanje.ref.w || cur.h !== stanje.ref.h) return;
    const p = Vid.pomakPiramida(stanje.ref.g, cur.g, cur.w, cur.h);
    // sadržaj slike se pomerio za (dx, dy): crtež ide zajedno sa njim
    stanje.pomak = { x: p.dx * W / cur.w, y: p.dy * vidnoH() / cur.h, greska: p.greska };
  }

  // veličina slova: da i duži natpis stane u širinu telefona
  const slova = () => Math.min(W / 46, 24 * dpr);

  function crtajVizije() {
    const [aw, ah] = stanje.vizijeVel;
    const sx = W / aw, sy = vidnoH() / ah;
    const { x: dx, y: dy } = stanje.pomak;
    const bledi = Math.hypot(dx, dy) > Math.min(W, H) * 0.3 ? 0.35 : 1;
    for (const v of stanje.vizije) {
      // obris oblaka i ono što je u njemu: tanko
      putanja([v.obris].concat(v.unutra || []), sx, sy, dx, dy);
      fosforno(0.62 * bledi, 1.2 * dpr, [3, 3]);
      // duhovi dok zamišlja
      if (v.duhovi && v.duhovi.length) {
        for (const d of v.duhovi) { putanja(d, sx, sy, dx, dy); fosforno(0.3, 1 * dpr, [2, 5]); }
      }
      // ono što vidi
      if (v.linije && v.linije.length) {
        putanja(v.linije, sx, sy, dx, dy);
        fosforno(bledi, 2 * dpr, null);
      }
      // natpis iznad oblika
      if (v.naziv) {
        const vel = slova() * 1.1;
        const t = v.naziv + (v.p ? ' ' + pct(v.p) : '') + (v.faza === 'ucitava' ? ' …' : '');
        const sir = Font.sirinaTeksta(t, vel);
        const x = Math.max(8 * dpr, Math.min(W - sir - 8 * dpr, v.okvir.x0 * sx + dx));
        const y = Math.max(slova() * 5.8, v.okvir.y0 * sy + dy - vel * 1.8);
        tekst(t, x, y, vel, 'levo', bledi);
      }
    }
  }

  function crtajOblikeUzivo() {
    const [aw, ah] = stanje.obliciVel;
    putanja(stanje.oblici, W / aw, vidnoH() / ah);
    fosforno(stanje.vizije.length ? 0.16 : 0.3, 1 * dpr, [1.2, 5]);
  }

  // ---------------------------------------------------------------------
  //  Natpisi (status gore, misli dole)
  // ---------------------------------------------------------------------
  function crtajNatpise() {
    const v0 = slova(), m = 12 * dpr;
    const naslov = 'OBLACI · ' + (stanje.rezim === 'obrisi' ? 'OBRISI' : 'PAREIDOLIJA') + (stanje.zamrznuto ? ' · ZAMRZNUTO' : '');
    tekst(naslov, m, m + v0 * 0.4, v0, 'levo', 0.9);
    if (stanje.rezim === 'obrisi') {
      tekst(stanje.ivice.length + ' LINIJA', W - m, m + v0 * 0.4, v0 * 0.85, 'desno', 0.7);
    } else {
      if (stanje.status) tekst(stanje.status.slice(0, 44), m, m + v0 * 2.2, v0 * 0.85, 'levo', 0.85);
      const v = stanje.vizije[0];
      if (v && v.drugi && v.drugi.length && v.faza === 'gotovo') tekst('MOŽDA I: ' + v.drugi.join(', '), m, m + v0 * 3.8, v0 * 0.75, 'levo', 0.6);
      if (!stanje.zauzeto && !stanje.vizije.length && stanje.izvor) tekst('DODIRNI OBLAK', W / 2, H * 0.62, v0, 'centar', 0.7);
    }
    if (stanje.poruka && performance.now() < stanje.poruka.do) tekst(stanje.poruka.t, W / 2, H * 0.45, v0 * 1.1, 'centar', 1);
  }

  // ---------------------------------------------------------------------
  //  Glavna petlja
  // ---------------------------------------------------------------------
  function kadar(t) {
    requestAnimationFrame(kadar);
    if (!stanje.izvor) return;
    crtajPozadinu();
    if (stanje.rezim === 'obrisi') {
      if (t - poslednjeIvice > 60 && (!stanje.zamrznuto || !stanje.ivice.length)) { poslednjeIvice = t; obradiIvice(); }
      crtajIvice();
    } else {
      if (!stanje.zamrznuto && t - poslednjePracenje > 90) { poslednjePracenje = t; prati(); }
      if (t - poslednjiObrisi > 350) { poslednjiObrisi = t; obradiOblike(); }
      crtajOblikeUzivo();
      crtajVizije();
      // sama pogleda ponovo: kad se kamera mnogo pomeri, ili posle nekog vremena
      const pomeren = Math.hypot(stanje.pomak.x, stanje.pomak.y) > Math.min(W, H) * 0.3;
      const staro = t - stanje.poslednjaAnaliza > (stanje.slika ? 1e9 : 14000);
      if (!stanje.zauzeto && (pomeren || staro || (!stanje.vizije.length && t - stanje.poslednjaAnaliza > 2500))) vidi(null);
    }
    crtajNatpise();
  }

  function poruka(t, ms = 1600) { stanje.poruka = { t, do: performance.now() + ms }; }

  // ---------------------------------------------------------------------
  //  Izvori slike: kamera, galerija, proba
  // ---------------------------------------------------------------------
  async function ukljuciKameru() {
    const greska = $('#greska');
    greska.hidden = true;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      greska.textContent = window.isSecureContext
        ? 'Ovaj pregledač ne daje kameru. Probaj Chrome (Android) ili Safari (iPhone).'
        : 'Kamera radi samo na sigurnoj (https) adresi. Otvori aplikaciju preko GitHub Pages linka.';
      greska.hidden = false;
      return;
    }
    try {
      const tok = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false,
      });
      video.srcObject = tok;
      await video.play();
      stanje.izvor = 'kamera';
      stanje.slika = null;
      stanje.zamrznuto = false;
      pocni();
    } catch (e) {
      greska.textContent = 'Kamera nije uključena (' + (e.name || 'greška') + '). Dozvoli pristup kameri u pregledaču, ili izaberi sliku iz galerije.';
      greska.hidden = false;
    }
  }

  function postaviSliku(el) {
    const c = document.createElement('canvas');
    const s = Math.min(1, 1600 / Math.max(el.width || el.naturalWidth, el.height || el.naturalHeight));
    c.width = Math.round((el.width || el.naturalWidth) * s);
    c.height = Math.round((el.height || el.naturalHeight) * s);
    c.getContext('2d').drawImage(el, 0, 0, c.width, c.height);
    stanje.slika = c;
    stanje.izvor = stanje.izvor || 'slika';
    stanje.zamrznuto = true;
    stanje.vizije = []; stanje.ref = null; stanje.poslednjaAnaliza = 0;
    pocni();
  }

  function izGalerije(f) {
    const img = new Image();
    img.onload = () => { postaviSliku(img); URL.revokeObjectURL(img.src); };
    img.src = URL.createObjectURL(f);
  }

  // proba bez kamere: nebo sa oblacima (šum), uvek drugačije
  function probnoNebo() {
    const w = 900, h = 1400;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const x = c.getContext('2d');
    const gr = x.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#2f6fb8'); gr.addColorStop(1, '#8fbfe6');
    x.fillStyle = gr; x.fillRect(0, 0, w, h);
    const oblaci = 3 + Math.floor(Math.random() * 3);
    for (let k = 0; k < oblaci; k++) {
      const cx = 120 + Math.random() * (w - 240), cy = 150 + (k + 0.5) * (h - 300) / oblaci + (Math.random() - 0.5) * 120;
      const R = 90 + Math.random() * 90;
      for (let i = 0; i < 26; i++) {
        const u = Math.random() * Math.PI * 2, d = Math.pow(Math.random(), 0.7) * R * 1.4;
        const r = R * (0.35 + Math.random() * 0.5);
        const px = cx + Math.cos(u) * d * 1.3, py = cy + Math.sin(u) * d * 0.7;
        const rg = x.createRadialGradient(px, py, 0, px, py, r);
        rg.addColorStop(0, 'rgba(255,255,255,0.95)'); rg.addColorStop(0.6, 'rgba(245,248,252,0.85)'); rg.addColorStop(1, 'rgba(240,245,250,0)');
        x.fillStyle = rg;
        x.beginPath(); x.arc(px, py, r, 0, Math.PI * 2); x.fill();
      }
    }
    stanje.izvor = 'slika';
    postaviSliku(c);
  }

  function pocni() {
    $('#pocetak').hidden = true;
    $('#kontrole').hidden = false;
    osveziDugmad();
  }

  // ---------------------------------------------------------------------
  //  Dugmad
  // ---------------------------------------------------------------------
  function osveziDugmad() {
    document.querySelectorAll('[data-rezim]').forEach(b => b.classList.toggle('upaljen', b.dataset.rezim === stanje.rezim));
    $('[data-akcija=slika]').classList.toggle('upaljen', stanje.prikaziSliku);
    $('[data-akcija=zamrzni]').classList.toggle('upaljen', stanje.zamrznuto);
    $('#masta-natpis').dataset.natpis = stanje.rezim === 'obrisi' ? 'GUSTINA' : 'MAŠTA';
    graviraj($('#masta-natpis'));
  }

  function zamrzni() {
    if (stanje.izvor !== 'kamera') { poruka('OVO JE SLIKA — VEĆ STOJI'); return; }
    if (stanje.zamrznuto) {
      stanje.zamrznuto = false; stanje.slika = null; stanje.ref = null; stanje.vizije = []; stanje.poslednjaAnaliza = 0;
    } else {
      const c = document.createElement('canvas');
      c.width = video.videoWidth; c.height = video.videoHeight;
      c.getContext('2d').drawImage(video, 0, 0);
      stanje.slika = c;
      stanje.zamrznuto = true;
      stanje.pomak = { x: 0, y: 0 };
    }
    osveziDugmad();
  }

  function sacuvaj() {
    platno.toBlob(async (b) => {
      if (!b) return;
      const d = new Date(), dv = (x) => String(x).padStart(2, '0');
      const ime = 'oblaci-' + d.getFullYear() + dv(d.getMonth() + 1) + dv(d.getDate()) + '-' + dv(d.getHours()) + dv(d.getMinutes()) + dv(d.getSeconds()) + '.png';
      const f = new File([b], ime, { type: 'image/png' });
      try {
        if (navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], title: 'Sketchpad · Oblaci' }); return; }
      } catch (e) { if (e && e.name === 'AbortError') return; }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(b); a.download = ime;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      poruka('SAČUVANO');
    }, 'image/png');
  }

  function graviraj(el) {
    const t = el.dataset.natpis;
    const vel = el.closest('.veliko') ? 12 : 9.5;
    const sir = Font.sirinaTeksta(t, vel);
    const d = Font.svgPutanja(t, 1, vel * 0.45 + 1, vel);
    const w = sir + 2, h = vel * 1.7 + 1;
    el.innerHTML = `<svg width="${w.toFixed(1)}" height="${h.toFixed(1)}" viewBox="0 0 ${w.toFixed(1)} ${h.toFixed(1)}" aria-hidden="true"><path d="${d}" stroke-width="${(vel * 0.15).toFixed(2)}"/></svg>`;
    el.setAttribute('aria-label', t);
  }

  function povezi() {
    document.querySelectorAll('[data-natpis]').forEach(graviraj);
    document.querySelectorAll('[data-akcija]').forEach(b => b.addEventListener('click', (e) => {
      e.stopPropagation();
      const a = b.dataset.akcija;
      if (a === 'kamera') ukljuciKameru();
      else if (a === 'galerija') $('#fajl').click();
      else if (a === 'proba') probnoNebo();
      else if (a === 'slika') { stanje.prikaziSliku = !stanje.prikaziSliku; osveziDugmad(); }
      else if (a === 'zamrzni') zamrzni();
      else if (a === 'sacuvaj') sacuvaj();
      else if (a === 'pogledaj') { stanje.vizije = []; vidi(null); }
    }));
    document.querySelectorAll('[data-rezim]').forEach(b => b.addEventListener('click', (e) => {
      e.stopPropagation();
      stanje.rezim = b.dataset.rezim;
      stanje.vizije = []; stanje.poslednjaAnaliza = 0; stanje.ivice = [];
      gF.clearRect(0, 0, W, H);
      osveziDugmad();
    }));
    $('#fajl').addEventListener('change', (e) => { const f = e.target.files && e.target.files[0]; if (f) izGalerije(f); e.target.value = ''; });
    const m = $('#masta');
    m.addEventListener('input', () => { stanje.masta = parseFloat(m.value); });
    // dodir: pogledaj baš taj oblik
    platno.addEventListener('pointerdown', (e) => {
      if (!stanje.izvor || stanje.rezim !== 'pareidolija') return;
      const r = platno.getBoundingClientRect();
      const t = [(e.clientX - r.left) / r.width, Math.min(0.999, (e.clientY - r.top) * dpr / vidnoH())];
      if (stanje.zauzeto) { poruka('ČEKAJ, JOŠ ZAMIŠLJAM…'); return; }
      vidi(t);
    });
  }

  window.__oblaci = stanje;         // (za probe)
  velicina();
  povezi();
  setTimeout(() => Prepoznavanje.ucitaj(), 30);
  requestAnimationFrame(kadar);
})();
