// ============================================================
// BİLGİ DÜELLOSU — Firebase Realtime Database sarmalayıcısı
// Modüler SDK'yı yalnızca online mod seçilince (dinamik import)
// yükler; böylece local mod ve çevrimdışı kullanım etkilenmez.
// Anahtarlar firebase-config.js içindedir.
// ============================================================

const Net = {
  db: null,
  fns: null,        // { ref, set, update, onValue, get, child, onDisconnect, remove, runTransaction }
  roomRef: null,
  unsub: null,

  isConfigured() {
    const c = window.FIREBASE_CONFIG;
    return !!(c && c.apiKey && !String(c.apiKey).includes('BURAYA'));
  },

  async init() {
    if (this.db) return;
    if (!this.isConfigured()) throw new Error('Firebase yapılandırılmamış (firebase-config.js).');

    const appMod = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
    const dbMod = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js');
    const app = appMod.initializeApp(window.FIREBASE_CONFIG);
    this.db = dbMod.getDatabase(app);
    this.fns = {
      ref: dbMod.ref, set: dbMod.set, update: dbMod.update, onValue: dbMod.onValue,
      get: dbMod.get, child: dbMod.child, onDisconnect: dbMod.onDisconnect, remove: dbMod.remove,
    };
  },

  roomPath(code) { return `rooms/${code}`; },

  async createRoom(code, data) {
    await this.init();
    const { ref, set } = this.fns;
    this.roomRef = ref(this.db, this.roomPath(code));
    await set(this.roomRef, data);
  },

  async getRoom(code) {
    await this.init();
    const { ref, get } = this.fns;
    const snap = await get(ref(this.db, this.roomPath(code)));
    return snap.exists() ? snap.val() : null;
  },

  async updateRoom(code, partial) {
    await this.init();
    const { ref, update } = this.fns;
    await update(ref(this.db, this.roomPath(code)), partial);
  },

  // Belirli bir alt yola yaz (örn. "duel", "deck/3")
  async updatePath(code, subpath, value) {
    await this.init();
    const { ref, set } = this.fns;
    await set(ref(this.db, `${this.roomPath(code)}/${subpath}`), value);
  },

  subscribe(code, cb) {
    const { ref, onValue } = this.fns;
    const r = ref(this.db, this.roomPath(code));
    this.unsub = onValue(r, (snap) => cb(snap.exists() ? snap.val() : null));
  },

  stop() {
    if (this.unsub) { this.unsub(); this.unsub = null; }
  },
};
