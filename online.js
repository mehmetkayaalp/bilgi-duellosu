// ============================================================
// BİLGİ DÜELLOSU — "Online" denetleyici (EŞZAMANLI model)
// İki oyuncu AYNI soruyu AYNI anda görür ve cevaplar. Süre/iki
// cevap dolunca açılış: doğru cevap + kim ne işaretledi + puanlar.
// Doğru bilen taban puan + hız bonusu alır (ikisi de alabilir).
// Tek doğruluk kaynağı DB'dir; geçişleri "host" (oda kurucusu) yürütür.
// ============================================================

const ANSWER_LIMIT = 15;  // saniye: her soru için cevaplama süresi
const REVEAL_HOLD = 6;    // saniye: "doğru cevap + kim ne dedi" ekranı süresi
const SPEED_MAX = 8;      // doğru + hızlı cevaba verilen en fazla bonus
const GRACE_MS = 15000;   // pes etme / bağlantı kopması bekleme süresi

const online = {
  code: null,
  pid: null,
  totalCards: 15,
  difficulty: 1,        // Arkadaşınla Oyna (oda kodu) modunda tek zorluk
  difficulties: [1],    // Hızlı Eşleşme modunda kabul edilen zorluklar (çoklu)
  m: null,              // son normalize edilmiş oda durumu (ayna)
  view: null,           // o anki sorunun görünümü (gövde/şıklar/doğru)
  viewKey: '',          // gereksiz yeniden çizimi önlemek için
  matchmaking: false,
  claiming: false,
  endedShown: false,
  queueUnsub: null,
  hostTimer: null,      // host'un faz geçiş zamanlayıcısı
  timerKey: '',         // aynı faz için tek zamanlayıcı
  revealIv: null,       // açılış geri sayım arayüzü
  graceIv: null,        // pes/koparma geri sayım arayüzü
  graceTimeout: null,   // 15 sn sonra forfeit yazımı
  graceKey: '',         // aynı leaving olayı için tek zamanlayıcı
  quitting: false,      // pes ettiğimizi belirten lokal bayrak
};

function getPid() {
  let p = sessionStorage.getItem('bd-pid');
  // Çakışmaya neredeyse imkân tanımayan, daha uzun + zaman damgalı pid.
  // Eski (8 karakter civarı) pid'leri görürse yeniler.
  if (!p || p.length < 14) {
    p = 'p' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
    sessionStorage.setItem('bd-pid', p);
  }
  return p;
}

function clone(x) { return x ? JSON.parse(JSON.stringify(x)) : x; }

function normalizeRoom(r) {
  return {
    status: r.status,
    phase: r.phase || 'answer',
    totalCards: r.totalCards || 15,
    difficulty: typeof r.difficulty === 'number' ? r.difficulty : 1,
    difficulties: r.difficulties || null,
    names: [r.names?.p0 || 'Oyuncu 1', r.names?.p1 || 'Bekleniyor…'],
    ids: [r.ids?.p0 || null, r.ids?.p1 || null],
    scores: r.scores || [0, 0],
    stats: r.stats ? [r.stats[0] || {}, r.stats[1] || {}] : [{}, {}],
    deck: (r.deck || []).map((c) => ({ cat: c.cat, qIndex: c.qIndex, bonus: !!c.bonus })),
    qi: typeof r.qi === 'number' ? r.qi : 0,
    qStart: r.qStart || 0,
    answers: r.answers || {},     // {0:{choice,correct,ms}, 1:{...}}
    gained: r.gained || [0, 0],
    revealStart: r.revealStart || 0,
    used: r.used || [],          // önceki oyunlarda kullanılmış soru anahtarları
    rematch: r.rematch || {},    // {0:true,1:true} → rövanş istekleri
    leaving: r.leaving || null,  // {pid,idx,ts,kind:'quit'|'dc'} — ayrılan oyuncu
    forfeit: r.forfeit || null,  // bitişte kim pes etti: {pid,idx,kind}
    host: r.host,
  };
}

function myIndex() {
  if (!online.m) return -1;
  return online.m.ids[0] === online.pid ? 0 : online.m.ids[1] === online.pid ? 1 : -1;
}
function isHost() { return online.m && online.m.host === online.pid; }

function recordStatO(stats, cat, ok) {
  const s = (stats[cat] ||= { c: 0, t: 0 });
  s.t++;
  if (ok) s.c++;
}

function netErr(e) {
  console.error(e);
  alert('Bağlantı hatası: ' + (e?.message || e));
}

function clearOnlineTimers() {
  if (online.hostTimer) { clearTimeout(online.hostTimer); online.hostTimer = null; }
  if (online.revealIv) { clearInterval(online.revealIv); online.revealIv = null; }
  clearGraceTimers();
  online.timerKey = '';
}

function clearGraceTimers() {
  if (online.graceIv) { clearInterval(online.graceIv); online.graceIv = null; }
  if (online.graceTimeout) { clearTimeout(online.graceTimeout); online.graceTimeout = null; }
  online.graceKey = '';
}

// Oyun sırasında bağlantı kopması durumunda otomatik 'leaving' işaretini koyar.
// Her sefer çağrıldığında yeniden kurar (bir kez tetiklendikten sonra sunucu
// tarafında silindiği için).
function setupLeavingOnDisconnect(idx) {
  if (!Net.fns || !online.code || idx < 0) return;
  try {
    const { ref, onDisconnect } = Net.fns;
    onDisconnect(ref(Net.db, `${Net.roomPath(online.code)}/leaving`))
      .set({ pid: online.pid, idx, ts: Date.now(), kind: 'dc' });
  } catch (e) { console.warn('onDisconnect leaving kaydı başarısız:', e); }
}

// Oyun sırasında "Çık" butonuna basıldığında.
async function quitOnline() {
  const m = online.m;
  const code = online.code;
  // Lobi veya bitmiş ekranda → klasik ayrılma (oda kapanır / status:ended).
  if (!code || !m || m.status !== 'playing') {
    if (!confirm('Ana menüye dönmek istediğine emin misin?')) return;
    leaveOnline();
    return;
  }
  if (online.quitting) return;
  if (!confirm('Pes etmek istediğine emin misin? Rakibin 15 sn içinde galip ilan edilecek.')) return;
  online.quitting = true;
  const idx = myIndex();
  try {
    if (idx >= 0) {
      await Net.updateRoom(code, {
        leaving: { pid: online.pid, idx, ts: Date.now(), kind: 'quit' },
      });
    }
  } catch (e) { console.warn('Pes etme yazımı başarısız:', e); }
  // Odayı silmeden ayrıl — kalan oyuncu süreyi bitirip forfeit yazacak.
  Net.stop();
  clearOnlineTimers();
  resetOnlineState();
  online.quitting = false;
  showScreen('screen-home');
}

// onRoomSnapshot her tetiklendiğinde, oda 'playing' iken çağrılır.
// `leaving` alanına göre grace overlay'ini kurar/yıkar.
function handleLeavingState() {
  const m = online.m;
  const leaving = m && m.leaving;
  if (!leaving) {
    clearGraceTimers();
    hideGraceOverlay();
    return;
  }
  // Bayrak bizimse → tekrar bağlandık, sil ve onDisconnect'i yeniden kur.
  if (leaving.pid === online.pid) {
    Net.updateRoom(online.code, { leaving: null }).catch(() => {});
    setupLeavingOnDisconnect(myIndex());
    return;
  }
  // Rakip ayrılmış → 15 sn geri sayım.
  // Faz geçişlerini de durdur: askıdaki hostTimer / reveal interval bu sırada
  // ateşlemesin, yoksa oda durumu grace altında ilerler.
  if (online.hostTimer) { clearTimeout(online.hostTimer); online.hostTimer = null; }
  if (online.revealIv) { clearInterval(online.revealIv); online.revealIv = null; }
  online.timerKey = '';
  const key = `leaving-${leaving.ts}`;
  if (online.graceKey === key) return; // zaten kurulu
  clearGraceTimers();
  online.graceKey = key;
  const oppName = m.names[leaving.idx] || 'Rakibin';
  const title = leaving.kind === 'quit' ? `${oppName} pes etti` : `${oppName} ayrıldı`;
  const msg = leaving.kind === 'quit'
    ? 'Süre dolarsa galibiyet senin.'
    : 'Bağlantı kopmuş olabilir, geri dönmesi bekleniyor…';
  const startedAt = leaving.ts;
  const tick = () => {
    if (!online.m || !online.m.leaving) {
      clearGraceTimers();
      hideGraceOverlay();
      return;
    }
    const remain = Math.ceil((GRACE_MS - (Date.now() - startedAt)) / 1000);
    updateGraceCount(remain);
    if (remain <= 0) {
      clearGraceTimers();
      Net.updateRoom(online.code, {
        status: 'ended',
        forfeit: { pid: leaving.pid, idx: leaving.idx, kind: leaving.kind },
        leaving: null,
      }).catch(() => {});
    }
  };
  const initialRemain = Math.ceil((GRACE_MS - (Date.now() - startedAt)) / 1000);
  showGraceOverlay({
    title,
    msg,
    sub: 'Süre dolarsa galibiyet senin!',
    seconds: Math.max(0, initialRemain),
  });
  online.graceIv = setInterval(tick, 250);
}

// ---------- window.GAME (online) — motorun ortak fonksiyonları için ----------
function buildOnlineGAME() {
  window.GAME = {
    isOnline: true,
    get players() { return online.m.names; },
    get scores() { return online.m.scores; },
    get stats() { return online.m.stats; },
    get totalCards() { return online.m.totalCards; },
    get difficulty() { return online.m.difficulty; },
    get played() { return online.m.qi; },
    get myIndex() { return myIndex(); },
    turn: -1,
    jokers: null,
    // Eşzamanlı modelde kullanılmayan ama motorun çağırabileceği kancalara
    // güvenli karşılıklar (hata vermesin diye):
    bonusMult: () => 1,
    canPick: () => false,
    canDuelAct: () => false,
    ownsAdvance: () => false,
    next() {},
    quit() { quitOnline(); },
    forfeit() {
      const ff = online.m && online.m.forfeit;
      if (!ff) return null;
      return { loserIdx: ff.idx, mineLost: ff.pid === online.pid, kind: ff.kind };
    },
  };
}

// ---------- Deste (düello hariç; düello eşzamanlı modele uymuyor) ----------
// exclude: önceki oyunların soru anahtarları ("cat:idx") — tekrar gelmesinler.
function buildOnlineDeck(n, diff, exclude) {
  exclude = exclude || new Set();
  const cats = shuffle(Object.keys(CATEGORIES).filter((c) => c !== 'duello'));
  const list = [];
  for (let i = 0; i < n; i++) list.push(cats[i % cats.length]);
  const catList = shuffle(list);
  const pools = {};
  const deck = catList.map((cat) => {
    if (!pools[cat] || pools[cat].length === 0) {
      let p = shuffle(poolFor(cat, diff)).filter((idx) => !exclude.has(`${cat}:${idx}`));
      if (p.length === 0) p = shuffle(poolFor(cat, diff)); // havuz tükendi → tekrara izin ver
      pools[cat] = p;
    }
    return { cat, qIndex: pools[cat].pop(), bonus: false };
  });
  const bonusCount = n >= 16 ? 2 : 1;
  shuffle(deck.map((_, i) => i)).slice(0, bonusCount).forEach((i) => { deck[i].bonus = true; });
  return deck;
}

function deckKeys(deck) { return deck.map((c) => `${c.cat}:${c.qIndex}`); }

// Bir kartın görünümü: gövde HTML'i, şık metinleri ve doğru cevap metni.
function simulView(card) {
  const q = DATA[card.cat][card.qIndex];
  const cat = card.cat;
  let body, options, correct;
  if (cat === 'bayrak') {
    body = `<div class="q-flag">${q.flag}</div><p class="q-text" style="text-align:center">Bu bayrak hangi ülkenin?</p>`;
    options = shuffle([q.answer, ...q.wrong]); correct = q.answer;
  } else if (cat === 'dogruYanlis') {
    body = `<p class="q-text">${q.statement}</p>`;
    options = ['✅ Doğru', '❌ Yanlış']; correct = q.answer ? '✅ Doğru' : '❌ Yanlış';
  } else if (cat === 'eski') {
    body = `<p class="q-text">⏳ Hangisi daha önce oldu?</p>`;
    options = shuffle([q.a.text, q.b.text]);
    correct = (q.a.year <= q.b.year ? q.a : q.b).text;
  } else {
    body = `<p class="q-text">${q.question}</p>`;
    options = shuffle([q.answer, ...q.wrong]); correct = q.answer;
  }
  return { q, cat, body, options, correct };
}

function withYear(card, text) {
  const q = DATA[card.cat][card.qIndex];
  if (card.cat !== 'eski') return text;
  if (q.a.text === text) return `${text} — ${formatYear(q.a.year)}`;
  if (q.b.text === text) return `${text} — ${formatYear(q.b.year)}`;
  return text;
}

// ---------- Anlık güncelleme (snapshot) ----------
function onRoomSnapshot(raw) {
  if (!raw) {
    if (online.code) {
      Net.stop();
      online.code = null;
      clearOnlineTimers();
      if (!online.endedShown) {
        alert('Oda kapandı (rakip ayrılmış olabilir).');
        showScreen('screen-home');
      }
    }
    return;
  }

  online.m = normalizeRoom(raw);

  if (online.m.status === 'waiting') {
    if (online.matchmaking) renderMatchWaiting();
    else renderLobbyRoom();
    return;
  }

  if (online.m.status === 'ended') {
    if (!online.endedShown) {
      online.endedShown = true;
      clearOnlineTimers();
      showEndScreen(saveStats({ players: online.m.names, scores: online.m.scores, stats: online.m.stats }));
      // Oda KAPATILMIYOR: rövanş için açık kalır. Ayrılınca (leaveOnline)
      // ya da host bağlantısı kopunca (onDisconnect) temizlenir.
    }
    handleRematchState();
    return;
  }

  // status: playing — eşleşme kuyruğu aboneliğini kapat, bitiş bayrağını sıfırla
  online.endedShown = false;
  online._rematching = false;
  if (online.queueUnsub) { try { online.queueUnsub(); } catch {} online.queueUnsub = null; }
  if (!$('screen-game').classList.contains('active')) {
    setPlayersUI();
    showScreen('screen-game');
  }
  // Oyuna ilk girişte:
  //   - Bekleme aşamasında oda kapatan onDisconnect'leri iptal et (kapatma yerine
  //     15 sn grace istiyoruz).
  //   - Bağlantı kopması durumunda 'leaving' işareti koyacak yeni onDisconnect kur.
  if (!online._dcRegistered && myIndex() >= 0) {
    try {
      const { ref, onDisconnect } = Net.fns;
      onDisconnect(ref(Net.db, Net.roomPath(online.code))).cancel();
      onDisconnect(ref(Net.db, `matchmaking/${online.code}`)).cancel();
    } catch { /* önemsiz */ }
    setupLeavingOnDisconnect(myIndex());
    online._dcRegistered = true;
  }
  updateScoreboard();
  renderOnlineStrip();
  handleLeavingState();

  // Grace devam ediyorken host faz geçişlerini erteler.
  if (online.m.leaving && online.m.leaving.pid !== online.pid) {
    return;
  }

  if (online.m.phase === 'answer') {
    renderSimulQuestion();
    hostMaybeReveal();
  } else if (online.m.phase === 'reveal') {
    renderSimulReveal();
    hostMaybeAdvance();
  }
}

// ---------- Soru ekranı (cevaplama fazı) ----------
function renderSimulQuestion() {
  const m = online.m;
  const card = m.deck[m.qi];
  const mine = myIndex();
  const myAns = m.answers[mine];
  const key = `a${m.qi}-${myAns ? 1 : 0}`;

  if (online.viewKey !== `view${m.qi}`) { online.view = simulView(card); online.viewKey = `view${m.qi}`; }
  const v = online.view;

  // Tam yeniden çizimi yalnızca soru ya da kendi cevap durumum değişince yap
  if (online._drawnKey !== key) {
    online._drawnKey = key;
    $('overlay').classList.remove('hidden');
    $('fact-panel').classList.add('hidden');
    $('duel-box').classList.add('hidden');
    $('q-spectate').classList.add('hidden');
    $('joker-row').innerHTML = '';
    $('q-category').textContent = `${CATEGORIES[card.cat].icon} ${CATEGORIES[card.cat].name}`;
    $('bonus-banner').classList.toggle('hidden', !card.bonus);
    $('q-player').textContent = '⚡ İkiniz de aynı anda cevaplıyorsunuz!';
    $('q-player').className = 'q-player';
    $('q-body').innerHTML = v.body;

    const box = $('q-options');
    box.className = card.cat === 'eski' ? 'stacked' : '';
    box.innerHTML = '';
    v.options.forEach((opt) => {
      const btn = document.createElement('button');
      btn.className = 'opt-btn' + (card.cat === 'dogruYanlis' ? ' tf' : '') + (card.cat === 'eski' ? ' event' : '');
      btn.textContent = opt;
      if (myAns) {
        btn.disabled = true;
        if (opt === myAns.choice) btn.classList.add('mine-pick');
      } else {
        btn.addEventListener('click', () => submitSimul(opt, opt === v.correct));
      }
      box.appendChild(btn);
    });
    $('board-msg').innerHTML = myAns
      ? 'Cevabın kaydedildi — rakip bekleniyor… ⏳'
      : 'Hızlı ol! ⚡ Doğru + hızlı = bonus puan';
  }

  startSimulTimer();
}

function submitSimul(choice, correct) {
  const mine = myIndex();
  if (mine < 0 || online.m.answers[mine]) return;
  sfx.tap();
  const ms = Math.max(0, Date.now() - (online.m.qStart || Date.now()));
  Net.updateRoom(online.code, { [`answers/${mine}`]: { choice, correct, ms } }).catch(netErr);
}

function startSimulTimer() {
  stopTimer();
  $('timer-row').classList.remove('hidden');
  const total = ANSWER_LIMIT;
  const tick = () => {
    if (!online.m || online.m.phase !== 'answer') { stopTimer(); return; }
    const remain = Math.max(0, total - (Date.now() - online.m.qStart) / 1000);
    renderTimer(remain, total);
    if (remain <= 0) stopTimer();
  };
  tick();
  timer.id = setInterval(tick, 100);
}

// Host: iki cevap geldi mi ya da süre doldu mu → açılışı yaz
function hostMaybeReveal() {
  const m = online.m;
  if (!isHost() || m.phase !== 'answer') return;
  const both = m.answers[0] && m.answers[1];
  if (both) { doReveal(); return; }
  const key = `ans-${m.qi}`;
  if (online.timerKey === key) return;
  online.timerKey = key;
  if (online.hostTimer) clearTimeout(online.hostTimer);
  const remain = Math.max(0, ANSWER_LIMIT * 1000 - (Date.now() - m.qStart));
  online.hostTimer = setTimeout(doReveal, remain + 250);
}

function doReveal() {
  const m = online.m;
  if (!isHost() || m.phase !== 'answer') return;
  if (online.hostTimer) { clearTimeout(online.hostTimer); online.hostTimer = null; }
  online.timerKey = '';
  const card = m.deck[m.qi];
  const mult = card.bonus ? 2 : 1;
  const scores = [...m.scores];
  const gained = [0, 0];
  const stats = clone(m.stats);
  [0, 1].forEach((i) => {
    const a = m.answers[i];
    const ok = !!(a && a.correct);
    recordStatO(stats[i], card.cat, ok);
    if (ok) {
      const ms = a.ms || ANSWER_LIMIT * 1000;
      const speed = Math.round(SPEED_MAX * Math.max(0, 1 - ms / (ANSWER_LIMIT * 1000)));
      gained[i] = (POINTS.normal + speed) * mult;
      scores[i] += gained[i];
    }
  });
  Net.updateRoom(online.code, { phase: 'reveal', scores, gained, stats, revealStart: Date.now() }).catch(netErr);
}

// ---------- Açılış ekranı (kim ne dedi + puanlar) ----------
function renderSimulReveal() {
  const m = online.m;
  const card = m.deck[m.qi];
  if (online.viewKey !== `view${m.qi}`) { online.view = simulView(card); online.viewKey = `view${m.qi}`; }
  const v = online.view;
  online._drawnKey = '';  // sonraki soruda taze çizim

  stopTimer();
  $('timer-row').classList.add('hidden');
  $('overlay').classList.remove('hidden');
  $('q-category').textContent = `${CATEGORIES[card.cat].icon} ${CATEGORIES[card.cat].name}`;
  $('q-player').textContent = '';
  $('q-body').innerHTML = v.body;

  const a0 = m.answers[0], a1 = m.answers[1];
  const box = $('q-options');
  box.className = card.cat === 'eski' ? 'stacked' : '';
  box.innerHTML = '';
  v.options.forEach((opt) => {
    const btn = document.createElement('button');
    btn.className = 'opt-btn reveal' + (card.cat === 'dogruYanlis' ? ' tf' : '') + (card.cat === 'eski' ? ' event' : '');
    btn.disabled = true;
    if (opt === v.correct) btn.classList.add('correct');
    let chips = '';
    if (a0 && a0.choice === opt) chips += `<span class="pick-chip p1">${initials(m.names[0])}</span>`;
    if (a1 && a1.choice === opt) chips += `<span class="pick-chip p2">${initials(m.names[1])}</span>`;
    btn.innerHTML = `<span class="opt-label">${withYear(card, opt)}</span>${chips ? `<span class="pick-chips">${chips}</span>` : ''}`;
    box.appendChild(btn);
  });

  const tag = (i) => {
    const a = m.answers[i];
    const mark = a ? (a.correct ? '✓' : '✗') : '⏳';
    const pts = m.gained[i] > 0 ? ` +${m.gained[i]}` : '';
    return `<span class="rv-name p${i + 1}">${m.names[i]}</span> ${mark}${pts}`;
  };
  $('fact-result').innerHTML = `${tag(0)} &nbsp;·&nbsp; ${tag(1)}`;
  $('fact-result').className = '';
  $('fact-text').textContent = v.q.fact || v.q.note || '';
  $('fact-panel').classList.remove('hidden');
  $('btn-next').classList.add('hidden');
  $('next-wait').classList.remove('hidden');
  $('board-msg').textContent = '';

  // Soru başına bir kez doğru/yanlış sesi (kendi cevabıma göre)
  if (online._soundKey !== `s${m.qi}`) {
    online._soundKey = `s${m.qi}`;
    const a = m.answers[myIndex()];
    sfx[(a && a.correct) ? 'correct' : 'wrong']();
  }

  startRevealCountdown();
}

function startRevealCountdown() {
  if (online.revealIv) clearInterval(online.revealIv);
  const upd = () => {
    if (!online.m || online.m.phase !== 'reveal') { clearInterval(online.revealIv); online.revealIv = null; return; }
    const elapsed = (Date.now() - (online.m.revealStart || Date.now())) / 1000;
    const remain = Math.max(0, Math.ceil(REVEAL_HOLD - elapsed));
    $('next-wait').textContent = `Sonraki soru: ${remain} ⏳`;
    if (remain <= 0) { clearInterval(online.revealIv); online.revealIv = null; }
  };
  upd();
  online.revealIv = setInterval(upd, 250);
}

// Host: açılış süresi dolunca sonraki soruya geç (ya da bitir)
function hostMaybeAdvance() {
  const m = online.m;
  if (!isHost() || m.phase !== 'reveal') return;
  const key = `rev-${m.qi}`;
  if (online.timerKey === key) return;
  online.timerKey = key;
  if (online.hostTimer) clearTimeout(online.hostTimer);
  const remain = Math.max(0, REVEAL_HOLD * 1000 - (Date.now() - m.revealStart));
  online.hostTimer = setTimeout(() => {
    const next = m.qi + 1;
    if (next >= m.totalCards) {
      Net.updateRoom(online.code, { status: 'ended' }).catch(netErr);
    } else {
      Net.updateRoom(online.code, {
        qi: next, phase: 'answer', answers: null, gained: [0, 0], revealStart: 0, qStart: Date.now(),
      }).catch(netErr);
    }
  }, remain + 100);
}

// ---------- İlerleme şeridi ----------
function renderOnlineStrip() {
  const m = online.m;
  const board = $('board');
  board.className = 'prog-strip';
  board.innerHTML = '';
  m.deck.forEach((card, i) => {
    const el = document.createElement('div');
    let cls = 'prog-tile';
    if (i < m.qi) cls += ' done';
    else if (i === m.qi) cls += ' active';
    el.className = cls;
    el.innerHTML = `<span class="pt-icon">${CATEGORIES[card.cat].icon}</span>` +
      (card.bonus ? '<span class="pt-bonus">⭐</span>' : '');
    board.appendChild(el);
  });
}

// ---------- Rövanş (aynı odada yeni oyun; önceki sorular elenir) ----------
function handleRematchState() {
  const r = online.m.rematch || {};
  const me = myIndex();
  if (me < 0) return;
  const btn = $('btn-rematch'), st = $('rematch-status');
  // Forfeit (pes etme / bağlantı kopması) ile bitmişse rövanş gösterme
  if (online.m.forfeit) {
    btn.classList.add('hidden');
    st.textContent = 'Rakibin ayrıldığı için rövanş yok.';
    return;
  }
  const iReq = !!r[me], oppReq = !!r[1 - me];
  btn.classList.remove('hidden');
  if (iReq) {
    btn.disabled = true;
    btn.innerHTML = '🔁 &nbsp;Rövanş istedin';
    st.textContent = oppReq ? 'Yeni oyun başlıyor… 🎮' : 'Rakip bekleniyor… ⏳';
  } else {
    btn.disabled = false;
    btn.innerHTML = oppReq ? '🔁 &nbsp;Rakip rövanş istiyor — kabul et!' : '🔁 &nbsp;Rövanş';
    st.textContent = oppReq ? 'Rakip rövanş istiyor 🔥' : '';
  }
  // Host hakem: ikisi de istediyse yeni oyunu kurar (tek sefer)
  if (isHost() && r[0] && r[1] && !online._rematching) {
    online._rematching = true;
    startRematch();
  }
}

function requestRematch() {
  const me = myIndex();
  if (me < 0 || (online.m.rematch && online.m.rematch[me])) return;
  sfx.tap();
  Net.updateRoom(online.code, { [`rematch/${me}`]: true }).catch(netErr);
}

function startRematch() {
  if (!isHost()) return;
  const prev = online.m.used || [];
  const deck = buildOnlineDeck(online.m.totalCards, online.m.difficulty, new Set(prev));
  const used = [...prev, ...deckKeys(deck)];
  Net.updateRoom(online.code, {
    status: 'playing', phase: 'answer', qi: 0, qStart: Date.now(),
    scores: [0, 0], gained: [0, 0], stats: [{}, {}], answers: null, revealStart: 0,
    deck, used, rematch: null,
  }).catch(netErr);
}

// ============================================================
//  LOBİ — Arkadaşınla Oyna (oda kodu)
// ============================================================
function genCode() { return String(Math.floor(100000 + Math.random() * 900000)); }

async function createRoom() {
  const name = $('online-name').value.trim();
  if (!name) { lobbyMsg('Önce ismini yaz.'); return; }
  if (!Net.isConfigured()) { lobbyMsg('⚠️ Firebase anahtarları girilmemiş.'); return; }

  lobbyMsg('Oda kuruluyor…');
  online.pid = getPid();
  try {
    await Net.init();
    let code = genCode();
    for (let t = 0; t < 5 && (await Net.getRoom(code)); t++) code = genCode();
    online.code = code;
    online.endedShown = false;
    await Net.createRoom(code, {
      host: online.pid, status: 'waiting',
      totalCards: online.totalCards, difficulty: online.difficulty,
      names: { p0: name }, ids: { p0: online.pid },
      qi: 0, phase: 'answer',
    });
    try {
      const { ref, onDisconnect } = Net.fns;
      onDisconnect(ref(Net.db, Net.roomPath(code))).remove();
    } catch { /* önemsiz */ }
    Net.subscribe(code, onRoomSnapshot);
    buildOnlineGAME();
  } catch (e) { netErr(e); }
}

async function joinRoom() {
  const name = $('online-name').value.trim();
  const code = $('join-code').value.trim();
  if (!name) { lobbyMsg('Önce ismini yaz.'); return; }
  if (!/^\d{6}$/.test(code)) { lobbyMsg('Oda kodu 6 haneli olmalı.'); return; }
  if (!Net.isConfigured()) { lobbyMsg('⚠️ Firebase anahtarları girilmemiş.'); return; }

  lobbyMsg('Odaya katılınıyor…');
  online.pid = getPid();
  try {
    await Net.init();
    const room = await Net.getRoom(code);
    if (!room) { lobbyMsg('Böyle bir oda yok. Kodu kontrol et.'); return; }
    if (room.status !== 'waiting') { lobbyMsg('Bu oyun çoktan başlamış.'); return; }
    if (room.ids?.p1 && room.ids.p1 !== online.pid) { lobbyMsg('Oda dolu.'); return; }
    online.code = code;
    online.endedShown = false;
    await Net.updateRoom(code, { 'names/p1': name, 'ids/p1': online.pid });
    Net.subscribe(code, onRoomSnapshot);
    buildOnlineGAME();
  } catch (e) { netErr(e); }
}

function startOnlineGame() {
  if (!isHost()) return;
  if (!online.m.ids[1]) { lobbyMsg('Rakip henüz katılmadı.'); return; }
  const deck = buildOnlineDeck(online.m.totalCards, online.m.difficulty);
  Net.updateRoom(online.code, {
    status: 'playing', phase: 'answer', qi: 0, qStart: Date.now(),
    scores: [0, 0], gained: [0, 0], stats: [{}, {}], answers: null, revealStart: 0,
    deck, used: deckKeys(deck), rematch: null,
  }).catch(netErr);
}

function leaveOnline() {
  const code = online.code;
  const wasHost = isHost();
  Net.stop();
  clearOnlineTimers();
  if (code && !online.endedShown) {
    if (wasHost) {
      try { const { ref, remove } = Net.fns; remove(ref(Net.db, Net.roomPath(code))); } catch { /* önemsiz */ }
    } else {
      Net.updateRoom(code, { status: 'ended' }).catch(() => {});
    }
  }
  resetOnlineState();
  showScreen('screen-home');
}

function resetOnlineState() {
  if (online.queueUnsub) { try { online.queueUnsub(); } catch {} online.queueUnsub = null; }
  clearOnlineTimers();
  hideGraceOverlay();
  online.code = null;
  online.m = null;
  online.view = null;
  online.viewKey = '';
  online._drawnKey = '';
  online._soundKey = '';
  online._dcRegistered = false;
  online.endedShown = false;
  online.matchmaking = false;
  online.claiming = false;
  online.quitting = false;
}

function enterOnline() {
  if (online.code) leaveOnline();
  resetOnlineState();
  syncDiffFrom('screen-online');
  $('online-room').classList.add('hidden');
  $('online-join-box').classList.remove('hidden');
  $('room-code').textContent = '------';
  $('lobby-msg').textContent = '';
  $('join-code').value = '';
  $('btn-online-start').classList.add('hidden');
  showScreen('screen-online');
}

function lobbyMsg(t) { $('lobby-msg').textContent = t || ''; }

function renderLobbyRoom() {
  $('online-join-box').classList.add('hidden');
  $('online-room').classList.remove('hidden');
  $('room-code').textContent = online.code;
  const host = isHost();

  $('room-players').innerHTML = online.m.names
    .map((n, i) => {
      const filled = online.m.ids[i];
      return `<div class="room-player p${i + 1} ${filled ? '' : 'empty'}">
        <div class="avatar a${i + 1}">${filled ? initials(n) : '…'}</div>
        <span>${filled ? n : 'Bekleniyor…'}</span>
        ${online.m.host === online.m.ids[i] ? '<small>👑 kurucu</small>' : ''}
      </div>`;
    })
    .join('<div class="room-vs">VS</div>');

  const dd = DIFFICULTIES[online.m.difficulty] || DIFFICULTIES[1];
  const info = `${dd.icon} ${dd.name}${dd.sub ? ` (${dd.sub})` : ''} · ${online.m.totalCards} soru`;
  const ready = !!online.m.ids[1];
  if (host) {
    $('btn-online-start').classList.remove('hidden');
    $('btn-online-start').disabled = !ready;
    $('btn-online-start').textContent = ready ? '▶ Oyunu Başlat' : 'Rakip bekleniyor…';
    $('room-wait').textContent = `${info} · Kodu rakibine ver`;
  } else {
    $('btn-online-start').classList.add('hidden');
    $('room-wait').textContent = ready ? `${info} · Kurucunun başlatması bekleniyor…` : 'Odaya bağlanıldı.';
  }
}

// ============================================================
//  HIZLI EŞLEŞME (rastgele rakip)
// ============================================================
function matchMsg(t) { $('match-msg').textContent = t || ''; }

function showMatchSearching(status, sub) {
  $('match-setup').classList.add('hidden');
  $('match-searching').classList.remove('hidden');
  $('match-status').textContent = status || 'Rakip aranıyor…';
  $('match-sub').textContent = sub || '';
}
function showMatchSetup() {
  $('match-searching').classList.add('hidden');
  $('match-setup').classList.remove('hidden');
}

function renderMatchWaiting() {
  if (!$('screen-match').classList.contains('active')) showScreen('screen-match');
  const joined = online.m && online.m.ids[1];
  showMatchSearching(
    joined ? 'Rakip bulundu! Başlatılıyor…' : 'Rakip aranıyor…',
    joined ? '' : 'İlk gelen rakiple eşleşeceksin.'
  );
}

async function tryClaim(code, name, myDiffs) {
  try {
    const res = await Net.claim(code, (room) => {
      if (!room) return;
      if (room.status !== 'waiting') return;
      if (room.ids && room.ids.p1) return;
      if (myDiffs && myDiffs.length) {
        const hostDiffs = room.difficulties || [typeof room.difficulty === 'number' ? room.difficulty : 1];
        const inter = myDiffs.filter((d) => hostDiffs.includes(d));
        if (inter.length === 0) return;
        room.difficulty = inter[Math.floor(Math.random() * inter.length)];
      }
      room.ids = room.ids || {};
      room.names = room.names || {};
      room.ids.p1 = online.pid;
      room.names.p1 = name;
      return room;
    });
    const v = res.committed && res.snapshot.val();
    return !!(v && v.ids && v.ids.p1 === online.pid);
  } catch (e) { return false; }
}

async function startClaimedGame(code) {
  online.code = code;
  online.matchmaking = true;
  online.endedShown = false;
  await Net.setPath(`matchmaking/${code}`, null).catch(() => {});
  const room = await Net.getRoom(code);
  const diff = typeof room?.difficulty === 'number' ? room.difficulty : 1;
  const deck = buildOnlineDeck(room?.totalCards || 15, diff);
  await Net.updateRoom(code, {
    status: 'playing', phase: 'answer', qi: 0, qStart: Date.now(),
    scores: [0, 0], gained: [0, 0], stats: [{}, {}], answers: null, revealStart: 0,
    deck, used: deckKeys(deck), rematch: null,
  });
  Net.subscribe(code, onRoomSnapshot);
  buildOnlineGAME();
}

function queueDiffs(entry) {
  if (entry.diffs && entry.diffs.length) return entry.diffs;
  if (typeof entry.diff === 'number') return [entry.diff];
  return [];
}
function diffsLabel(arr) {
  return arr.map((d) => `${DIFFICULTIES[d].icon} ${DIFFICULTIES[d].name}`).join(', ');
}

async function quickMatch() {
  const name = $('match-name').value.trim();
  if (!name) { matchMsg('Önce ismini yaz.'); return; }
  if (!online.difficulties.length) online.difficulties = [1];
  if (!Net.isConfigured()) { matchMsg('⚠️ Firebase anahtarları girilmemiş.'); return; }

  online.pid = getPid();
  online.matchmaking = true;
  online.endedShown = false;
  showMatchSearching('Rakip aranıyor…', `Tercihin: ${diffsLabel(online.difficulties)}`);

  try {
    await Net.init();
    const queue = (await Net.getPath('matchmaking')) || {};
    const myDiffs = [...online.difficulties];
    const candidates = Object.keys(queue).filter((c) => {
      const e = queue[c];
      if (!e || !e.host || e.host === online.pid) return false;
      return queueDiffs(e).some((d) => myDiffs.includes(d));
    });
    for (const code of shuffle(candidates)) {
      if (await tryClaim(code, name, myDiffs)) { await startClaimedGame(code); return; }
      // Claim başarısızsa — odanın gerçekten ölü olduğunu doğrulamadan
      // matchmaking kaydını silme (race condition: oda yazısı henüz
      // replicate olmamış olabilir → host'u kuyruktan boşuna düşürmeyelim).
      const room = await Net.getRoom(code).catch(() => null);
      const dead = !room || room.status !== 'waiting' || (room.ids && room.ids.p1);
      if (dead) await Net.setPath(`matchmaking/${code}`, null).catch(() => {});
    }
    await createWaitingMatchRoom(name);
  } catch (e) { netErr(e); showMatchSetup(); }
}

async function createWaitingMatchRoom(name) {
  let code = genCode();
  for (let t = 0; t < 5 && (await Net.getRoom(code)); t++) code = genCode();
  online.code = code;
  const diffs = [...online.difficulties];
  await Net.createRoom(code, {
    host: online.pid, status: 'waiting',
    difficulty: diffs[0], difficulties: diffs, totalCards: 15,
    names: { p0: name }, ids: { p0: online.pid },
    qi: 0, phase: 'answer',
  });
  await Net.setPath(`matchmaking/${code}`, { host: online.pid, diffs, ts: Date.now() });
  try {
    const { ref, onDisconnect } = Net.fns;
    onDisconnect(ref(Net.db, Net.roomPath(code))).remove();
    onDisconnect(ref(Net.db, `matchmaking/${code}`)).remove();
  } catch { /* önemsiz */ }
  Net.subscribe(code, onRoomSnapshot);
  buildOnlineGAME();
  watchQueueWhileWaiting(name);
}

function watchQueueWhileWaiting(name) {
  if (online.queueUnsub) { try { online.queueUnsub(); } catch {} online.queueUnsub = null; }
  online.queueUnsub = Net.subscribePath('matchmaking', (queue) => {
    if (!online.matchmaking || !online.code) return;
    // claiming kilidi 10 sn'den uzun sürerse askıda kalmış demektir,
    // resetleyip yeniden değerlendir (deadlock guard).
    if (online.claiming && Date.now() - (online.claimingAt || 0) < 10000) return;
    if (online.claiming) { online.claiming = false; console.warn('[matchmaking] claiming kilidi zaman aşımı, sıfırlandı'); }
    queue = queue || {};
    // Başka bir aday hata sonucu kuyruk kaydımızı silmiş olabilir
    // (race cleanup). Hâlâ bekliyorken kendimizi yeniden ekle.
    if (!queue[online.code]) {
      Net.setPath(`matchmaking/${online.code}`, {
        host: online.pid, diffs: [...online.difficulties], ts: Date.now(),
      }).catch(() => {});
      return; // bir sonraki snapshot'ta normal akışa devam
    }
    const others = Object.keys(queue).filter((c) => c !== online.code && queue[c] && queue[c].host);
    const sub = $('match-sub');
    if (sub) sub.textContent = others.length
      ? `Kuyrukta ${others.length + 1} kişi · uygun zorluk aranıyor…`
      : 'Şu an başka bekleyen yok. İlk gelene eşleşeceksin.';
    const myDiffs = [...online.difficulties];
    const myEntry = queue[online.code];
    const cands = others.filter((c) => {
      const e = queue[c];
      if (!queueDiffs(e).some((d) => myDiffs.includes(d))) return false;
      // Tiebreak — herhangi bir senaryoda kilitlenmemek için iki katmanlı:
      //   1) Sonradan kuyruğa girenler önce claim atar (önceki bekleyen
      //      claim edilmeye razıdır). ts daha büyük olan claim atar.
      //   2) ts eşitse pid lexicographic karşılaştırma.
      if (myEntry && typeof e.ts === 'number' && typeof myEntry.ts === 'number') {
        if (e.ts > myEntry.ts) return false;  // o daha yeni → o claim eder
        if (e.ts < myEntry.ts) return true;   // biz daha yeniyiz → biz claim ederiz
      }
      // ts eksik / eşit → pid tiebreak (büyük pid claim eder).
      return e.host < online.pid;
    });
    console.log('[matchmaking] queue:', Object.keys(queue), 'others:', others, 'cands:', cands, 'me:', online.pid.slice(0, 8));
    if (cands.length === 0) return;
    online.claiming = true;
    online.claimingAt = Date.now();
    (async () => {
      for (const code of cands) {
        const ok = await tryClaim(code, name, myDiffs);
        console.log('[matchmaking] tryClaim', code, '→', ok);
        if (ok) {
          await teardownMyWaitingRoom();
          await startClaimedGame(code);
          return;
        }
      }
      online.claiming = false;
    })();
  });
}

async function teardownMyWaitingRoom() {
  if (online.queueUnsub) { try { online.queueUnsub(); } catch {} online.queueUnsub = null; }
  Net.stop();
  const old = online.code;
  if (old) {
    try { const { ref, remove } = Net.fns; remove(ref(Net.db, Net.roomPath(old))); } catch {}
    await Net.setPath(`matchmaking/${old}`, null).catch(() => {});
  }
}

function cancelMatch() {
  if (online.code && !online.endedShown && isHost()) {
    teardownMyWaitingRoom();
  } else {
    Net.stop();
  }
  resetOnlineState();
  showMatchSetup();
  showScreen('screen-home');
}

function syncDiffFrom(screenId) {
  const sel = document.querySelector(`#${screenId} .diff-btn.selected`);
  if (sel) online.difficulty = parseInt(sel.dataset.diff, 10);
}
function syncMatchDiffs() {
  const arr = [...document.querySelectorAll('#match-diffs .diff-btn.selected')]
    .map((b) => parseInt(b.dataset.diff, 10));
  online.difficulties = arr.length ? arr : [1];
}

function enterMatch() {
  if (online.code) leaveOnline();
  resetOnlineState();
  syncMatchDiffs();
  showMatchSetup();
  $('match-msg').textContent = '';
  showScreen('screen-match');
}

// ---------- Online ekranı olayları ----------
document.querySelectorAll('#screen-online .round-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#screen-online .round-btn').forEach((b) => b.classList.remove('selected'));
    btn.classList.add('selected');
    online.totalCards = parseInt(btn.dataset.rounds, 10);
  });
});

$('online-name').addEventListener('input', () => {
  $('avatar-preview-online').textContent = $('online-name').value.trim() ? initials($('online-name').value) : 'A';
});

document.querySelectorAll('#screen-online .diff-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#screen-online .diff-btn').forEach((b) => b.classList.remove('selected'));
    btn.classList.add('selected');
    online.difficulty = parseInt(btn.dataset.diff, 10);
  });
});

$('btn-create').addEventListener('click', createRoom);
$('btn-join').addEventListener('click', joinRoom);
$('btn-online-start').addEventListener('click', startOnlineGame);
$('btn-online-leave').addEventListener('click', leaveOnline);
$('btn-rematch').addEventListener('click', () => { if (online.code && window.GAME && window.GAME.isOnline) requestRematch(); });

// ---------- Hızlı Eşleşme ekranı olayları ----------
$('match-name').addEventListener('input', () => {
  $('avatar-preview-match').textContent = $('match-name').value.trim() ? initials($('match-name').value) : 'A';
});

document.querySelectorAll('#match-diffs .diff-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    btn.classList.toggle('selected');
    const stillSelected = document.querySelectorAll('#match-diffs .diff-btn.selected');
    if (stillSelected.length === 0) btn.classList.add('selected');
    syncMatchDiffs();
  });
});

$('btn-match').addEventListener('click', quickMatch);
$('btn-match-cancel').addEventListener('click', cancelMatch);
