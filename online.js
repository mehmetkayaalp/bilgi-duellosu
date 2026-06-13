// ============================================================
// BİLGİ DÜELLOSU — "Online" denetleyici
// Firebase Realtime Database üzerinden oda kurma/katılma ve
// gerçek zamanlı senkronizasyon. Motoru (engine.js) kullanır.
// Tek doğruluk kaynağı DB'dir: her hamle DB'ye yazılır, arayüz
// gelen anlık güncellemeyle (snapshot) çizilir.
// ============================================================

const online = {
  code: null,
  pid: null,
  totalCards: 10,
  difficulty: 1,
  m: null,        // son normalize edilmiş oda durumu (ayna)
  busy: false,
  lastQKey: '',
  lastFactKey: '',
  endedShown: false,
  matchmaking: false,  // Hızlı Eşleşme modundayız
  claiming: false,     // şu an bir oda kapmaya çalışıyoruz
  queueUnsub: null,    // eşleşme kuyruğu aboneliği
};

function getPid() {
  let p = sessionStorage.getItem('bd-pid');
  if (!p) { p = 'p' + Math.random().toString(36).slice(2, 10); sessionStorage.setItem('bd-pid', p); }
  return p;
}

function clone(x) { return x ? JSON.parse(JSON.stringify(x)) : x; }

function normalizeRoom(r) {
  return {
    status: r.status,
    phase: r.phase || 'pick',
    totalCards: r.totalCards || 10,
    difficulty: typeof r.difficulty === 'number' ? r.difficulty : 1,
    names: [r.names?.p0 || 'Oyuncu 1', r.names?.p1 || 'Bekleniyor…'],
    ids: [r.ids?.p0 || null, r.ids?.p1 || null],
    scores: r.scores || [0, 0],
    jokers: r.jokers || [{ fifty: true, pass: true }, { fifty: true, pass: true }],
    stats: r.stats ? [r.stats[0] || {}, r.stats[1] || {}] : [{}, {}],
    deck: (r.deck || []).map((c) => ({
      cat: c.cat, qIndex: c.qIndex, used: !!c.used,
      badge: c.badge || null, by: typeof c.by === 'number' ? c.by : null, bonus: !!c.bonus,
    })),
    turn: r.turn || 0,
    played: r.played || 0,
    current: typeof r.current === 'number' ? r.current : -1,
    fact: r.fact || null,
    duel: r.duel
      ? { found: r.duel.found || [], writer: r.duel.writer || 0, over: !!r.duel.over }
      : { found: [], writer: 0, over: false },
    host: r.host,
  };
}

function myIndex() {
  if (!online.m) return -1;
  return online.m.ids[0] === online.pid ? 0 : online.m.ids[1] === online.pid ? 1 : -1;
}

function recordStatO(stats, cat, ok) {
  const s = (stats[cat] ||= { c: 0, t: 0 });
  s.t++;
  if (ok) s.c++;
}

// ---------- window.GAME kancaları (online) ----------
function buildOnlineGAME() {
  window.GAME = {
    isOnline: true,
    get players() { return online.m.names; },
    get scores() { return online.m.scores; },
    get jokers() { return online.m.jokers; },
    get stats() { return online.m.stats; },
    get deck() { return online.m.deck; },
    get turn() { return online.m.turn; },
    get played() { return online.m.played; },
    get totalCards() { return online.m.totalCards; },
    get current() { return online.m.current; },
    get duel() { return online.m.duel; },
    get difficulty() { return online.m.difficulty; },
    get myIndex() { return myIndex(); },

    bonusMult: () => (online.m.deck[online.m.current]?.bonus ? 2 : 1),
    canPick: () => online.m.status === 'playing' && online.m.phase === 'pick' && myIndex() === online.m.turn && !online.busy,
    canDuelAct: () => online.m.phase === 'duel' && !online.m.duel.over && online.m.duel.writer === myIndex() && !online.busy,
    ownsAdvance: () => myIndex() === online.m.turn,

    onPick(i) {
      if (!this.canPick() || online.m.deck[i].used) return;
      online.busy = true;
      const cat = online.m.deck[i].cat;
      const patch = { current: i, phase: cat === 'duello' ? 'duel' : 'question' };
      if (cat === 'duello') patch.duel = { found: [], writer: online.m.turn, over: false };
      Net.updateRoom(online.code, patch).catch(netErr);
    },

    commitSolo(result) {
      online.busy = true;
      const scores = clone(online.m.scores);
      const stats = clone(online.m.stats);
      const deck = clone(online.m.deck);
      scores[online.m.turn] += result.points;
      recordStatO(stats[online.m.turn], result.cat, result.correct);
      deck[online.m.current].badge = result.badge;
      deck[online.m.current].by = online.m.turn;
      Net.updateRoom(online.code, {
        scores, stats, deck, phase: 'fact',
        fact: {
          resultText: result.resultText, isWin: result.correct, factText: result.factText,
          answer: result.answer || null, chosen: result.chosen || null,
        },
      }).catch(netErr);
    },

    useFifty() {
      const jokers = clone(online.m.jokers);
      jokers[online.m.turn].fifty = false;
      Net.updateRoom(online.code, { jokers }).catch(netErr);
    },

    duelFound(name, complete) {
      online.busy = true;
      $('duel-input').disabled = true;
      const d = online.m.duel;
      const found = [...d.found, name];
      if (complete) {
        const pts = POINTS.duelDraw * this.bonusMult();
        const scores = clone(online.m.scores);
        const stats = clone(online.m.stats);
        const deck = clone(online.m.deck);
        scores[0] += pts; scores[1] += pts;
        recordStatO(stats[0], 'duello', true);
        recordStatO(stats[1], 'duello', true);
        deck[online.m.current].badge = { cls: 'draw', icon: '🤝' };
        deck[online.m.current].by = online.m.turn;
        Net.updateRoom(online.code, {
          scores, stats, deck, phase: 'fact',
          duel: { found, writer: d.writer, over: true },
          fact: { resultText: `İnanılmaz! Hepsini buldunuz 🤝 İkinize de +${pts} puan`, isWin: true, factText: duelNote() },
        }).catch(netErr);
      } else {
        Net.updateRoom(online.code, { duel: { found, writer: 1 - d.writer, over: false } }).catch(netErr);
      }
    },

    duelLose(reason) {
      online.busy = true;
      $('duel-input').disabled = true;
      const d = online.m.duel;
      const winner = 1 - d.writer;
      const m = this.bonusMult();
      const scores = clone(online.m.scores);
      const stats = clone(online.m.stats);
      const deck = clone(online.m.deck);
      scores[winner] += POINTS.duelWin * m;
      recordStatO(stats[winner], 'duello', true);
      recordStatO(stats[1 - winner], 'duello', false);
      deck[online.m.current].badge = { cls: `p${winner + 1}`, icon: '⚔️' };
      deck[online.m.current].by = winner;
      Net.updateRoom(online.code, {
        scores, stats, deck, phase: 'fact',
        duel: { found: d.found, writer: d.writer, over: true },
        fact: {
          resultText: `${reason} ${online.m.names[winner]} düelloyu kazandı! +${POINTS.duelWin * m} puan`,
          isWin: false, factText: duelNote(),
        },
      }).catch(netErr);
    },

    duelTimeout() { this.duelLose(`⏰ ${online.m.names[online.m.duel.writer]} süresinde yazamadı!`); },

    useDuelPass() {
      const d = online.m.duel;
      const jokers = clone(online.m.jokers);
      jokers[d.writer].pass = false;
      online.busy = true;
      $('duel-input').disabled = true;
      Net.updateRoom(online.code, { jokers, duel: { found: d.found, writer: 1 - d.writer, over: false } }).catch(netErr);
    },

    next() {
      if (!this.ownsAdvance()) return;
      online.busy = true;
      const deck = clone(online.m.deck);
      deck[online.m.current].used = true;
      const played = online.m.played + 1;
      const patch = {
        deck, played, current: -1, phase: 'pick',
        turn: 1 - online.m.turn, fact: null, duel: null,
      };
      if (played >= online.m.totalCards) patch.status = 'ended';
      Net.updateRoom(online.code, patch).catch(netErr);
    },
  };
}

function duelNote() {
  const card = online.m.deck[online.m.current];
  return DATA[card.cat][card.qIndex].note || 'Soluk renkli çipler, söylenmeyen cevaplar.';
}

function netErr(e) {
  console.error(e);
  alert('Bağlantı hatası: ' + (e?.message || e));
}

// ---------- Anlık güncelleme (snapshot) işleyici ----------
function onRoomSnapshot(raw) {
  if (!raw) {
    // Oda silindi (rakip ayrıldı / oyun bitti)
    if (online.code) {
      Net.stop();
      online.code = null;
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
      showEndScreen(saveStats({ players: online.m.names, scores: online.m.scores, stats: online.m.stats }));
      // Oyun bitti: kurucu odayı tamamen kapatır (açık oda kalmasın)
      if (online.m.host === online.pid) {
        try { const { ref, remove } = Net.fns; remove(ref(Net.db, Net.roomPath(online.code))); } catch { /* önemsiz */ }
      }
    }
    return;
  }

  // status: playing — oyuna girdik, eşleşme kuyruğu aboneliğini kapat
  if (online.queueUnsub) { try { online.queueUnsub(); } catch {} online.queueUnsub = null; }
  if (!$('screen-game').classList.contains('active')) {
    setPlayersUI();
    showScreen('screen-game');
  }
  updateScoreboard();
  renderBoard();

  const cur = online.m.current;
  const phase = online.m.phase;

  if (phase === 'pick') {
    $('overlay').classList.add('hidden');
    online.busy = false;
    online.lastQKey = '';
    online.lastFactKey = '';
    updateBoardMsg();
    return;
  }

  if (phase === 'question') {
    if (online.lastQKey !== `q${cur}`) {
      online.lastQKey = `q${cur}`;
      online.busy = false;
      openCard();
    }
    return;
  }

  if (phase === 'duel') {
    if (online.lastQKey !== `d${cur}`) {
      online.lastQKey = `d${cur}`;
      online.busy = false;
      openCard(); // renderDuel + applyDuelState
    } else {
      online.busy = false;
      applyDuelState();
    }
    return;
  }

  if (phase === 'fact') {
    if (online.lastFactKey !== `f${cur}`) {
      online.lastFactKey = `f${cur}`;
      online.busy = false;
      const f = online.m.fact || {};
      // Rakip izleyiciyse, onun gördüğü şıkları sonuçla boya
      if (myIndex() !== online.m.turn && f.answer) revealReadonly(f.answer, f.chosen);
      showFact(f.resultText || '', f.isWin, f.factText || '');
    }
  }
}

// ---------- Lobi ----------
function genCode() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6 haneli
}

async function createRoom() {
  const name = $('online-name').value.trim();
  if (!name) { lobbyMsg('Önce ismini yaz.'); return; }
  if (!Net.isConfigured()) { lobbyMsg('⚠️ Firebase anahtarları girilmemiş — README\'deki kurulumu yap.'); return; }

  lobbyMsg('Oda kuruluyor…');
  online.pid = getPid();
  try {
    await Net.init();
    let code = genCode();
    for (let t = 0; t < 5 && (await Net.getRoom(code)); t++) code = genCode();
    online.code = code;
    online.endedShown = false;
    await Net.createRoom(code, {
      host: online.pid,
      status: 'waiting',
      totalCards: online.totalCards,
      difficulty: online.difficulty,
      names: { p0: name },
      ids: { p0: online.pid },
      turn: 0, played: 0, current: -1, phase: 'pick',
    });
    // Host bağlantısı koparsa oda otomatik silinsin
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
  if (!Net.isConfigured()) { lobbyMsg('⚠️ Firebase anahtarları girilmemiş — README\'deki kurulumu yap.'); return; }

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
  if (online.m.host !== online.pid) return;
  if (!online.m.ids[1]) { lobbyMsg('Rakip henüz katılmadı.'); return; }
  const deck = buildDeck(online.m.totalCards, online.m.difficulty);
  Net.updateRoom(online.code, {
    status: 'playing', phase: 'pick', turn: 0, played: 0, current: -1,
    scores: [0, 0], deck,
    jokers: [{ fifty: true, pass: true }, { fifty: true, pass: true }],
    stats: [{}, {}], fact: null, duel: null,
  }).catch(netErr);
}

function leaveOnline() {
  const code = online.code;
  const wasHost = online.m && online.m.host === online.pid;
  Net.stop();
  // Oyun normal bittiyse (endedShown) oda zaten kapatıldı; tekrar yazıp
  // hayalet oda oluşturma. Sadece oyun ortasında ayrılınca temizle.
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
  online.code = null;
  online.m = null;
  online.endedShown = false;
  online.busy = false;
  online.lastQKey = '';
  online.lastFactKey = '';
  online.matchmaking = false;
  online.claiming = false;
}

// Online ekranına her girişte lobiyi temiz başlat (eski oda kodu kalmasın)
function enterOnline() {
  // Açık bir odamız varsa (host'sak) kapatıp çık
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
  const isHost = online.m.host === online.pid;

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
  const info = `${dd.icon} ${dd.name}${dd.sub ? ` (${dd.sub})` : ''} · ${online.m.totalCards} kart`;
  const ready = !!online.m.ids[1];
  if (isHost) {
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
//  Kuyruk: /matchmaking/{code} = { host, diff, ts }
//  Bekleyen oyuncular burada listelenir; arayan biri kapar.
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
  // Eşleşme modunda bekleme ekranı (oda kodu vb. gösterme)
  if (!$('screen-match').classList.contains('active')) showScreen('screen-match');
  const joined = online.m && online.m.ids[1];
  showMatchSearching(
    joined ? 'Rakip bulundu! Başlatılıyor…' : 'Rakip aranıyor…',
    joined ? '' : 'İlk gelen rakiple eşleşeceksin.'
  );
}

// Bir bekleme odasını atomik olarak kap (transaction)
async function tryClaim(code, name) {
  try {
    const res = await Net.claim(code, (room) => {
      if (!room) return;                       // oda yok
      if (room.status !== 'waiting') return;   // başlamış
      if (room.ids && room.ids.p1) return;     // dolu
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

// Kapılan odada oyunu başlat (deste kur + playing) — kapan oyuncu yapar
async function startClaimedGame(code) {
  online.code = code;
  online.matchmaking = true;
  online.endedShown = false;
  online.busy = false;
  await Net.setPath(`matchmaking/${code}`, null).catch(() => {});
  const room = await Net.getRoom(code);
  const diff = typeof room?.difficulty === 'number' ? room.difficulty : 1;
  const deck = buildDeck(room?.totalCards || 10, diff);
  await Net.updateRoom(code, {
    status: 'playing', phase: 'pick', turn: 0, played: 0, current: -1,
    scores: [0, 0], deck,
    jokers: [{ fifty: true, pass: true }, { fifty: true, pass: true }],
    stats: [{}, {}], fact: null, duel: null,
  });
  Net.subscribe(code, onRoomSnapshot);
  buildOnlineGAME();
}

async function quickMatch() {
  const name = $('match-name').value.trim();
  if (!name) { matchMsg('Önce ismini yaz.'); return; }
  if (!Net.isConfigured()) { matchMsg('⚠️ Firebase anahtarları girilmemiş — README\'deki kurulumu yap.'); return; }

  online.pid = getPid();
  online.matchmaking = true;
  online.endedShown = false;
  showMatchSearching('Rakip aranıyor…');

  try {
    await Net.init();
    // 1) Kuyruğu oku, bekleyen birini kapmayı dene (önce aynı zorluk)
    const queue = (await Net.getPath('matchmaking')) || {};
    const myDiff = online.difficulty;
    const codes = Object.keys(queue).filter((c) => queue[c] && queue[c].host && queue[c].host !== online.pid);
    const ordered = [...shuffle(codes.filter((c) => queue[c].diff === myDiff)), ...shuffle(codes.filter((c) => queue[c].diff !== myDiff))];
    for (const code of ordered) {
      if (await tryClaim(code, name)) { await startClaimedGame(code); return; }
      // kapılamadıysa (oda gitmiş olabilir) kuyruktan temizle
      await Net.setPath(`matchmaking/${code}`, null).catch(() => {});
    }
    // 2) Kimse yok → kendi bekleme odanı kur ve bekle
    await createWaitingMatchRoom(name);
  } catch (e) { netErr(e); showMatchSetup(); }
}

async function createWaitingMatchRoom(name) {
  let code = genCode();
  for (let t = 0; t < 5 && (await Net.getRoom(code)); t++) code = genCode();
  online.code = code;
  await Net.createRoom(code, {
    host: online.pid, status: 'waiting',
    difficulty: online.difficulty, totalCards: 10,
    names: { p0: name }, ids: { p0: online.pid },
    turn: 0, played: 0, current: -1, phase: 'pick',
  });
  await Net.setPath(`matchmaking/${code}`, { host: online.pid, diff: online.difficulty, ts: Date.now() });
  // Bağlantı koparsa hem odayı hem kuyruk kaydını temizle
  try {
    const { ref, onDisconnect } = Net.fns;
    onDisconnect(ref(Net.db, Net.roomPath(code))).remove();
    onDisconnect(ref(Net.db, `matchmaking/${code}`)).remove();
  } catch { /* önemsiz */ }
  Net.subscribe(code, onRoomSnapshot);
  buildOnlineGAME();
  watchQueueWhileWaiting(name);
}

// İki kişi aynı anda oda kurarsa ikisi de beklemesin: kuyruğu dinle,
// pid karşılaştırmasıyla (yalnızca büyük pid kapar) tek taraf eşleştirsin.
function watchQueueWhileWaiting(name) {
  if (online.queueUnsub) { try { online.queueUnsub(); } catch {} online.queueUnsub = null; }
  online.queueUnsub = Net.subscribePath('matchmaking', (queue) => {
    if (!online.matchmaking || !online.code || online.claiming) return;
    queue = queue || {};
    const cands = Object.keys(queue).filter(
      (c) => c !== online.code && queue[c] && queue[c].host && queue[c].host < online.pid
    );
    if (cands.length === 0) return;
    online.claiming = true;
    (async () => {
      for (const code of cands) {
        if (await tryClaim(code, name)) {
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
  // Beklerken iptal: odamı ve kuyruk kaydımı temizle
  if (online.code && !online.endedShown && online.m && online.m.host === online.pid) {
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

function enterMatch() {
  if (online.code) leaveOnline();
  resetOnlineState();
  syncDiffFrom('screen-match');
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

// ---------- Hızlı Eşleşme ekranı olayları ----------
$('match-name').addEventListener('input', () => {
  $('avatar-preview-match').textContent = $('match-name').value.trim() ? initials($('match-name').value) : 'A';
});

document.querySelectorAll('#screen-match .diff-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#screen-match .diff-btn').forEach((b) => b.classList.remove('selected'));
    btn.classList.add('selected');
    online.difficulty = parseInt(btn.dataset.diff, 10);
  });
});

$('btn-match').addEventListener('click', quickMatch);
$('btn-match-cancel').addEventListener('click', cancelMatch);
