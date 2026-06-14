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
      runTransaction: dbMod.runTransaction,
    };

    // Anonim kimlik doğrulama — RTDB kuralları "auth != null" istiyor.
    // Böylece public Firebase config'iyle gelişigüzel okuma/yazma engellenir.
    // Konsolda Anonymous Auth açık değilse bu hata verir; oyunu hard-kırmamak
    // için yutuyoruz (eski açık kurallarla çalışmaya devam eder), ama uyarırız.
    try {
      const authMod = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js');
      const auth = authMod.getAuth(app);
      await authMod.signInAnonymously(auth);
      this.uid = auth.currentUser?.uid || null;
    } catch (e) {
      console.warn('[Net] Anonim giriş başarısız (Firebase konsolunda Anonymous Auth açık mı?):', e?.code || e);
    }
  },

  // Bir alt yolun anlık değerini oku (örn. "matchmaking")
  async getPath(subpath) {
    await this.init();
    const { ref, get } = this.fns;
    const snap = await get(ref(this.db, subpath));
    return snap.exists() ? snap.val() : null;
  },

  // Kök seviye bir yola yaz (null = sil). Örn. "matchmaking/123456"
  async setPath(path, value) {
    await this.init();
    const { ref, set } = this.fns;
    await set(ref(this.db, path), value);
  },

  // Bir yolu canlı dinle; aboneliği kapatan fonksiyonu döndürür
  subscribePath(path, cb) {
    const { ref, onValue } = this.fns;
    return onValue(
      ref(this.db, path),
      (snap) => cb(snap.exists() ? snap.val() : null),
      (err) => { console.error(`[Net] ${path} dinleme hatası:`, err); }
    );
  },

  // Atomik talep (iki kişi aynı odayı kapamasın diye)
  async claim(code, mutator) {
    await this.init();
    const { ref, runTransaction } = this.fns;
    return runTransaction(ref(this.db, this.roomPath(code)), mutator);
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
