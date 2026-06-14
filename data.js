// ============================================================
// BİLGİ DÜELLOSU — Soru İçerikleri
// Her soruda zorluk alanı `d` vardır:
//   0 = Çok Kolay (Çocuk) · 1 = Kolay · 2 = Orta · 3 = Zor
// Oyun başında seçilen zorluğa göre sorular filtrelenir.
// ============================================================

const DATA = {

  // ---------- KATEGORİ 1: BAYRAKLAR ----------
  bayrak: [
    { flag: '🇹🇷', answer: 'Türkiye', wrong: ['Tunus', 'Cezayir', 'Fas'], fact: 'Ay-yıldız motifi Osmanlı döneminden beri kullanılıyor; bayrak 1936\'da kanunla bugünkü halini aldı.', d: 0 },
    { flag: '🇺🇸', answer: 'Amerika Birleşik Devletleri', wrong: ['Birleşik Krallık', 'Avustralya', 'Liberya'], fact: '50 yıldız 50 eyaleti, 13 şerit ise kurucu 13 koloniyi temsil eder.', d: 0 },
    { flag: '🇩🇪', answer: 'Almanya', wrong: ['Belçika', 'İspanya', 'Avusturya'], fact: 'Siyah-kırmızı-altın renkleri 19. yüzyıldaki birlik hareketinden gelir. Başkenti Berlin\'dir.', d: 0 },
    { flag: '🇮🇹', answer: 'İtalya', wrong: ['İrlanda', 'Macaristan', 'Meksika'], fact: 'Yeşil-beyaz-kırmızı dikey şeritler. İrlanda ve Meksika bayraklarıyla sık karıştırılır!', d: 0 },
    { flag: '🇫🇷', answer: 'Fransa', wrong: ['Hollanda', 'Rusya', 'Lüksemburg'], fact: 'Mavi-beyaz-kırmızı üç renk, 1789 Fransız Devrimi\'nin "özgürlük, eşitlik, kardeşlik" değerlerini temsil eder.', d: 0 },
    { flag: '🇯🇵', answer: 'Japonya', wrong: ['Çin', 'Güney Kore', 'Vietnam'], fact: 'Kırmızı daire güneşi simgeler; Japonya\'ya "Güneşin Doğduğu Ülke" denir.', d: 0 },
    { flag: '🇪🇸', answer: 'İspanya', wrong: ['Portekiz', 'İtalya', 'Romanya'], fact: 'Kırmızı-sarı-kırmızı yatay şeritler; ortadaki arma kraliyet sembolüdür. Başkenti Madrid\'dir.', d: 1 },
    { flag: '🇧🇷', answer: 'Brezilya', wrong: ['Arjantin', 'Portekiz', 'Kolombiya'], fact: 'Yeşil ormanları, sarı eşkenar dörtgen ise madenleri simgeler. Üzerinde "Ordem e Progresso" (Düzen ve İlerleme) yazar.', d: 1 },
    { flag: '🇬🇧', answer: 'Birleşik Krallık', wrong: ['Avustralya', 'Yeni Zelanda', 'Norveç'], fact: '"Union Jack" denir; İngiltere, İskoçya ve İrlanda haçlarının birleşimidir.', d: 1 },
    { flag: '🇨🇳', answer: 'Çin', wrong: ['Vietnam', 'Kuzey Kore', 'Türkiye'], fact: 'Büyük yıldız Komünist Parti\'yi, dört küçük yıldız halkı temsil eder. Dünyanın en kalabalık 2. ülkesidir.', d: 1 },
    { flag: '🇷🇺', answer: 'Rusya', wrong: ['Hollanda', 'Fransa', 'Slovakya'], fact: 'Beyaz-mavi-kırmızı yatay şeritler. Rusya yüzölçümü bakımından dünyanın en büyük ülkesidir.', d: 1 },
    { flag: '🇬🇷', answer: 'Yunanistan', wrong: ['İsrail', 'Finlandiya', 'Uruguay'], fact: 'Mavi-beyaz 9 şerit, "Özgürlük ya da Ölüm" sloganının 9 hecesini temsil eder.', d: 2 },
    { flag: '🇨🇦', answer: 'Kanada', wrong: ['Peru', 'Avusturya', 'Danimarka'], fact: 'Ortadaki akçaağaç yaprağı Kanada\'nın ulusal sembolüdür. Akçaağaç şurubu ile ünlüdür.', d: 1 },
    { flag: '🇰🇷', answer: 'Güney Kore', wrong: ['Japonya', 'Tayland', 'Tayvan'], fact: 'Ortadaki kırmızı-mavi sembol "Taeguk"tur; evrendeki dengeyi (yin-yang) simgeler.', d: 2 },
    { flag: '🇮🇳', answer: 'Hindistan', wrong: ['İrlanda', 'Nijer', 'Fildişi Sahili'], fact: 'Ortadaki 24 kollu tekerlek "Ashoka Çakrası"dır. Hindistan dünyanın en kalabalık ülkesidir.', d: 2 },
    { flag: '🇦🇷', answer: 'Arjantin', wrong: ['Uruguay', 'Yunanistan', 'Guatemala'], fact: 'Ortadaki "Mayıs Güneşi" 1810 bağımsızlık devrimini simgeler. Tango\'nun anavatanıdır.', d: 2 },
    { flag: '🇲🇽', answer: 'Meksika', wrong: ['İtalya', 'Macaristan', 'Bulgaristan'], fact: 'Ortadaki arma, yılan yakalayan bir kartaldır — Aztek efsanesine göre başkent bu işaretin görüldüğü yere kuruldu.', d: 2 },
    { flag: '🇪🇬', answer: 'Mısır', wrong: ['Yemen', 'Suriye', 'Irak'], fact: 'Ortadaki altın kartal "Selahaddin Kartalı"dır. Mısır, piramitleri ve Nil Nehri ile ünlüdür.', d: 2 },
    { flag: '🇸🇪', answer: 'İsveç', wrong: ['Finlandiya', 'Norveç', 'Ukrayna'], fact: 'Sarı İskandinav haçı mavi zemin üzerindedir. Nobel Ödülleri İsveç\'in başkenti Stokholm\'de verilir.', d: 2 },
    { flag: '🇳🇱', answer: 'Hollanda', wrong: ['Lüksemburg', 'Rusya', 'Fransa'], fact: 'Dünyanın en eski üç renkli bayrağıdır (1572). Laleler aslında Hollanda\'ya Osmanlı\'dan götürülmüştür!', d: 2 },
    { flag: '🇵🇹', answer: 'Portekiz', wrong: ['İspanya', 'İtalya', 'Fas'], fact: 'Yeşil umudu, kırmızı denizcilerin kanını simgeler. Portekizliler büyük keşif yolculuklarının öncüsüydü.', d: 2 },
    { flag: '🇦🇺', answer: 'Avustralya', wrong: ['Yeni Zelanda', 'Birleşik Krallık', 'Fiji'], fact: 'Sağdaki yıldızlar "Güney Haçı" takımyıldızıdır; sadece Güney Yarımküre\'den görülür.', d: 2 },
    { flag: '🇦🇿', answer: 'Azerbaycan', wrong: ['Türkiye', 'Özbekistan', 'Türkmenistan'], fact: 'Mavi Türklüğü, kırmızı çağdaşlığı, yeşil İslam\'ı temsil eder. Türkiye ile "iki devlet, tek millet" denir.', d: 2 },
    { flag: '🇺🇦', answer: 'Ukrayna', wrong: ['İsveç', 'Kazakistan', 'Romanya'], fact: 'Mavi gökyüzünü, sarı buğday tarlalarını simgeler. Ukrayna "Avrupa\'nın tahıl ambarı" olarak bilinir.', d: 2 },
    { flag: '🇳🇴', answer: 'Norveç', wrong: ['İzlanda', 'Danimarka', 'Fransa'], fact: 'Fiyortları ve kuzey ışıkları ile ünlüdür. Bayrağındaki haç tüm İskandinav bayraklarında ortaktır.', d: 2 },
    { flag: '🇨🇭', answer: 'İsviçre', wrong: ['Danimarka', 'Türkiye', 'Kanada'], fact: 'Dünyada kare şeklinde olan iki bayraktan biridir (diğeri Vatikan). Kızılhaç sembolü bu bayraktan esinlenmiştir.', d: 2 },
    { flag: '🇵🇱', answer: 'Polonya', wrong: ['Monako', 'Endonezya', 'Çekya'], fact: 'Beyaz-kırmızı. Endonezya ve Monako bayrakları tam tersidir (kırmızı üstte)!', d: 2 },
    { flag: '🇫🇮', answer: 'Finlandiya', wrong: ['İsveç', 'Yunanistan', 'İzlanda'], fact: 'Mavi haç ülkenin binlerce gölünü ve gökyüzünü simgeler. Finlandiya\'da yaklaşık 188.000 göl vardır!', d: 2 },
    { flag: '🇩🇰', answer: 'Danimarka', wrong: ['Norveç', 'İsviçre', 'Polonya'], fact: '"Dannebrog" dünyanın hâlâ kullanılan en eski ulusal bayrağı kabul edilir (1219).', d: 2 },
    { flag: '🇮🇪', answer: 'İrlanda', wrong: ['İtalya', 'Fildişi Sahili', 'Macaristan'], fact: 'Yeşil Katolikleri, turuncu Protestanları, beyaz aradaki barışı simgeler. İtalya bayrağıyla karıştırılır ama İrlanda\'nınki turuncudur.', d: 2 },

    // ---- ZOR (d=3): gerçekten obscure bayraklar, seçenekler de aynı bölgeden ----
    // Mikro devletler
    { flag: '🇦🇩', answer: 'Andorra', wrong: ['Moldova', 'Romanya', 'Çad'], fact: 'Pireneler\'de Fransa-İspanya arasında küçük bir prenslik. Bayrağı Çad ve Romanya\'ya çok benzer; ortadaki arma onu ayırır.', d: 3 },
    { flag: '🇸🇲', answer: 'San Marino', wrong: ['Honduras', 'Arjantin', 'El Salvador'], fact: 'İtalya\'nın içinde kalan dünyanın en eski cumhuriyetidir (301).', d: 3 },
    { flag: '🇱🇮', answer: 'Lihtenştayn', wrong: ['Haiti', 'Karadağ', 'Lüksemburg'], fact: 'İsviçre-Avusturya arasında bir prenslik. Bayrağı 1936 Olimpiyatları\'nda Haiti ile aynı çıkınca taca taç eklendi!', d: 3 },
    { flag: '🇲🇹', answer: 'Malta', wrong: ['Endonezya', 'Polonya', 'Singapur'], fact: 'Akdeniz\'in ortasında küçük bir ada ülkesi. Soldaki haç İngilizlerin verdiği George Haçı\'dır.', d: 3 },
    { flag: '🇱🇺', answer: 'Lüksemburg', wrong: ['Hollanda', 'Paraguay', 'Estonya'], fact: 'Hollanda bayrağıyla neredeyse aynıdır; sadece mavi tonu biraz daha açıktır!', d: 3 },
    { flag: '🇲🇨', answer: 'Monako', wrong: ['Endonezya', 'Polonya', 'Singapur'], fact: 'Endonezya bayrağıyla aynıdır! Sadece en/boy oranı farklıdır. Monaco, Fransa\'ya bağlı küçük bir prensliktir.', d: 3 },
    { flag: '🇲🇪', answer: 'Karadağ', wrong: ['Sırbistan', 'Arnavutluk', 'Kuzey Makedonya'], fact: 'Kırmızı zemin üzerinde altın çift başlı kartal. 2006\'da bağımsız oldu.', d: 3 },

    // Asya
    { flag: '🇱🇰', answer: 'Sri Lanka', wrong: ['Bhutan', 'Nepal', 'Myanmar'], fact: 'Ortada kılıçlı bir aslan. Hindistan\'ın güneyindeki bu ada ülkesinin başkenti Kolombo\'dur.', d: 3 },
    { flag: '🇧🇹', answer: 'Bhutan', wrong: ['Sri Lanka', 'Nepal', 'Tayvan'], fact: 'Bayrağında bir ejderha var! Himalayalar\'da küçük bir krallık; "Gayri Safi Milli Mutluluk" ölçer.', d: 3 },
    { flag: '🇳🇵', answer: 'Nepal', wrong: ['Bhutan', 'Sri Lanka', 'Bangladeş'], fact: 'Dünyadaki dikdörtgen olmayan tek ulusal bayraktır — iki üçgenden oluşur. Everest Nepal\'dedir.', d: 3 },
    { flag: '🇲🇳', answer: 'Moğolistan', wrong: ['Tayvan', 'Tibet', 'Türkmenistan'], fact: 'Soldaki sembol "Soyombo"dur; ay, güneş ve ateşi simgeler. Cengiz Han\'ın ülkesidir.', d: 3 },
    { flag: '🇰🇿', answer: 'Kazakistan', wrong: ['Kırgızistan', 'Tacikistan', 'Özbekistan'], fact: 'Mavi zeminde güneş ve kartal. Yüzölçümüyle dünyanın 9. büyük ülkesi, denize kıyısı olmayan en büyük ülkedir.', d: 3 },
    { flag: '🇲🇲', answer: 'Myanmar', wrong: ['Litvanya', 'Bolivya', 'Etiyopya'], fact: 'Sarı-yeşil-kırmızı şeritler ortada beyaz yıldız. Eski adı Burma\'dır.', d: 3 },
    { flag: '🇰🇭', answer: 'Kamboçya', wrong: ['Tayland', 'Laos', 'Vietnam'], fact: 'Bayrağında bir tapınak (Angkor Wat) olan tek ülkedir.', d: 3 },

    // Afrika
    { flag: '🇪🇹', answer: 'Etiyopya', wrong: ['Gana', 'Bolivya', 'Senegal'], fact: 'Yeşil-sarı-kırmızı pan-Afrika renklerinin kaynağıdır. Sömürge olmamış nadir Afrika ülkelerindendir.', d: 3 },
    { flag: '🇸🇳', answer: 'Senegal', wrong: ['Mali', 'Kamerun', 'Gine'], fact: 'Yeşil-sarı-kırmızı şeritler ortada yeşil yıldız. Mali bayrağıyla karıştırılır (Mali\'de yıldız yoktur).', d: 3 },
    { flag: '🇰🇪', answer: 'Kenya', wrong: ['Malavi', 'Güney Sudan', 'Uganda'], fact: 'Ortada bir Maasai kalkanı ve mızraklar var. Safari turlarının başkenti.', d: 3 },
    { flag: '🇬🇭', answer: 'Gana', wrong: ['Bolivya', 'Etiyopya', 'Kamerun'], fact: 'Kırmızı-sarı-yeşil ortada siyah yıldız. Afrika\'nın "Kara Yıldızı" olarak bilinir.', d: 3 },
    { flag: '🇹🇳', answer: 'Tunus', wrong: ['Türkiye', 'Cezayir', 'Fas'], fact: 'Türk bayrağıyla karıştırılır ama Tunus\'unkinde ay-yıldız beyaz bir daire içindedir.', d: 3 },
    { flag: '🇿🇦', answer: 'Güney Afrika', wrong: ['Namibya', 'Kongo', 'Zimbabwe'], fact: '6 renkli, dünyanın en renkli ulusal bayrağıdır. Apartheid sonrası 1994\'te kabul edildi.', d: 3 },

    // Orta Doğu / az bilinen
    { flag: '🇱🇧', answer: 'Lübnan', wrong: ['Suriye', 'Ürdün', 'Irak'], fact: 'Ortadaki yeşil sedir ağacı ülkenin ulusal sembolüdür; binlerce yıllık ağaçlar Lübnan dağlarında hâlâ ayakta.', d: 3 },
    { flag: '🇶🇦', answer: 'Katar', wrong: ['Bahreyn', 'Umman', 'Yemen'], fact: 'Bahreyn bayrağıyla karıştırılır; Katar\'ınki bordo (kestane) renkte ve dokuz zikzak vardır.', d: 3 },

    // Avrupa (az bilinen)
    { flag: '🇲🇩', answer: 'Moldova', wrong: ['Romanya', 'Çad', 'Andorra'], fact: 'Romanya bayrağıyla aynıdır; tek fark ortadaki devlet armasıdır.', d: 3 },
    { flag: '🇱🇻', answer: 'Letonya', wrong: ['Avusturya', 'Endonezya', 'Litvanya'], fact: 'Koyu kırmızı-beyaz-koyu kırmızı. Avusturya bayrağıyla karıştırılır ama Letonya\'nınki daha koyu ve beyaz şerit daha incedir.', d: 3 },
    { flag: '🇸🇰', answer: 'Slovakya', wrong: ['Slovenya', 'Hırvatistan', 'Rusya'], fact: 'Slav üç rengi (beyaz-mavi-kırmızı) + arma. Slovenya, Hırvatistan ve Sırbistan bayrakları çok benzer; armalar onları ayırır.', d: 3 },
  ],

  // ---------- KATEGORİ 2: ÜNLÜ KİŞİLER ----------
  unlu: [
    { question: 'Türkiye Cumhuriyeti\'nin kurucusu ve ilk cumhurbaşkanı kimdir?', answer: 'Mustafa Kemal Atatürk', wrong: ['İsmet İnönü', 'Fevzi Çakmak', 'Kâzım Karabekir'], fact: '1881\'de Selanik\'te doğdu. Harf devrimi, kadınlara seçme-seçilme hakkı gibi pek çok yeniliğin öncüsüdür.', d: 0 },
    { question: 'Yerçekimini bulan, "başına elma düştüğü" anlatılan ünlü bilim insanı kimdir?', answer: 'Isaac Newton', wrong: ['Atatürk', 'Einstein', 'Edison'], fact: 'Elma başına düşmedi; ağaçtan düşen elmayı görüp yerçekimini düşündüğü anlatılır.', d: 0 },
    { question: '"Mona Lisa" tablosunu yapan ünlü ressam kimdir?', answer: 'Leonardo da Vinci', wrong: ['Picasso', 'Van Gogh', 'Michelangelo'], fact: 'Aynı zamanda mucitti; helikopter ve paraşüt benzeri makineleri 500 yıl önce çizmişti.', d: 0 },
    { question: 'Görelilik (izafiyet) teorisini geliştiren, E=mc² formülüyle tanınan fizikçi kimdir?', answer: 'Albert Einstein', wrong: ['Isaac Newton', 'Nikola Tesla', 'Stephen Hawking'], fact: '1921 Nobel Fizik Ödülü\'nü görelilik için değil, fotoelektrik etki çalışması için aldı.', d: 1 },
    { question: '1453\'te İstanbul\'u fethederek Bizans İmparatorluğu\'na son veren Osmanlı padişahı kimdir?', answer: 'Fatih Sultan Mehmet', wrong: ['Yavuz Sultan Selim', 'Kanuni Sultan Süleyman', 'Osman Gazi'], fact: 'İstanbul\'u fethettiğinde sadece 21 yaşındaydı. Gemileri karadan yürüterek Haliç\'e indirdi.', d: 1 },
    { question: '1969\'da Ay\'a ayak basan ilk insan kimdir?', answer: 'Neil Armstrong', wrong: ['Buzz Aldrin', 'Yuri Gagarin', 'Michael Collins'], fact: '"Bu, bir insan için küçük ama insanlık için dev bir adımdır" dedi. Uzaya çıkan ilk insan ise Gagarin\'dir (1961).', d: 1 },
    { question: 'Ampulü ticari olarak kullanılabilir hale getiren, 1.000\'den fazla patenti olan Amerikalı mucit kimdir?', answer: 'Thomas Edison', wrong: ['Nikola Tesla', 'Benjamin Franklin', 'Graham Bell'], fact: '"Dehanın yüzde 1\'i ilham, yüzde 99\'u terdir" sözü ona aittir.', d: 1 },
    { question: 'Son Akşam Yemeği tablosunu da yapan; mucit ve anatomist olan Rönesans dehası kimdir?', answer: 'Leonardo da Vinci', wrong: ['Michelangelo', 'Rafael', 'Vincent van Gogh'], fact: 'Notlarını ayna yazısıyla (tersten) yazardı.', d: 2 },
    { question: 'Antik Mısır\'ın son firavunu olan, Sezar ve Antonius ile ittifak kuran ünlü kraliçe kimdir?', answer: 'Kleopatra', wrong: ['Nefertiti', 'Hatşepsut', 'Helen'], fact: 'Aslında Mısırlı değil, Makedon kökenli Ptolemaios hanedanındandı. 9 dil konuştuğu söylenir.', d: 2 },
    { question: 'Fransa İmparatoru olup Avrupa\'nın büyük bölümünü fetheden, Waterloo Savaşı\'nda yenilen komutan kimdir?', answer: 'Napolyon Bonapart', wrong: ['XIV. Louis', 'Charles de Gaulle', 'Büyük İskender'], fact: 'Çıkardığı medeni kanun bugün hâlâ pek çok ülkeyi etkiler.', d: 2 },
    { question: '"Gel, gel, ne olursan ol yine gel" çağrısıyla tanınan, Mesnevi\'nin yazarı büyük mutasavvıf kimdir?', answer: 'Mevlânâ Celâleddîn-i Rûmî', wrong: ['Yunus Emre', 'Hacı Bektâş-ı Velî', 'Şems-i Tebrizî'], fact: 'Konya\'da yaşadı. Her yıl aralık ayında Konya\'da Şeb-i Arus törenleri düzenlenir.', d: 2 },
    { question: 'Süleymaniye ve Selimiye camilerini inşa eden, Osmanlı\'nın en büyük başmimarı kimdir?', answer: 'Mimar Sinan', wrong: ['Mimar Kemaleddin', 'Sedefkâr Mehmed Ağa', 'Davud Ağa'], fact: 'Selimiye Camii\'ni "ustalık eserim" olarak tanımladı. 300\'den fazla yapıya imza attı.', d: 2 },
    { question: 'Radyoaktivite üzerine çalışan, iki farklı dalda Nobel Ödülü kazanan ilk bilim insanı kimdir?', answer: 'Marie Curie', wrong: ['Ada Lovelace', 'Rosalind Franklin', 'Lise Meitner'], fact: 'Polonyum elementine, doğduğu ülke Polonya\'nın adını verdi. Defterleri bugün bile radyoaktiftir!', d: 2 },
    { question: '"Sihirli Flüt" ve "Türk Marşı" ile tanınan, 5 yaşında beste yapan Avusturyalı besteci kimdir?', answer: 'Wolfgang Amadeus Mozart', wrong: ['Ludwig van Beethoven', 'Johann Sebastian Bach', 'Frédéric Chopin'], fact: '35 yıllık ömrüne 600\'den fazla eser sığdırdı. "Türk Marşı" mehter müziğinden esinlenmiştir.', d: 2 },
    { question: 'Kübizm akımının kurucusu olan, "Guernica" tablosuyla savaşın acısını anlatan İspanyol ressam kimdir?', answer: 'Pablo Picasso', wrong: ['Salvador Dalí', 'Claude Monet', 'Henri Matisse'], fact: 'Hayatı boyunca 20.000\'den fazla eser üretti.', d: 2 },
    { question: 'Hamlet ve Romeo ve Juliet gibi oyunların yazarı, "olmak ya da olmamak" sözüyle tanınan kimdir?', answer: 'William Shakespeare', wrong: ['Charles Dickens', 'Victor Hugo', 'Lev Tolstoy'], fact: 'İngilizceye 1.700\'den fazla yeni kelime kazandırdığı tahmin edilir. Doğum ve ölüm günü: 23 Nisan.', d: 2 },
    { question: 'Hindistan\'ın bağımsızlık mücadelesini şiddet kullanmadan, pasif direnişle yöneten lider kimdir?', answer: 'Mahatma Gandhi', wrong: ['Nelson Mandela', 'Jawaharlal Nehru', 'Martin Luther King'], fact: '"Mahatma" bir unvandır; "büyük ruh" anlamına gelir. Tuz Yürüyüşü en ünlü eylemidir.', d: 2 },
    { question: 'Alternatif akım (AC) sistemini geliştiren, kablosuz enerji üzerine çalışan Sırp asıllı mucit kimdir?', answer: 'Nikola Tesla', wrong: ['Thomas Edison', 'Alexander Graham Bell', 'James Watt'], fact: 'Edison ile yaşadığı rekabete "Akım Savaşları" denir.', d: 3 },
    { question: '"Yıldızlı Gece" ve "Ayçiçekleri" tablolarını yapan, yaşarken tek tablo satabilen Hollandalı ressam kimdir?', answer: 'Vincent van Gogh', wrong: ['Claude Monet', 'Paul Cézanne', 'Rembrandt'], fact: '10 yılda 2.000\'den fazla eser üretti.', d: 3 },
    { question: 'Duyma yetisini kaybetmesine rağmen 9. Senfoni gibi başyapıtlar besteleyen Alman besteci kimdir?', answer: 'Ludwig van Beethoven', wrong: ['Wolfgang Amadeus Mozart', 'Johannes Brahms', 'Franz Schubert'], fact: '9. Senfoni\'nin finalindeki "Neşeye Övgü" bugün Avrupa Birliği\'nin marşıdır.', d: 3 },
    { question: '"El-Kanun fi\'t-Tıb" adlı tıp ansiklopedisi Avrupa\'da yüzyıllarca okutulan İslam bilgini kimdir?', answer: 'İbn-i Sina', wrong: ['Farabi', 'Biruni', 'Harezmi'], fact: 'Batı\'da "Avicenna" olarak bilinir. Tıp kitabı Avrupa üniversitelerinde 600 yıl okutuldu.', d: 3 },
  ],

  // ---------- KATEGORİ 3: DOĞRU / YANLIŞ ----------
  dogruYanlis: [
    { statement: 'Türkiye\'nin başkenti Ankara\'dır.', answer: true, fact: 'Ankara, Kurtuluş Savaşı\'nın merkezi olduğu için 13 Ekim 1923\'te başkent ilan edildi.', d: 0 },
    { statement: '23 Nisan, Ulusal Egemenlik ve Çocuk Bayramı\'dır.', answer: true, fact: 'Atatürk bu bayramı dünyada çocuklara armağan eden ilk liderdir. 1920\'de TBMM bu tarihte açıldı.', d: 0 },
    { statement: '29 Ekim Cumhuriyet Bayramı\'dır.', answer: true, fact: 'Cumhuriyet 29 Ekim 1923\'te ilan edildi.', d: 0 },
    { statement: 'Piramitler Mısır\'dadır.', answer: true, fact: 'En ünlüsü Giza\'daki Keops Piramidi, antik dünyanın 7 harikasından ayakta kalan tek yapıdır.', d: 0 },
    { statement: 'Penguenler sıcak çöllerde yaşar.', answer: false, fact: 'Penguenler Güney Yarımküre\'nin soğuk bölgelerinde (Antarktika ve çevresi) yaşar.', d: 0 },
    { statement: 'Balıklar suda yaşar.', answer: true, fact: 'Balıklar solungaçları sayesinde sudaki oksijeni alır.', d: 0 },
    { statement: 'Güneş batıdan doğar.', answer: false, fact: 'Güneş doğudan doğar, batıdan batar. Bu, Dünya\'nın dönüş yönünden kaynaklanır.', d: 0 },
    { statement: 'Bir haftada 7 gün vardır.', answer: true, fact: 'Pazartesi, Salı, Çarşamba, Perşembe, Cuma, Cumartesi ve Pazar.', d: 0 },
    { statement: 'Türkiye\'nin üç tarafı denizlerle çevrilidir.', answer: true, fact: 'Kuzeyde Karadeniz, batıda Ege, güneyde Akdeniz. Marmara ise tamamen bizim iç denizimizdir.', d: 1 },
    { statement: 'Japonya\'nın başkenti Pekin\'dir.', answer: false, fact: 'Japonya\'nın başkenti Tokyo\'dur; Pekin, Çin\'in başkentidir.', d: 1 },
    { statement: 'Işık, sesten daha hızlıdır.', answer: true, fact: 'Bu yüzden şimşeği önce görür, gök gürültüsünü sonra duyarız. Işık saniyede ~300.000 km gider.', d: 1 },
    { statement: 'Penguenler Kuzey Kutbu\'nda yaşar.', answer: false, fact: 'Penguenler Güney Yarımküre\'de yaşar. Kuzey Kutbu\'nda ise kutup ayıları vardır — ikisi doğada hiç karşılaşmaz!', d: 1 },
    { statement: 'Mona Lisa tablosunu Picasso yapmıştır.', answer: false, fact: 'Mona Lisa, Leonardo da Vinci\'nin eseridir ve Paris\'teki Louvre Müzesi\'nde sergilenir.', d: 1 },
    { statement: 'Dünya, Güneş etrafındaki turunu yaklaşık 365 günde tamamlar.', answer: true, fact: 'Tam süre 365 gün 6 saattir; bu yüzden 4 yılda bir şubat 29 çeker (artık yıl).', d: 1 },
    { statement: 'Kanguru, Avustralya\'ya özgü bir hayvandır.', answer: true, fact: 'Avustralya\'da kanguru sayısı insan sayısından fazladır!', d: 1 },
    { statement: 'Avustralya hem bir ülke hem de bir kıtadır.', answer: true, fact: 'Avustralya, dünyada tek başına bir kıta kaplayan tek ülkedir.', d: 1 },
    { statement: 'İstanbul, iki kıtada yer alan bir şehirdir.', answer: true, fact: 'İstanbul Boğazı, Asya ile Avrupa\'yı ayırır.', d: 1 },
    { statement: 'Amazon Nehri Arjantin\'den geçer.', answer: false, fact: 'Amazon; Peru, Kolombiya ve Brezilya\'dan geçer. Taşıdığı su bakımından dünyanın en büyük nehridir.', d: 2 },
    { statement: 'Dünyanın en büyük okyanusu Pasifik (Büyük) Okyanusu\'dur.', answer: true, fact: 'Pasifik, tüm kara parçalarının toplamından daha geniştir; en derin nokta Mariana Çukuru buradadır.', d: 2 },
    { statement: 'Everest Dağı Avrupa\'dadır.', answer: false, fact: 'Everest, Asya\'da Himalayalar\'dadır. Avrupa\'nın en yükseği Elbrus Dağı\'dır.', d: 2 },
    { statement: 'Rusya dünyanın en kalabalık ülkesidir.', answer: false, fact: 'Rusya yüzölçümü bakımından en büyük ülkedir; en kalabalık ülke ise Hindistan\'dır.', d: 2 },
    { statement: 'Sahra Çölü Afrika kıtasındadır.', answer: true, fact: 'Sahra, dünyanın en büyük sıcak çölüdür; yaklaşık ABD kadar geniştir.', d: 2 },
    { statement: 'İnsan vücudundaki en büyük organ kalptir.', answer: false, fact: 'En büyük organ deridir; yetişkin bir insanda yaklaşık 2 m² yüzeye sahiptir.', d: 2 },
    { statement: 'Vatikan, dünyanın en küçük ülkesidir.', answer: true, fact: 'Yüzölçümü yaklaşık 0,44 km²\'dir ve Roma\'nın içindedir.', d: 2 },
    { statement: 'Nil Nehri dünyanın en uzun nehirlerinden biridir.', answer: true, fact: 'Yaklaşık 6.650 km ile Amazon\'la "en uzun nehir" unvanı için yarışır ve 11 ülkeden geçer.', d: 2 },
    { statement: 'Çin Seddi uzaydan çıplak gözle rahatça görülür.', answer: false, fact: 'Bu yaygın bir şehir efsanesidir; astronotlar çıplak gözle seçilemediğini doğrulamıştır.', d: 3 },
    { statement: 'Mısır\'da yalnızca bir piramit vardır.', answer: false, fact: 'Mısır\'da 100\'den fazla piramit bulunur.', d: 3 },
    // Daha çok Zor seviye ifade
    { statement: 'Kanada\'nın iki resmi dili İngilizce ve Fransızca\'dır.', answer: true, fact: 'Quebec eyaletinin ana dili Fransızca\'dır.', d: 3 },
    { statement: 'Avustralya, Birleşik Krallık\'tan daha büyüktür.', answer: true, fact: 'Avustralya yaklaşık 31 kat daha büyüktür.', d: 3 },
    { statement: 'Antarktika\'da hiç yerli halk yaşamaz.', answer: true, fact: 'Sadece geçici olarak bilim insanları yaşar.', d: 3 },
    { statement: 'İsviçre\'nin başkenti Zürih\'tir.', answer: false, fact: 'İsviçre\'nin başkenti Bern\'dir; Zürih en büyük şehridir.', d: 3 },
    { statement: 'Bir yılda 366 gün olan yıla "artık yıl" denir.', answer: true, fact: '4 yılda bir gerçekleşir; Şubat 29 gün çeker.', d: 2 },
    { statement: 'Türkiye\'nin en büyük gölü Tuz Gölü\'dür.', answer: false, fact: 'Türkiye\'nin en büyük gölü Van Gölü\'dür. Tuz Gölü ikinci sıradadır.', d: 3 },
  ],

  // ---------- KATEGORİ: BAŞKENTLER ----------
  baskent: [
    { question: 'Türkiye\'nin başkenti neresidir?', answer: 'Ankara', wrong: ['İstanbul', 'İzmir', 'Bursa'], fact: 'Ankara, 13 Ekim 1923\'te başkent ilan edildi.', d: 0 },
    { question: 'Fransa\'nın başkenti neresidir?', answer: 'Paris', wrong: ['Lyon', 'Marsilya', 'Nice'], fact: 'Eyfel Kulesi 1889 Dünya Fuarı için yapıldı; geçici olması planlanıyordu.', d: 1 },
    { question: 'Almanya\'nın başkenti neresidir?', answer: 'Berlin', wrong: ['Münih', 'Hamburg', 'Frankfurt'], fact: 'Berlin Duvarı şehri 28 yıl ikiye böldü ve 1989\'da yıkıldı.', d: 1 },
    { question: 'İtalya\'nın başkenti neresidir?', answer: 'Roma', wrong: ['Milano', 'Venedik', 'Napoli'], fact: 'Dünyanın en küçük ülkesi Vatikan, Roma\'nın tam ortasındadır.', d: 1 },
    { question: 'Birleşik Krallık\'ın (İngiltere) başkenti neresidir?', answer: 'Londra', wrong: ['Manchester', 'Liverpool', 'Edinburgh'], fact: '"Big Ben" aslında kulenin değil, içindeki çanın adıdır.', d: 1 },
    { question: 'İspanya\'nın başkenti neresidir?', answer: 'Madrid', wrong: ['Barselona', 'Sevilla', 'Valensiya'], fact: 'Madrid, Avrupa\'nın en yüksek rakımlı başkentlerinden biridir.', d: 2 },
    { question: 'Japonya\'nın başkenti neresidir?', answer: 'Tokyo', wrong: ['Osaka', 'Kyoto', 'Hiroşima'], fact: 'Tokyo metropol bölgesi dünyanın en kalabalık şehir bölgesidir. Eski başkent Kyoto\'ydu.', d: 2 },
    { question: 'Çin\'in başkenti neresidir?', answer: 'Pekin', wrong: ['Şanghay', 'Hong Kong', 'Guangzhou'], fact: 'Şanghay daha kalabalık olsa da başkent Pekin\'dir.', d: 2 },
    { question: 'Rusya\'nın başkenti neresidir?', answer: 'Moskova', wrong: ['St. Petersburg', 'Kazan', 'Soçi'], fact: 'St. Petersburg yaklaşık 200 yıl başkentti; 1918\'de başkent yeniden Moskova oldu.', d: 2 },
    { question: 'Yunanistan\'ın başkenti neresidir?', answer: 'Atina', wrong: ['Selanik', 'Patra', 'Larisa'], fact: 'Atina, demokrasinin doğduğu şehir kabul edilir.', d: 2 },
    { question: 'Mısır\'ın başkenti neresidir?', answer: 'Kahire', wrong: ['İskenderiye', 'Luksor', 'Giza'], fact: 'Ünlü piramitler Kahire\'nin bitişiğindeki Giza\'dadır.', d: 2 },
    { question: 'Amerika Birleşik Devletleri\'nin başkenti neresidir?', answer: 'Washington D.C.', wrong: ['New York', 'Los Angeles', 'Chicago'], fact: 'En kalabalık şehir New York\'tur ama başkent Washington D.C.\'dir.', d: 2 },
    { question: 'Kanada\'nın başkenti neresidir?', answer: 'Ottawa', wrong: ['Toronto', 'Vancouver', 'Montreal'], fact: 'Çoğu kişi Toronto sanır ama başkent Ottawa\'dır.', d: 3 },
    { question: 'Avustralya\'nın başkenti neresidir?', answer: 'Kanberra', wrong: ['Sidney', 'Melbourne', 'Brisbane'], fact: 'Sidney ile Melbourne yarışınca, ikisinin ortasına sıfırdan Kanberra kuruldu.', d: 3 },
    { question: 'Brezilya\'nın başkenti neresidir?', answer: 'Brasília', wrong: ['Rio de Janeiro', 'São Paulo', 'Salvador'], fact: 'Başkent Rio değildir! Brasília 1960\'ta sıfırdan planlanarak kuruldu.', d: 3 },
    { question: 'Hollanda\'nın başkenti neresidir?', answer: 'Amsterdam', wrong: ['Rotterdam', 'Lahey', 'Utrecht'], fact: 'Resmi başkent Amsterdam\'dır ama hükümet Lahey\'dedir.', d: 3 },
    { question: 'Azerbaycan\'ın başkenti neresidir?', answer: 'Bakü', wrong: ['Gence', 'Sumgayıt', 'Şuşa'], fact: 'Bakü, dünyanın en alçak rakımlı başkentidir.', d: 3 },
  ],

  // ---------- KATEGORİ: HANGİ KITADA? ----------
  kita: [
    { question: 'Mısır hangi kıtadadır?', answer: 'Afrika', wrong: ['Asya', 'Avrupa', 'Okyanusya'], fact: 'Mısır\'ın Sina Yarımadası aslında Asya\'dadır — yani Mısır teknik olarak iki kıtaya yayılır.', d: 1 },
    { question: 'Japonya hangi kıtadadır?', answer: 'Asya', wrong: ['Okyanusya', 'Avrupa', 'Kuzey Amerika'], fact: 'Japonya yaklaşık 6.800 adadan oluşan bir takımada ülkesidir.', d: 1 },
    { question: 'Almanya hangi kıtadadır?', answer: 'Avrupa', wrong: ['Asya', 'Kuzey Amerika', 'Afrika'], fact: 'Almanya\'nın 9 komşusu vardır.', d: 1 },
    { question: 'Brezilya hangi kıtadadır?', answer: 'Güney Amerika', wrong: ['Kuzey Amerika', 'Afrika', 'Avrupa'], fact: 'Brezilya, Güney Amerika\'nın neredeyse yarısını kaplar.', d: 1 },
    { question: 'Hindistan hangi kıtadadır?', answer: 'Asya', wrong: ['Afrika', 'Avrupa', 'Okyanusya'], fact: 'Hindistan o kadar büyüktür ki kendi başına "alt kıta" olarak anılır.', d: 1 },
    { question: 'Kanada hangi kıtadadır?', answer: 'Kuzey Amerika', wrong: ['Avrupa', 'Asya', 'Güney Amerika'], fact: 'Kanada, dünyanın en büyük 2. ülkesidir.', d: 1 },
    { question: 'Meksika hangi kıtadadır?', answer: 'Kuzey Amerika', wrong: ['Güney Amerika', 'Avrupa', 'Afrika'], fact: 'Meksika, Güney Amerika sanılır ama coğrafi olarak Kuzey Amerika\'dadır.', d: 2 },
    { question: 'Kenya hangi kıtadadır?', answer: 'Afrika', wrong: ['Asya', 'Güney Amerika', 'Okyanusya'], fact: 'Ekvator çizgisi Kenya\'nın tam ortasından geçer.', d: 2 },
    { question: 'Arjantin hangi kıtadadır?', answer: 'Güney Amerika', wrong: ['Kuzey Amerika', 'Avrupa', 'Afrika'], fact: 'Arjantin\'in güneyindeki Patagonya, Antarktika\'ya en yakın bölgelerdendir.', d: 2 },
    { question: 'Nijerya hangi kıtadadır?', answer: 'Afrika', wrong: ['Güney Amerika', 'Asya', 'Okyanusya'], fact: 'Nijerya, Afrika\'nın en kalabalık ülkesidir.', d: 2 },
    { question: 'Vietnam hangi kıtadadır?', answer: 'Asya', wrong: ['Afrika', 'Okyanusya', 'Güney Amerika'], fact: 'Vietnam, dünyanın en büyük kahve üreticilerinden biridir.', d: 2 },
    { question: 'Norveç hangi kıtadadır?', answer: 'Avrupa', wrong: ['Kuzey Amerika', 'Asya', 'Okyanusya'], fact: 'Norveç\'in kuzeyinde yazın güneş hiç batmaz.', d: 2 },
    { question: 'Peru hangi kıtadadır?', answer: 'Güney Amerika', wrong: ['Afrika', 'Asya', 'Kuzey Amerika'], fact: 'İnka şehri Machu Picchu, Peru\'nun And Dağları\'ndadır.', d: 2 },
    { question: 'Fas hangi kıtadadır?', answer: 'Afrika', wrong: ['Avrupa', 'Asya', 'Güney Amerika'], fact: 'Fas ile İspanya arası sadece 14 km\'dir.', d: 2 },
    { question: 'Yeni Zelanda hangi kıtadadır?', answer: 'Okyanusya', wrong: ['Asya', 'Avrupa', 'Güney Amerika'], fact: 'Yeni Zelanda, Avustralya\'nın parçası değildir; sembolü kivi kuşudur.', d: 2 },
    // Zor: hangi kıtada olduğu tartışmalı/şaşırtıcı ülkeler
    { question: 'Kıbrıs jeopolitik olarak hangi kıtaya dahil edilir?', answer: 'Avrupa', wrong: ['Asya', 'Afrika', 'Orta Doğu (kıta değil)'], fact: 'Coğrafi olarak Asya\'ya yakındır ama AB üyesi olduğu için siyasi olarak Avrupa\'ya dahildir.', d: 3 },
    { question: 'Surinam hangi kıtadadır?', answer: 'Güney Amerika', wrong: ['Afrika', 'Asya', 'Karayipler'], fact: 'Resmi dili Felemenkçe (Hollandaca) olan tek Güney Amerika ülkesidir.', d: 3 },
    { question: 'Madagaskar hangi kıtadadır?', answer: 'Afrika', wrong: ['Asya', 'Okyanusya', 'Antarktika'], fact: 'Dünyanın 4. büyük adasıdır; Afrika kıtasının doğusundadır. Lemurlarıyla ünlüdür.', d: 3 },
    { question: 'Papua Yeni Gine hangi kıtadadır?', answer: 'Okyanusya', wrong: ['Asya', 'Afrika', 'Güney Amerika'], fact: 'Dünyanın dil çeşitliliği en yüksek ülkesidir — 800\'den fazla dil konuşulur.', d: 3 },
    { question: 'Ermenistan hangi kıtadadır?', answer: 'Asya', wrong: ['Avrupa', 'Afrika', 'Orta Doğu (kıta değil)'], fact: 'Kafkasya\'daki Ermenistan, coğrafi olarak Asya\'da kabul edilir.', d: 3 },
  ],

  // ---------- KATEGORİ: HANGİ BÖLGEDE? (Türkiye'nin 7 bölgesi) ----------
  bolge: [
    { question: 'İstanbul hangi bölgemizdedir?', answer: 'Marmara', wrong: ['Ege', 'Karadeniz', 'İç Anadolu'], fact: 'Marmara, Türkiye\'nin en kalabalık bölgesidir.', d: 0 },
    { question: 'İzmir hangi bölgemizdedir?', answer: 'Ege', wrong: ['Marmara', 'Akdeniz', 'İç Anadolu'], fact: 'Ege Bölgesi zeytin ve incir üretimiyle ünlüdür.', d: 0 },
    { question: 'Antalya hangi bölgemizdedir?', answer: 'Akdeniz', wrong: ['Ege', 'Marmara', 'Güneydoğu Anadolu'], fact: 'Akdeniz Bölgesi turizm ve narenciye ile ünlüdür.', d: 0 },
    { question: 'Ankara hangi bölgemizdedir?', answer: 'İç Anadolu', wrong: ['Marmara', 'Karadeniz', 'Doğu Anadolu'], fact: 'İç Anadolu, tahıl ambarı olarak bilinir.', d: 0 },
    { question: 'Trabzon hangi bölgemizdedir?', answer: 'Karadeniz', wrong: ['Doğu Anadolu', 'Marmara', 'Ege'], fact: 'Karadeniz Bölgesi çay ve fındık üretimiyle ünlüdür.', d: 0 },
    { question: 'Erzurum hangi bölgemizdedir?', answer: 'Doğu Anadolu', wrong: ['Güneydoğu Anadolu', 'Karadeniz', 'İç Anadolu'], fact: 'Doğu Anadolu, en yüksek ve en soğuk bölgemizdir.', d: 1 },
    { question: 'Gaziantep hangi bölgemizdedir?', answer: 'Güneydoğu Anadolu', wrong: ['Doğu Anadolu', 'Akdeniz', 'İç Anadolu'], fact: 'Güneydoğu Anadolu, baklavası ve mutfağıyla ünlüdür.', d: 1 },
    { question: 'Konya hangi bölgemizdedir?', answer: 'İç Anadolu', wrong: ['Akdeniz', 'Ege', 'Güneydoğu Anadolu'], fact: 'Konya, Türkiye\'nin yüzölçümü en büyük ilidir.', d: 1 },
    { question: 'Bursa hangi bölgemizdedir?', answer: 'Marmara', wrong: ['Ege', 'İç Anadolu', 'Karadeniz'], fact: 'Bursa, Osmanlı\'nın ilk başkentidir.', d: 1 },
    { question: 'Samsun hangi bölgemizdedir?', answer: 'Karadeniz', wrong: ['Marmara', 'İç Anadolu', 'Doğu Anadolu'], fact: 'Atatürk 19 Mayıs 1919\'da Samsun\'a çıkarak Kurtuluş Savaşı\'nı başlattı.', d: 1 },
    { question: 'Diyarbakır hangi bölgemizdedir?', answer: 'Güneydoğu Anadolu', wrong: ['Doğu Anadolu', 'İç Anadolu', 'Akdeniz'], fact: 'Diyarbakır surları, Çin Seddi\'nden sonra en uzun sur yapılarından biridir.', d: 2 },
    { question: 'Van hangi bölgemizdedir?', answer: 'Doğu Anadolu', wrong: ['Güneydoğu Anadolu', 'Karadeniz', 'İç Anadolu'], fact: 'Türkiye\'nin en büyük gölü Van Gölü buradadır.', d: 2 },
    { question: 'Muğla hangi bölgemizdedir?', answer: 'Ege', wrong: ['Akdeniz', 'Marmara', 'İç Anadolu'], fact: 'Bodrum ve Marmaris gibi tatil beldeleri Muğla\'dadır.', d: 2 },
    // Zor: il-bölge eşleşmesi şaşırtıcı olan iller
    { question: 'Bartın hangi bölgemizdedir?', answer: 'Karadeniz', wrong: ['Marmara', 'İç Anadolu', 'Doğu Anadolu'], fact: 'Türkiye\'nin en küçük illerinden biridir.', d: 3 },
    { question: 'Yozgat hangi bölgemizdedir?', answer: 'İç Anadolu', wrong: ['Karadeniz', 'Doğu Anadolu', 'Güneydoğu Anadolu'], fact: 'Çamlık Milli Parkı ile ünlüdür.', d: 3 },
    { question: 'Burdur hangi bölgemizdedir?', answer: 'Akdeniz', wrong: ['Ege', 'İç Anadolu', 'Güneydoğu Anadolu'], fact: 'Salda Gölü ve Sagalassos antik kenti Burdur\'dadır.', d: 3 },
    { question: 'Sinop hangi bölgemizdedir?', answer: 'Karadeniz', wrong: ['Marmara', 'Doğu Anadolu', 'İç Anadolu'], fact: 'Türkiye\'nin en kuzey noktası Sinop\'tadır (İnceburun).', d: 3 },
    { question: 'Karaman hangi bölgemizdedir?', answer: 'İç Anadolu', wrong: ['Akdeniz', 'Doğu Anadolu', 'Ege'], fact: 'Türkçenin resmi dil ilan edildiği yer Karaman\'dır (1277, Karamanoğlu Mehmet Bey).', d: 3 },
    { question: 'Hakkari hangi bölgemizdedir?', answer: 'Doğu Anadolu', wrong: ['Güneydoğu Anadolu', 'İç Anadolu', 'Karadeniz'], fact: 'Türkiye\'nin en yüksek rakımlı illerindendir.', d: 3 },
    { question: 'Kilis hangi bölgemizdedir?', answer: 'Güneydoğu Anadolu', wrong: ['Akdeniz', 'Doğu Anadolu', 'İç Anadolu'], fact: '1995\'te il olmuş, Türkiye\'nin yeni illerinden biridir.', d: 3 },
    { question: 'Tunceli hangi bölgemizdedir?', answer: 'Doğu Anadolu', wrong: ['Güneydoğu Anadolu', 'Karadeniz', 'İç Anadolu'], fact: 'Eski adı Dersim\'dir; Munzur Dağları ile ünlüdür.', d: 3 },
  ],

  // ---------- KATEGORİ: HANGİSİ DAHA ESKİ? ----------
  eski: [
    { a: { text: 'İstanbul\'un Fethi', year: 1453 }, b: { text: 'Amerika\'nın Keşfi', year: 1492 }, fact: 'Fetih (1453), Kolomb\'un yolculuğundan (1492) 39 yıl öncedir.', d: 2 },
    { a: { text: 'Cumhuriyet\'in ilanı', year: 1923 }, b: { text: 'İkinci Dünya Savaşı\'nın başlaması', year: 1939 }, fact: 'Cumhuriyet 1923\'te ilan edildi; II. Dünya Savaşı 16 yıl sonra başladı.', d: 1 },
    { a: { text: 'İlk otomobil (Benz)', year: 1886 }, b: { text: 'İlk motorlu uçuş (Wright kardeşler)', year: 1903 }, fact: 'İlk araba ile ilk uçak arasında sadece 17 yıl var.', d: 1 },
    { a: { text: 'İlk elektronik bilgisayar (ENIAC)', year: 1945 }, b: { text: 'Ay\'a ilk ayak basış', year: 1969 }, fact: 'ENIAC 27 ton ağırlığındaydı.', d: 2 },
    { a: { text: 'Giza Piramitleri\'nin inşası', year: -2560 }, b: { text: 'Roma şehrinin kuruluşu', year: -753 }, fact: 'Piramitler, Roma\'nın kuruluşundan ~1.800 yıl daha eskidir.', d: 2 },
    { a: { text: 'Matbaanın icadı (Gutenberg)', year: 1440 }, b: { text: 'Telefonun icadı (Bell)', year: 1876 }, fact: 'Aralarında 436 yıl var!', d: 2 },
    { a: { text: 'Radyonun icadı', year: 1895 }, b: { text: 'Televizyonun icadı', year: 1927 }, fact: 'Radyo, televizyondan 32 yıl önce geldi.', d: 2 },
    { a: { text: 'Titanik\'in batışı', year: 1912 }, b: { text: 'Birinci Dünya Savaşı\'nın başlaması', year: 1914 }, fact: 'Titanik 1912\'de battı; 2 yıl sonra I. Dünya Savaşı başladı.', d: 3 },
    { a: { text: 'Berlin Duvarı\'nın yıkılışı', year: 1989 }, b: { text: 'World Wide Web\'in halka açılması', year: 1991 }, fact: 'Duvar 1989\'da yıkıldı; Web 1991\'de halka açıldı.', d: 3 },
    { a: { text: 'Amerikan Bağımsızlık Bildirgesi', year: 1776 }, b: { text: 'Fransız Devrimi', year: 1789 }, fact: 'Amerikan bağımsızlığı, Fransız Devrimi\'ne ilham kaynağı oldu.', d: 3 },
    { a: { text: 'Magna Carta\'nın imzalanması', year: 1215 }, b: { text: 'Osmanlı Devleti\'nin kuruluşu', year: 1299 }, fact: 'Magna Carta (1215), Osmanlı\'nın kuruluşundan 84 yıl öncedir.', d: 3 },
    { a: { text: 'Antik Olimpiyat Oyunları\'nın başlaması', year: -776 }, b: { text: 'Büyük İskender\'in doğumu', year: -356 }, fact: 'İlk Olimpiyatlar, Büyük İskender\'den 420 yıl öncedir.', d: 3 },
  ],

  // ---------- KATEGORİ: FUTBOL ----------
  // Türk futbolu sorulari (4 şıklı). Tartışmalı/eskiyebilen verilerden kaçınıldı.
  futbol: [
    // ---- Çok Kolay (d: 0) ----
    { question: 'Galatasaray\'ın renkleri hangisidir?', answer: 'Sarı-Kırmızı', wrong: ['Siyah-Beyaz', 'Sarı-Lacivert', 'Bordo-Mavi'], fact: 'Galatasaray\'ın renkleri 1908\'de "ateş ve kan" temasıyla kabul edildi.', d: 0 },
    { question: 'Fenerbahçe hangi renkleri giyer?', answer: 'Sarı-Lacivert', wrong: ['Sarı-Kırmızı', 'Siyah-Beyaz', 'Yeşil-Beyaz'], fact: 'Sarı geleceğe duyulan kıskançlığı, lacivert ise asaleti simgeler.', d: 0 },
    { question: 'Beşiktaş\'ın renkleri nedir?', answer: 'Siyah-Beyaz', wrong: ['Sarı-Kırmızı', 'Bordo-Mavi', 'Yeşil-Beyaz'], fact: '1909\'a kadar renkler kırmızı-beyazdı; Trablusgarp Savaşı sonrası yas tutmak için siyaha çevrildi.', d: 0 },
    { question: 'Beşiktaş\'ın sembolü hangi hayvandır?', answer: 'Kartal', wrong: ['Aslan', 'Kanarya', 'Boğa'], fact: 'Kartal, Beşiktaş\'ın simgesidir; taraftarlara da "Kartal" denir.', d: 0 },
    { question: 'Galatasaray\'ın sembolü hangi hayvandır?', answer: 'Aslan', wrong: ['Kartal', 'Kanarya', 'Boğa'], fact: 'Galatasaray\'ın simgesi aslandır; taraftarlara "Aslan" da denir.', d: 0 },
    { question: 'Fenerbahçe\'nin sembolü hangi kuştur?', answer: 'Kanarya', wrong: ['Kartal', 'Aslan', 'Boğa'], fact: 'Sarı-lacivert renkler kanaryayı çağrıştırdığı için Fenerbahçeli taraftarlara "Kanarya" da denir.', d: 0 },
    { question: 'Türkiye milli takım forması genelde hangi renktedir?', answer: 'Kırmızı-Beyaz', wrong: ['Sarı-Lacivert', 'Siyah-Beyaz', 'Mavi-Beyaz'], fact: 'Milli formanın baskın rengi, Türk bayrağındaki gibi kırmızı ve beyazdır.', d: 0 },
    { question: 'Futbol maçında bir takımda sahada kaç oyuncu olur?', answer: '11', wrong: ['9', '10', '12'], fact: 'Kaleci dahil 11 oyuncu sahada yer alır.', d: 0 },

    // ---- Kolay (d: 1) ----
    { question: 'Süper Lig\'in ilk (1959) şampiyonu hangi takımdır?', answer: 'Fenerbahçe', wrong: ['Galatasaray', 'Beşiktaş', 'Trabzonspor'], fact: '1959\'da Milli Lig adıyla başlayan organizasyonun ilk şampiyonu Fenerbahçe oldu.', d: 1 },
    { question: 'Galatasaray hangi yıl UEFA Kupası\'nı kazandı?', answer: '2000', wrong: ['1998', '2002', '2008'], fact: '17 Mayıs 2000\'de Kopenhag\'da Arsenal\'i penaltılarla yenerek kazandı; bir Türk takımının ilk Avrupa kupasıdır.', d: 1 },
    { question: 'Aşağıdakilerden hangisi "Üç Büyükler"den değildir?', answer: 'Başakşehir', wrong: ['Galatasaray', 'Fenerbahçe', 'Beşiktaş'], fact: '"Üç büyükler" terimi Galatasaray, Fenerbahçe ve Beşiktaş için kullanılır. Başakşehir 1990\'da kuruldu.', d: 1 },
    { question: '1903 yılında kurulan, Türkiye\'nin en eski spor kulüplerinden biri olan takım hangisidir?', answer: 'Beşiktaş', wrong: ['Galatasaray', 'Fenerbahçe', 'Trabzonspor'], fact: 'Beşiktaş 19 Mart 1903\'te kuruldu; Galatasaray 1905, Fenerbahçe 1907\'dedir.', d: 1 },

    // ---- Doğru/Yanlış havasında olanlar Kolay'a ----
    { question: 'Süper Lig\'de bugüne kadar sadece İstanbul takımları şampiyon olmuştur. Doğru mu, yanlış mı?', answer: 'Yanlış', wrong: ['Doğru', 'Kısmen', 'Bilinmiyor'], fact: 'Trabzonspor, Bursaspor ve Başakşehir gibi İstanbul dışı takımlar da şampiyon olmuştur.', d: 1 },

    // ---- Orta (d: 2) ----
    { question: 'Türkiye 2002 FIFA Dünya Kupası\'nda kaçıncı olmuştur?', answer: 'Üçüncü', wrong: ['Birinci', 'İkinci', 'Dördüncü'], fact: 'Türkiye, 2002 Güney Kore-Japonya organizasyonunda tarihindeki en iyi sonucu alarak 3. oldu.', d: 2 },
    { question: '2002 Dünya Kupası\'nda Türkiye\'nin teknik direktörü kimdi?', answer: 'Şenol Güneş', wrong: ['Fatih Terim', 'Mustafa Denizli', 'Ersun Yanal'], fact: 'Şenol Güneş yönetimindeki Türkiye, üçüncülük maçında Güney Kore\'yi 3-2 yendi.', d: 2 },
    { question: '2002 Dünya Kupası üçüncülük maçında Türkiye\'nin rakibi hangi takımdı?', answer: 'Güney Kore', wrong: ['Japonya', 'ABD', 'Senegal'], fact: 'Türkiye, ev sahibi Güney Kore\'yi 3-2 yenerek bronz madalya kazandı.', d: 2 },
    { question: 'Euro 2008\'de Türkiye yarı finalde hangi takıma elendi?', answer: 'Almanya', wrong: ['Fransa', 'Hollanda', 'İspanya'], fact: 'Yarı finalde Almanya\'ya 3-2 yenilen Türkiye, turnuvada büyük takdir topladı.', d: 2 },
    { question: 'Bursaspor hangi sezonun sonunda Süper Lig\'i ilk kez şampiyon bitirdi?', answer: '2009-10', wrong: ['2007-08', '2011-12', '2015-16'], fact: 'Bursaspor 2009-10\'da, İstanbul dışındaki ikinci şampiyonluğu (Trabzon\'dan sonra) getirdi.', d: 2 },

    // ---- Zor (d: 3) ----
    { question: 'Süper Lig tarihinde namağlup şampiyon olan tek takım hangisidir?', answer: 'Beşiktaş', wrong: ['Galatasaray', 'Fenerbahçe', 'Trabzonspor'], fact: 'Beşiktaş 1991-92 sezonunda 30 maçta hiç yenilmeden şampiyon olarak bu rekoru elinde tutuyor.', d: 3 },
    { question: 'Süper Lig şampiyonluğu yaşamış 6. takım hangisidir?', answer: 'İstanbul Başakşehir', wrong: ['Konyaspor', 'Sivasspor', 'Antalyaspor'], fact: 'Başakşehir 2019-20\'de ilk Süper Lig şampiyonluğunu kazanarak 6. farklı şampiyon oldu.', d: 3 },
    { question: '2017-18 UEFA Şampiyonlar Ligi grup aşamasında namağlup geçerek grup birinciliği elde eden Türk takımı hangisidir?', answer: 'Beşiktaş', wrong: ['Galatasaray', 'Fenerbahçe', 'Trabzonspor'], fact: 'Beşiktaş, Porto-Leipzig-Monaco grubunda 4G 2B ile namağlup birinci tamamlayıp son 16\'ya çıktı.', d: 3 },
    { question: 'Beşiktaş\'ın 1989-90, 1990-91 ve 1991-92 sezonlarında üst üste 3 şampiyonluk kazandığı dönemin teknik direktörü kimdir?', answer: 'Gordon Milne', wrong: ['Christoph Daum', 'Mircea Lucescu', 'Şenol Güneş'], fact: 'İngiliz teknik adam Gordon Milne, Beşiktaş\'ın "Kara Kartallar" lakaplı kadrosuyla bu rekoru imzaladı.', d: 3 },
  ],

  // ---------- KATEGORİ: YAZ BAKALIM (DÜELLO) ----------
  duello: [
    {
      prompt: 'Haftanın günlerini yazın.',
      answers: [
        { name: 'Pazartesi', aliases: [] }, { name: 'Salı', aliases: [] }, { name: 'Çarşamba', aliases: [] },
        { name: 'Perşembe', aliases: [] }, { name: 'Cuma', aliases: [] }, { name: 'Cumartesi', aliases: [] }, { name: 'Pazar', aliases: [] },
      ],
      note: 'Bir haftada 7 gün vardır.', d: 0,
    },
    {
      prompt: 'Dört mevsimi yazın.',
      answers: [
        { name: 'İlkbahar', aliases: ['bahar'] }, { name: 'Yaz', aliases: [] }, { name: 'Sonbahar', aliases: ['guz', 'güz'] }, { name: 'Kış', aliases: [] },
      ],
      note: 'Mevsimler, Dünya\'nın Güneş etrafındaki yolculuğu ve eksen eğikliği yüzünden oluşur.', d: 0,
    },
    {
      prompt: 'Ana renkleri ve bilinen renkleri yazın.',
      answers: [
        { name: 'Kırmızı', aliases: [] }, { name: 'Mavi', aliases: [] }, { name: 'Sarı', aliases: [] }, { name: 'Yeşil', aliases: [] },
        { name: 'Turuncu', aliases: [] }, { name: 'Mor', aliases: [] }, { name: 'Siyah', aliases: [] }, { name: 'Beyaz', aliases: [] }, { name: 'Pembe', aliases: [] }, { name: 'Kahverengi', aliases: [] },
      ],
      note: 'Ana renkler kırmızı, sarı ve mavidir; diğerleri bunların karışımından elde edilir.', d: 0,
    },
    {
      prompt: 'Güneş Sistemi\'ndeki gezegenleri yazın.',
      answers: [
        { name: 'Merkür', aliases: [] }, { name: 'Venüs', aliases: [] }, { name: 'Dünya', aliases: [] }, { name: 'Mars', aliases: [] },
        { name: 'Jüpiter', aliases: [] }, { name: 'Satürn', aliases: [] }, { name: 'Uranüs', aliases: [] }, { name: 'Neptün', aliases: [] },
      ],
      note: 'Plüton 2006\'da "cüce gezegen" sınıfına alındığı için artık sayılmıyor.', d: 1,
    },
    {
      prompt: 'Dünyadaki kıtaları yazın.',
      answers: [
        { name: 'Asya', aliases: [] }, { name: 'Afrika', aliases: [] }, { name: 'Avrupa', aliases: [] }, { name: 'Kuzey Amerika', aliases: [] },
        { name: 'Güney Amerika', aliases: [] }, { name: 'Antarktika', aliases: ['antartika'] }, { name: 'Avustralya (Okyanusya)', aliases: ['avustralya', 'avusturalya', 'okyanusya'] },
      ],
      note: 'Asya, hem yüzölçümü hem nüfus olarak en büyük kıtadır.', d: 1,
    },
    {
      prompt: 'A ile başlayan Avrupa ülkelerini yazın.',
      answers: [
        { name: 'Almanya', aliases: ['germany'] }, { name: 'Andorra', aliases: [] }, { name: 'Arnavutluk', aliases: ['albania'] },
        { name: 'Avusturya', aliases: ['austria'] }, { name: 'Azerbaycan', aliases: ['azerbaijan'] },
      ],
      note: 'Azerbaycan\'ın topraklarının bir kısmı Avrupa\'da sayıldığı için kabul ediliyor.', d: 2,
    },
    {
      prompt: 'Türkiye\'ye kara sınırı olan komşu ülkeleri yazın.',
      answers: [
        { name: 'Yunanistan', aliases: [] }, { name: 'Bulgaristan', aliases: [] }, { name: 'Gürcistan', aliases: [] }, { name: 'Ermenistan', aliases: [] },
        { name: 'Azerbaycan', aliases: ['nahcivan', 'nahçıvan'] }, { name: 'İran', aliases: [] }, { name: 'Irak', aliases: [] }, { name: 'Suriye', aliases: [] },
      ],
      note: 'Azerbaycan ile sınırımız, Nahçıvan özerk bölgesi üzerindendir (sadece ~17 km!).', d: 2,
    },
    {
      prompt: 'Güney Amerika ülkelerini yazın.',
      answers: [
        { name: 'Brezilya', aliases: ['brazil'] }, { name: 'Arjantin', aliases: [] }, { name: 'Şili', aliases: ['chile'] }, { name: 'Peru', aliases: [] },
        { name: 'Kolombiya', aliases: ['colombia'] }, { name: 'Venezuela', aliases: ['venezuella'] }, { name: 'Ekvador', aliases: ['ekvator', 'ecuador'] },
        { name: 'Bolivya', aliases: [] }, { name: 'Paraguay', aliases: [] }, { name: 'Uruguay', aliases: [] }, { name: 'Guyana', aliases: [] }, { name: 'Surinam', aliases: ['suriname'] },
      ],
      note: 'Brezilya tek başına kıtanın neredeyse yarısını kaplar.', d: 3,
    },
    {
      prompt: 'İstanbul\'un "üç büyük" takımlarını yazın.',
      answers: [
        { name: 'Galatasaray', aliases: ['gs'] },
        { name: 'Fenerbahçe', aliases: ['fb', 'fenerbahce'] },
        { name: 'Beşiktaş', aliases: ['bjk', 'besiktas'] },
      ],
      note: '"Üç büyükler" Galatasaray, Fenerbahçe ve Beşiktaş\'tır.', d: 1,
    },
    {
      prompt: 'Süper Lig tarihinde şampiyon olmuş takımları yazın.',
      answers: [
        { name: 'Galatasaray', aliases: ['gs'] },
        { name: 'Fenerbahçe', aliases: ['fb', 'fenerbahce'] },
        { name: 'Beşiktaş', aliases: ['bjk', 'besiktas'] },
        { name: 'Trabzonspor', aliases: ['ts', 'trabzon'] },
        { name: 'Bursaspor', aliases: ['bursa'] },
        { name: 'İstanbul Başakşehir', aliases: ['basaksehir', 'başakşehir', 'medipol basaksehir'] },
      ],
      note: 'Bu 6 takım Süper Lig\'de şampiyonluk yaşamış tek takımlardır (2024 itibarıyla).', d: 3,
    },
    {
      prompt: 'Marmara Bölgesi\'ndeki illeri yazın.',
      answers: [
        { name: 'İstanbul', aliases: [] }, { name: 'Bursa', aliases: [] }, { name: 'Kocaeli', aliases: ['izmit'] }, { name: 'Sakarya', aliases: ['adapazari', 'adapazarı'] },
        { name: 'Balıkesir', aliases: [] }, { name: 'Çanakkale', aliases: [] }, { name: 'Edirne', aliases: [] }, { name: 'Kırklareli', aliases: [] },
        { name: 'Tekirdağ', aliases: [] }, { name: 'Yalova', aliases: [] }, { name: 'Bilecik', aliases: [] },
      ],
      note: 'Marmara, Türkiye\'nin en kalabalık ve en sanayileşmiş bölgesidir.', d: 3,
    },
  ],
};

const CATEGORIES = {
  bayrak:      { name: 'Bayraklar',          icon: '🚩', desc: 'Bu bayrak hangi ülkenin?' },
  unlu:        { name: 'Ünlü Kişiler',       icon: '🎭', desc: 'Bu ünlü kişi kim?' },
  dogruYanlis: { name: 'Doğru / Yanlış',     icon: '⚖️', desc: 'Bu bilgi doğru mu?' },
  baskent:     { name: 'Başkentler',         icon: '🏛️', desc: 'Bu ülkenin başkenti neresi?' },
  kita:        { name: 'Hangi Kıtada?',      icon: '🗺️', desc: 'Bu ülke hangi kıtada?' },
  bolge:       { name: 'Hangi Bölgede?',     icon: '📍', desc: 'Bu il hangi bölgede?' },
  eski:        { name: 'Hangisi Daha Eski?', icon: '⏳', desc: 'Hangisi daha önce oldu?' },
  futbol:      { name: 'Futbol',             icon: '⚽', desc: 'Türk futbolu sorusu' },
  duello:      { name: 'Yaz Bakalım',        icon: '⚔️', desc: 'Sırayla yazın, yazamayan kaybeder!' },
};

// Zorluk seviyeleri
const DIFFICULTIES = {
  0: { name: 'Çok Kolay', sub: 'Çocuk', icon: '🐣' },
  1: { name: 'Kolay',     sub: '',      icon: '🟢' },
  2: { name: 'Orta',      sub: '',      icon: '🟡' },
  3: { name: 'Zor',       sub: '',      icon: '🔴' },
};
