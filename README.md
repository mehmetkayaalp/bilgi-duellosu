# 🃏 Bilgi Düellosu

İki kişilik, aynı cihazda sırayla oynanan öğretici bilgi kartı oyunu.
Trivia Crack tarzı ama daha sade ve tamamen Türkçe. PWA olarak telefona kurulabilir.

## Nasıl Oynanır?

`index.html` dosyasını tarayıcıda aç (veya bir sunucudan servis et — PWA özellikleri için gerekli).

1. İki oyuncu ismini girin, kart sayısını seçin (6 / 10 / 14).
2. Seçilen sayıda kart, kategorileri rastgele dağıtılmış şekilde kapalı olarak masaya dizilir.
3. Oyuncular sırayla (A-B-A-B) masadan bir kart seçer; kart dönünce kategorisi belli olur ve soru açılır.
4. **Her soru 20 saniyeye karşı** — ilk 10 saniyede doğru cevaplayana ⚡ +5 hız bonusu.
5. Her sorudan sonra **"Biliyor muydun?"** kutusunda öğretici bir bilgi gösterilir; oynanan kart masada, kazananın rengiyle rozetli kalır.
6. Kartlar bitince en çok puanı toplayan kazanır; bitiş ekranında kategori karnesi gösterilir.

## Kategoriler

| Kategori | Tür | Puan |
|---|---|---|
| 🚩 Bayraklar | Bayrağı gör, ülkeyi 4 şıktan bul | 10 (+5 hız) |
| 🎭 Ünlü Kişiler | "... kimdir?" — 4 şıktan bul | 10 (+5 hız) |
| ⚖️ Doğru / Yanlış | İfade doğru mu yanlış mı? | 10 (+5 hız) |
| 🏛️ Başkentler | Ülkenin başkenti hangisi? | 10 (+5 hız) |
| 🗺️ Hangi Kıtada? | Ülke hangi kıtada? | 10 (+5 hız) |
| ⏳ Hangisi Daha Eski? | İki olaydan önce olanı seç | 10 (+5 hız) |
| ⚔️ Yaz Bakalım | Sırayla cevap yazın; süre dolan / yanlış / tekrar yazan kaybeder | Kazanan 20, hepsi bulunursa ikisine 15 |

## Özellikler

- **🃏 Jokerler (oyun başına 1'er adet):** 50:50 (şıklı sorularda iki yanlış şık silinir) ve Joker Pas (Yaz Bakalım'da sırayı kaybetmeden devretme).
- **⭐ Çift puan kartları:** Destede gizli 1-2 kart (14 kartta 2); açana o el tüm puanlar 2 katı.
- **⏱️ Süre:** Şıklı sorularda 20 sn; "Yaz Bakalım"da her yazana ayrı ayrı 30 sn.
- **👀 Online'da rakibi görme:** Sıra rakipteyken onun sorusunu ve şıklarını görürsün; cevaplayınca doğru/yanlış şıkları renkli açılır.
- **🚪 Otomatik oda kapanışı:** Oyun bitince kurucu odayı kapatır; açık oda kalmaz, tekrar oynamak için yeni oda kurulur.
- **📊 Karne:** Oyun sonunda kategori bazlı doğru/yanlış dökümü + isimle eşleşen kalıcı genel istatistik (localStorage).
- **✍️ Yazım toleransı:** Düelloda Türkçe karakter, büyük/küçük harf ve 6+ harfli kelimelerde 1 harflik hata tolere edilir ("Antartika", "Viyetnam", "Avusturalya" geçer).
- **📱 PWA:** `manifest.json` + `sw.js` ile telefona kurulabilir ve internetsiz çalışır.

## Üç Mod

Ana menüde üç seçenek var:

- **📱 Aynı Cihazda:** Tek telefon/bilgisayarda iki kişi sırayla oynar (internet gerekmez).
- **⚡ Hızlı Eşleşme:** O an bekleyen rastgele bir rakiple eşleşirsin. Kimse yoksa biri gelene kadar beklersin. Aynı zorluğu tercih edenler önce eşleşir. Firebase gerektirir.
- **🤝 Arkadaşınla Oyna:** Biri oda kurar (6 haneli kod), diğeri kodu girip katılır. Firebase gerektirir.

## Telefonda Hemen Test (hosting'siz)

Telefon, bilgisayarla **aynı Wi-Fi'da** olsun. Bilgisayarda bir statik sunucu çalıştır:

```bash
cd bilgi-duellosu && python3 -m http.server 4173
```

Telefonun tarayıcısında aç: `http://<bilgisayar-IP>:4173`
"Aynı Cihazda" modu burada sorunsuz çalışır. (PWA olarak *kurmak* ve *online* mod için HTTPS gerekir.)

## Online Modu Kurma (Firebase — ücretsiz)

Online oyun, iki cihazı buluşturup hamleleri senkronlamak için bir backend ister.
Sunucu yazmana/işletmene gerek yok; Firebase Realtime Database bunu ücretsiz halleder.

1. https://console.firebase.google.com → **Add project** (ücretsiz).
2. Sol menü **Build → Realtime Database → Create Database** → konum seç → **Start in test mode**.
3. Proje ayarları (⚙️) → **Your apps → Web (`</>`)** ekle → çıkan `firebaseConfig` değerlerini
   `firebase-config.js` dosyasına yapıştır (özellikle `databaseURL`).
4. Siteyi **HTTPS** bir yere yükle (GitHub Pages / Netlify — ücretsiz) ya da localhost'ta test et.
5. Bir cihaz "Oda Kur" der, kodu söyler; diğeri "Katıl"a kodu girer; kurucu "Başlat"a basar.

> **Güvenlik notu:** "Test mode" ~30 gün sonra kapanır. Sürekli kullanım için
> Realtime Database → **Rules** ekranına şunu yaz (`rooms` + Hızlı Eşleşme için `matchmaking`):
> ```json
> {
>   "rules": {
>     "rooms":       { "$code": { ".read": true, ".write": true } },
>     "matchmaking": { ".read": true, ".write": true }
>   }
> }
> ```
> ⚠️ Hızlı Eşleşme'nin çalışması için `matchmaking` izni şarttır; yoksa eşleşme yazımları reddedilir.
> Bu basit kural küçük arkadaş grubu için yeterli; herkese açık yayında daha sıkı kural gerekir.

## Telefona PWA Olarak Kurma

HTTPS bir adrese (GitHub Pages/Netlify) yükledikten sonra telefonda aç →
Safari'de "Ana Ekrana Ekle", Chrome'da "Uygulamayı Yükle". Kurulduktan sonra
"Aynı Cihazda" modu internetsiz de çalışır (online mod doğal olarak internet ister).

## Dosya Yapısı

- `index.html` — ekranlar (ana menü, kurulum, online lobi, oyun, bitiş)
- `style.css` — tasarım ve animasyonlar
- `data.js` — **tüm soru içerikleri burada** (soru eklemek için sadece bu dosyayı düzenle)
- `engine.js` — **ortak motor:** render, soru tipleri, süre, puanlama (her iki mod kullanır)
- `game.js` — "Aynı Cihazda" denetleyici
- `online.js` — "Online" denetleyici (oda + senkron)
- `net.js` — Firebase Realtime Database sarmalayıcısı
- `firebase-config.js` — **Firebase anahtarların** (online mod için doldur)
- `manifest.json`, `sw.js`, `icon-*.png` — PWA dosyaları

Mimari: `engine.js` aktif denetleyiciyi `window.GAME` üzerinden okur. Local mod hamleyi
doğrudan belleğe uygular; online mod hamleyi Firebase'e yazar ve gelen anlık güncellemeyle
arayüzü çizer. Böylece soru/render mantığı tek yerde, mod farkı sadece "hamle nereye yazılıyor".

## Soru Ekleme

`data.js` içindeki ilgili diziye yeni bir nesne ekle. Örnek (Başkentler):

```js
{ question: 'Norveç\'in başkenti neresidir?', answer: 'Oslo', wrong: ['Bergen', 'Stavanger', 'Trondheim'], fact: '...' },
```

"Hangisi Daha Eski?" için yıl negatifse MÖ demektir: `{ a: { text: '...', year: -776 }, b: { ... }, fact: '...' }`

## Zorluk Seviyeleri

Oyun başında (hem aynı cihazda hem online) 4 seviyeden biri seçilir:
🐣 **Çok Kolay (Çocuk)** · 🟢 **Kolay** · 🟡 **Orta** · 🔴 **Zor**.
Her sorunun `data.js` içinde bir `d` alanı vardır (0=çocuk, 1=kolay, 2=orta, 3=zor);
deste seçilen zorluğa göre kurulur. Bir kategoride o seviyede soru yoksa en yakın
seviyeye düşülür (oyun asla boş kalmaz). Çocuk seviyesi; Atatürk, en bilinen bayraklar,
milli bayramlar, piramitler, Türkiye'nin bölgeleri gibi en basit soruları içerir.

## Yol Haritası

- [ ] "Karışık" zorluk seçeneği (tüm seviyelerden)
- [ ] Ses efektleri
- [ ] Mobil app (aynı motor + Firebase ile taşınabilir)
