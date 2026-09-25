// =====================================================================
//  MODELI — "ruka" (sketch-rnn): jedan model = jedan motiv
//  ---------------------------------------------------------------------
//  Na telefonu se modeli skidaju sa Google-ovog servera kad zatrebaju
//  (oko 3 MB po motivu, samo jednom). Ako to ne uspe, program traži
//  fajl modeli/sketchrnn/<ime>.js pored sebe (isti kao u Duetu).
// =====================================================================

const Modeli = (() => {
  window.SKETCH_MODELI = window.SKETCH_MODELI || {};
  const GOOGLE = 'https://storage.googleapis.com/quickdraw-models/sketchRNN/models/';
  const gotovi = {};
  const neuspeli = new Set();
  const uToku = {};

  async function saInterneta(ime) {
    const kontrola = new AbortController();
    const tajmer = setTimeout(() => kontrola.abort(), 12000);
    try {
      const r = await fetch(GOOGLE + ime + '.gen.json', { signal: kontrola.signal });
      return r.ok ? await r.json() : null;
    } catch (e) { return null; } finally { clearTimeout(tajmer); }
  }

  function lokalno(ime) {
    return new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = 'modeli/sketchrnn/' + ime + '.js';
      s.onload = () => resolve(window.SKETCH_MODELI[ime] || null);
      s.onerror = () => { s.remove(); resolve(null); };
      document.head.appendChild(s);
    });
  }

  async function dobavi(ime) {
    if (gotovi[ime]) return gotovi[ime];
    if (neuspeli.has(ime)) return null;
    if (uToku[ime]) return uToku[ime];
    uToku[ime] = (async () => {
      let podaci = window.SKETCH_MODELI[ime] || await saInterneta(ime) || await lokalno(ime);
      if (!podaci) { neuspeli.add(ime); return null; }
      try {
        const m = new MrezaSkica(podaci);
        gotovi[ime] = m;
        delete window.SKETCH_MODELI[ime];
        return m;
      } catch (e) { neuspeli.add(ime); return null; }
    })();
    const m = await uToku[ime];
    delete uToku[ime];
    return m;
  }

  return { dobavi, get neuspeli() { return neuspeli; }, get broj() { return Object.keys(gotovi).length; } };
})();
