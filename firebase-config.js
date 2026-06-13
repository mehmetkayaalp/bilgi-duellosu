// ============================================================
// FIREBASE AYARLARI — Online mod için BURAYI DOLDUR
// ------------------------------------------------------------
// 1) https://console.firebase.google.com → "Add project" (ücretsiz).
// 2) Sol menü: Build → Realtime Database → "Create Database"
//    → konum seç → "Start in TEST MODE" (geçici, herkes yazabilir).
// 3) Proje ayarları (⚙️) → "Your apps" → Web (</>) ekle →
//    sana verilen firebaseConfig değerlerini aşağıya yapıştır.
// 4) databaseURL satırını mutlaka doldur (Realtime Database'in URL'i,
//    ör: https://PROJE-default-rtdb.firebaseio.com).
//
// NOT: Test modu ~30 günde dolar. Sürdürülebilir kullanım için
// Realtime Database → Rules'a basit kurallar yazılmalı (README'ye bak).
// ============================================================

window.FIREBASE_CONFIG = {
  apiKey: "BURAYA_API_KEY",
  authDomain: "BURAYA.firebaseapp.com",
  databaseURL: "https://BURAYA-default-rtdb.firebaseio.com",
  projectId: "BURAYA",
  appId: "BURAYA_APP_ID",
};
