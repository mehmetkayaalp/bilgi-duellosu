// ============================================================
// BİLGİ DÜELLOSU — "Aynı Cihazda" (local) denetleyici
// Tek cihazda iki oyuncu sırayla oynar. Motoru (engine.js) kullanır.
// Online denetleyici online.js içindedir.
// ============================================================

const local = {
  players: ['Oyuncu 1', 'Oyuncu 2'],
  totalCards: 10,
  scores: [0, 0],
  turn: 0,
  played: 0,
  deck: [],
  current: -1,
  jokers: [{ fifty: true, pass: true }, { fifty: true, pass: true }],
  stats: [{}, {}],
  duel: { found: [], writer: 0, over: false },
  picking: false,
};

function recordStat(stats, cat, ok) {
  const s = (stats[cat] ||= { c: 0, t: 0 });
  s.t++;
  if (ok) s.c++;
}

// ---------- window.GAME kancaları (local) ----------
function buildLocalGAME() {
  window.GAME = {
    isOnline: false,
    get players() { return local.players; },
    get scores() { return local.scores; },
    get jokers() { return local.jokers; },
    get stats() { return local.stats; },
    get deck() { return local.deck; },
    get turn() { return local.turn; },
    get played() { return local.played; },
    get totalCards() { return local.totalCards; },
    get current() { return local.current; },
    get duel() { return local.duel; },
    myIndex: 0, // local'de anlamı yok; render kısayolları için

    bonusMult: () => (local.deck[local.current]?.bonus ? 2 : 1),
    canPick: () => !local.picking,
    canDuelAct: () => true,
    ownsAdvance: () => true,

    onPick(i) {
      if (local.picking || local.deck[i].used) return;
      local.picking = true;
      local.current = i;
      if (local.deck[i].cat === 'duello') {
        local.duel = { found: [], writer: local.turn, over: false };
      }
      renderBoard();
      setTimeout(() => openCard(), 750);
    },

    commitSolo(result) {
      local.scores[local.turn] += result.points;
      recordStat(local.stats[local.turn], result.cat, result.correct);
      const card = local.deck[local.current];
      card.badge = result.badge;
      card.by = local.turn;
      showFact(result.resultText, result.correct, result.factText);
    },

    useFifty() { local.jokers[local.turn].fifty = false; },

    duelFound(name, complete) {
      local.duel.found.push(name);
      if (complete) {
        const pts = POINTS.duelDraw * this.bonusMult();
        local.scores[0] += pts;
        local.scores[1] += pts;
        recordStat(local.stats[0], 'duello', true);
        recordStat(local.stats[1], 'duello', true);
        endLocalDuel(`İnanılmaz! Hepsini buldunuz 🤝 İkinize de +${pts} puan`, true, null);
      } else {
        local.duel.writer = 1 - local.duel.writer;
        applyDuelState();
      }
    },

    duelLose(reason) {
      const winner = 1 - local.duel.writer;
      local.scores[winner] += POINTS.duelWin * this.bonusMult();
      recordStat(local.stats[winner], 'duello', true);
      recordStat(local.stats[1 - winner], 'duello', false);
      endLocalDuel(`${reason} ${local.players[winner]} düelloyu kazandı! +${POINTS.duelWin * this.bonusMult()} puan`, false, winner);
    },

    duelTimeout() {
      this.duelLose(`⏰ ${local.players[local.duel.writer]} süresinde yazamadı!`);
    },

    useDuelPass() {
      local.jokers[local.duel.writer].pass = false;
      local.duel.writer = 1 - local.duel.writer;
      updateScoreboard();
      applyDuelState();
    },

    next() { advanceLocal(); },
  };
}

function endLocalDuel(message, isDraw, winner) {
  local.duel.over = true;
  const card = local.deck[local.current];
  card.badge = isDraw ? { cls: 'draw', icon: '🤝' } : { cls: `p${winner + 1}`, icon: '⚔️' };
  card.by = isDraw ? local.turn : winner;
  applyDuelState();
  showFact(message, isDraw, questionOf(card).note || 'Soluk renkli çipler, söylenmeyen cevaplar.');
}

function advanceLocal() {
  $('overlay').classList.add('hidden');
  local.deck[local.current].used = true;
  local.played++;
  local.turn = 1 - local.turn;
  local.picking = false;

  if (local.played >= local.totalCards) {
    showEndScreen(saveStats(local));
  } else {
    renderBoard();
    updateScoreboard();
    updateBoardMsg();
  }
}

// ---------- Kalıcı istatistik (localStorage) ----------
function loadAllStats() {
  try { return JSON.parse(localStorage.getItem('bd-stats') || '{}'); }
  catch { return {}; }
}

function saveStats(g) {
  const [s1, s2] = g.scores;
  const tie = s1 === s2;
  const winnerIdx = s1 >= s2 ? 0 : 1;
  const all = loadAllStats();
  g.players.forEach((name, i) => {
    const key = norm(name);
    const rec = (all[key] ||= { name, games: 0, wins: 0, c: 0, t: 0 });
    rec.name = name;
    rec.games++;
    if (!tie && i === winnerIdx) rec.wins++;
    Object.values(g.stats[i]).forEach(({ c, t }) => { rec.c += c; rec.t += t; });
  });
  try { localStorage.setItem('bd-stats', JSON.stringify(all)); } catch { /* gizli mod */ }
  return all;
}

// ---------- Kurulum ekranı ----------
function startLocalGame() {
  local.players[0] = $('name1').value.trim() || 'Oyuncu 1';
  local.players[1] = $('name2').value.trim() || 'Oyuncu 2';
  local.scores = [0, 0];
  local.turn = 0;
  local.played = 0;
  local.deck = buildDeck(local.totalCards);
  local.current = -1;
  local.picking = false;
  local.jokers = [{ fifty: true, pass: true }, { fifty: true, pass: true }];
  local.stats = [{}, {}];

  buildLocalGAME();
  setPlayersUI();
  showScreen('screen-game');
  renderBoard();
  updateScoreboard();
  updateBoardMsg();
}

document.querySelectorAll('#screen-setup .round-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#screen-setup .round-btn').forEach((b) => b.classList.remove('selected'));
    btn.classList.add('selected');
    local.totalCards = parseInt(btn.dataset.rounds, 10);
  });
});

$('name1').addEventListener('input', () => { $('avatar-preview-1').textContent = $('name1').value.trim() ? initials($('name1').value) : 'A'; });
$('name2').addEventListener('input', () => { $('avatar-preview-2').textContent = $('name2').value.trim() ? initials($('name2').value) : 'B'; });

$('btn-start').addEventListener('click', startLocalGame);
$('btn-restart').addEventListener('click', () => showScreen('screen-home'));

// ---------- Ana menü (mod seçimi) ----------
$('mode-local').addEventListener('click', () => showScreen('screen-setup'));
$('mode-online').addEventListener('click', () => showScreen('screen-online'));
document.querySelectorAll('.btn-back-home').forEach((b) => b.addEventListener('click', () => showScreen('screen-home')));
