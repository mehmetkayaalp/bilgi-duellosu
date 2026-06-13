// ============================================================
// BİLGİ DÜELLOSU — Ortak Motor (engine)
// Hem "Aynı Cihazda" (game.js) hem "Online" (online.js) modu bu
// motoru kullanır. Motor, aktif denetleyiciyi `window.GAME` üzerinden
// okur; render eder, GAME'in commit/next gibi kancalarını çağırır.
// ============================================================

const $ = (id) => document.getElementById(id);

const POINTS = { normal: 10, fast: 5, duelWin: 20, duelDraw: 15 };
const TIME_LIMIT = 20;        // şıklı sorular için saniye
const DUEL_TIME_LIMIT = 30;   // "Yaz Bakalım" için daha uzun süre
const FAST_LIMIT = 10;        // bu süreden hızlı cevaplayana bonus

// ---------- Saf yardımcılar ----------
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Türkçe karakterleri sadeleştirerek cevap karşılaştırması yapar
function norm(s) {
  return s
    .toLocaleLowerCase('tr')
    .replaceAll('ı', 'i').replaceAll('ş', 's').replaceAll('ç', 'c')
    .replaceAll('ğ', 'g').replaceAll('ü', 'u').replaceAll('ö', 'o')
    .replace(/[^a-z0-9]/g, '');
}

// İki kelime arasında en fazla 1 harflik fark var mı? ("Antartika" → Antarktika)
function withinOneEdit(a, b) {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1) return false;
  const [s, l] = a.length <= b.length ? [a, b] : [b, a];
  let i = 0, j = 0, edits = 0;
  while (i < s.length && j < l.length) {
    if (s[i] === l[j]) { i++; j++; continue; }
    if (++edits > 1) return false;
    if (s.length === l.length) { i++; j++; }
    else j++;
  }
  return edits + (l.length - j) + (s.length - i) <= 1;
}

function formatYear(y) {
  return y < 0 ? `MÖ ${-y}` : `${y}`;
}

function initials(name) {
  return (name || '').trim().charAt(0).toLocaleUpperCase('tr') || '?';
}

// Bir kategorinin, seçilen zorluktaki soru indekslerini döndürür.
// O zorlukta soru yoksa en yakın zorluğa, o da yoksa tümüne düşer.
function poolFor(cat, diff) {
  const all = DATA[cat];
  const idxAt = (d) => all.map((q, i) => [q, i]).filter(([q]) => (q.d ?? 1) === d).map(([, i]) => i);
  let pool = idxAt(diff);
  if (pool.length === 0) pool = [...idxAt(diff - 1), ...idxAt(diff + 1)];
  if (pool.length === 0) pool = all.map((_, i) => i);
  return pool;
}

// Deste kur: kategorileri dengeli dağıt, her karta seçilen zorlukta soru (qIndex)
// ata, en az 1 düello garanti, 1-2 gizli çift puan kartı serpiştir.
function buildDeck(n, diff = 1) {
  const cats = shuffle(Object.keys(CATEGORIES));
  const list = [];
  for (let i = 0; i < n; i++) list.push(cats[i % cats.length]);
  const catList = shuffle(list);
  if (!catList.includes('duello')) catList[Math.floor(Math.random() * n)] = 'duello';

  const pools = {};
  const deck = catList.map((cat) => {
    if (!pools[cat] || pools[cat].length === 0) pools[cat] = shuffle(poolFor(cat, diff));
    return { cat, qIndex: pools[cat].pop(), used: false, badge: null, by: null, bonus: false };
  });

  const bonusCount = n >= 14 ? 2 : 1;
  shuffle(deck.map((_, i) => i)).slice(0, bonusCount).forEach((i) => { deck[i].bonus = true; });
  return deck;
}

function questionOf(card) {
  return DATA[card.cat][card.qIndex];
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  $(id).classList.add('active');
}

// ---------- Süre sayacı ----------
const timer = { id: null, started: 0 };

function startTimer(onTimeout, seconds = TIME_LIMIT) {
  stopTimer();
  timer.started = Date.now();
  $('timer-row').classList.remove('hidden');
  renderTimer(seconds, seconds);
  timer.id = setInterval(() => {
    const elapsed = (Date.now() - timer.started) / 1000;
    const remain = Math.max(0, seconds - elapsed);
    renderTimer(remain, seconds);
    if (remain <= 0) {
      stopTimer();
      onTimeout();
    }
  }, 100);
}

function stopTimer() {
  if (timer.id) clearInterval(timer.id);
  timer.id = null;
}

function elapsedSec() {
  return (Date.now() - timer.started) / 1000;
}

function renderTimer(remain, total) {
  $('timer-fill').style.width = `${(remain / total) * 100}%`;
  $('timer-sec').textContent = Math.ceil(remain);
  $('timer-row').classList.toggle('low', remain <= 5);
}

// ---------- Skor tablosu & masa ----------
function updateScoreboard() {
  const G = window.GAME;
  $('pscore1').textContent = G.scores[0];
  $('pscore2').textContent = G.scores[1];
  const diff = DIFFICULTIES[G.difficulty ?? 1];
  $('progress').textContent = `${diff.icon} ${diff.name} · Kart ${Math.min(G.played + 1, G.totalCards)} / ${G.totalCards}`;
  $('progress-fill').style.width = `${(G.played / G.totalCards) * 100}%`;
  $('score-box-1').classList.toggle('turn-active', G.turn === 0);
  $('score-box-2').classList.toggle('turn-active', G.turn === 1);

  [0, 1].forEach((i) => {
    $(`jokers${i + 1}`).innerHTML =
      `<span class="${G.jokers[i].fifty ? '' : 'used'}">🃏50:50</span>` +
      `<span class="${G.jokers[i].pass ? '' : 'used'}">🃏Pas</span>`;
  });
}

function setPlayersUI() {
  const G = window.GAME;
  $('pname1').textContent = G.players[0];
  $('pname2').textContent = G.players[1];
  $('avatar1').textContent = initials(G.players[0]);
  $('avatar2').textContent = initials(G.players[1]);
}

function renderBoard() {
  const G = window.GAME;
  const board = $('board');
  board.innerHTML = '';

  G.deck.forEach((card, i) => {
    const el = document.createElement('div');
    el.className = 'board-card' + (card.used ? ` used flipped by-p${card.by + 1}` : '');
    if (G.current === i && !card.used) el.classList.add('flipped');
    el.innerHTML = `
      <div class="inner">
        <div class="face back"><span class="emblem">✦</span></div>
        <div class="face front">
          ${card.bonus ? '<span class="bonus-star">⭐2x</span>' : ''}
          <span class="cat-icon">${CATEGORIES[card.cat].icon}</span>
          <span>${CATEGORIES[card.cat].name}</span>
        </div>
      </div>
      ${card.badge ? `<div class="result-badge ${card.badge.cls}">${card.badge.icon}</div>` : ''}`;

    if (!card.used && G.canPick()) el.addEventListener('click', () => G.onPick(i));
    board.appendChild(el);
  });
}

function updateBoardMsg() {
  const G = window.GAME;
  const mine = !G.isOnline || G.turn === G.myIndex;
  if (mine) {
    $('board-msg').innerHTML =
      `Sıra sende, <span class="turn-name p${G.turn + 1}">${G.players[G.turn]}</span>! Bir kart seç 👇`;
  } else {
    $('board-msg').innerHTML =
      `<span class="turn-name p${G.turn + 1}">${G.players[G.turn]}</span> kart seçiyor… ⏳`;
  }
}

// ---------- Soru açılışı ----------
function resetOverlayUI() {
  $('fact-panel').classList.add('hidden');
  $('duel-box').classList.add('hidden');
  $('q-options').innerHTML = '';
  $('q-options').className = '';
  $('joker-row').innerHTML = '';
  $('q-spectate').classList.add('hidden');
  $('duel-input').disabled = false;
  $('duel-submit').disabled = false;
  $('duel-pass').classList.remove('hidden');
}

// Aktif denetleyici bir kartı açtığında çağrılır.
function openCard() {
  const G = window.GAME;
  const card = G.deck[G.current];
  const q = questionOf(card);

  $('overlay').classList.remove('hidden');
  resetOverlayUI();
  $('q-category').textContent = `${CATEGORIES[card.cat].icon} ${CATEGORIES[card.cat].name}`;
  $('bonus-banner').classList.toggle('hidden', !card.bonus);

  const playerEl = $('q-player');
  if (card.cat === 'duello') {
    playerEl.textContent = '⚔️ İkiniz de oynuyorsunuz!';
    playerEl.className = 'q-player';
    renderDuel(q);
    return;
  }

  playerEl.textContent = `Cevaplayan: ${G.players[G.turn]}`;
  playerEl.className = `q-player p${G.turn + 1}`;

  // Online'da soruyu sadece sırası gelen oyuncu cevaplar; rakip soruyu ve
  // şıkları görür, cevap verince sonucu da görür (readonly).
  if (G.isOnline && G.turn !== G.myIndex) {
    renderReadonly(card.cat, q);
    return;
  }

  if (card.cat === 'bayrak') {
    renderMultipleChoice(q, card.cat, `<div class="q-flag">${q.flag}</div><p class="q-text" style="text-align:center">Bu bayrak hangi ülkenin?</p>`);
  } else if (card.cat === 'unlu' || card.cat === 'baskent' || card.cat === 'kita') {
    renderMultipleChoice(q, card.cat, `<p class="q-text">${q.question}</p>`);
  } else if (card.cat === 'dogruYanlis') {
    renderTrueFalse(q);
  } else if (card.cat === 'eski') {
    renderOlder(q);
  }
}

// Online'da rakip cevaplarken: soruyu + şıkları (devre dışı) göster
function renderReadonly(cat, q) {
  const G = window.GAME;
  $('timer-row').classList.add('hidden');

  let body = '';
  if (cat === 'bayrak') body = `<div class="q-flag">${q.flag}</div><p class="q-text" style="text-align:center">Bu bayrak hangi ülkenin?</p>`;
  else if (cat === 'unlu' || cat === 'baskent' || cat === 'kita') body = `<p class="q-text">${q.question}</p>`;
  else if (cat === 'dogruYanlis') body = `<p class="q-text">${q.statement}</p>`;
  else if (cat === 'eski') body = `<p class="q-text">⏳ Hangisi daha önce oldu?</p>`;
  $('q-body').innerHTML =
    `<p class="spectate-note">✍️ <span class="turn-name p${G.turn + 1}">${G.players[G.turn]}</span> yanıtlıyor…</p>${body}`;

  const box = $('q-options');
  box.className = '';
  let opts;
  if (cat === 'dogruYanlis') { opts = ['✅ Doğru', '❌ Yanlış']; }
  else if (cat === 'eski') { box.className = 'stacked'; opts = [q.a.text, q.b.text]; }
  else { opts = shuffle([q.answer, ...q.wrong]); }

  opts.forEach((t) => {
    const b = document.createElement('button');
    b.className = 'opt-btn' + (cat === 'dogruYanlis' ? ' tf' : '') + (cat === 'eski' ? ' event' : '');
    b.textContent = t;
    b.disabled = true;
    box.appendChild(b);
  });
}

// Rakibin cevabını görmek için: readonly şıkları sonuçla boya
function revealReadonly(answer, chosen) {
  $('q-options').querySelectorAll('.opt-btn').forEach((b) => {
    if (b.textContent === answer) b.classList.add('correct');
    else if (chosen && b.textContent === chosen) b.classList.add('wrong');
  });
}

// ---------- Puanlama (motor hesaplar, controller işler) ----------
function settleSolo(correct, cat, q, resultText, answer, chosen) {
  stopTimer();
  const G = window.GAME;
  const m = G.bonusMult();
  let points = 0, fast = false, msg = resultText;
  if (correct) {
    points = POINTS.normal * m;
    if (elapsedSec() <= FAST_LIMIT) { points += POINTS.fast * m; fast = true; }
    msg = `Doğru! +${points} puan${fast ? ' (⚡ hız bonusu dahil)' : ''} 🎉`;
  }
  G.commitSolo({
    correct, cat, points, answer, chosen,
    badge: correct ? { cls: `p${G.turn + 1}`, icon: '✓' } : { cls: 'no', icon: '✗' },
    factText: q.fact,
    resultText: msg,
  });
}

function lockOptions(isCorrectBtn, clickedBtn) {
  $('q-options').querySelectorAll('.opt-btn').forEach((b) => {
    b.disabled = true;
    if (isCorrectBtn(b)) b.classList.add('correct');
    else if (b === clickedBtn) b.classList.add('wrong');
  });
}

// --- Çoktan seçmeli ---
function renderMultipleChoice(q, cat, bodyHtml) {
  const G = window.GAME;
  $('q-body').innerHTML = bodyHtml;
  const options = shuffle([q.answer, ...q.wrong]);
  const box = $('q-options');

  options.forEach((opt) => {
    const btn = document.createElement('button');
    btn.className = 'opt-btn';
    btn.textContent = opt;
    btn.addEventListener('click', () => {
      const correct = opt === q.answer;
      lockOptions((b) => b.textContent === q.answer, btn);
      $('joker-row').innerHTML = '';
      settleSolo(correct, cat, q, `Yanlış! ('${opt}' seçildi) Doğru cevap: ${q.answer}`, q.answer, opt);
    });
    box.appendChild(btn);
  });

  if (G.jokers[G.turn].fifty) {
    const jbtn = document.createElement('button');
    jbtn.className = 'joker-btn';
    jbtn.innerHTML = '🃏 50:50 <small>(iki yanlış şık silinir)</small>';
    jbtn.addEventListener('click', () => {
      G.useFifty();
      const wrongBtns = [...box.querySelectorAll('.opt-btn')].filter((b) => b.textContent !== q.answer);
      shuffle(wrongBtns).slice(0, 2).forEach((b) => { b.classList.add('removed'); b.disabled = true; });
      jbtn.remove();
      updateScoreboard();
    });
    $('joker-row').appendChild(jbtn);
  }

  startTimer(() => {
    lockOptions((b) => b.textContent === q.answer, null);
    $('joker-row').innerHTML = '';
    settleSolo(false, cat, q, `⏰ Süre doldu! Doğru cevap: ${q.answer}`, q.answer, null);
  });
}

// --- Doğru / Yanlış ---
function renderTrueFalse(q) {
  $('q-body').innerHTML = `<p class="q-text">${q.statement}</p>`;
  const box = $('q-options');
  const correctLabel = q.answer ? 'Doğru' : 'Yanlış';

  [{ label: '✅ Doğru', val: true }, { label: '❌ Yanlış', val: false }].forEach(({ label, val }) => {
    const btn = document.createElement('button');
    btn.className = 'opt-btn tf';
    btn.textContent = label;
    btn.addEventListener('click', () => {
      const correct = val === q.answer;
      lockOptions((b) => b.textContent.includes(correctLabel), btn);
      settleSolo(correct, 'dogruYanlis', q, `Yanlış! Bu bilgi ${correctLabel.toUpperCase()} idi.`, q.answer ? '✅ Doğru' : '❌ Yanlış', label);
    });
    box.appendChild(btn);
  });

  startTimer(() => {
    lockOptions((b) => b.textContent.includes(correctLabel), null);
    settleSolo(false, 'dogruYanlis', q, `⏰ Süre doldu! Bu bilgi ${correctLabel.toUpperCase()} idi.`, q.answer ? '✅ Doğru' : '❌ Yanlış', null);
  });
}

// --- Hangisi Daha Eski? ---
function renderOlder(q) {
  $('q-body').innerHTML = `<p class="q-text">⏳ Hangisi daha önce oldu?</p>`;
  const box = $('q-options');
  box.className = 'stacked';
  const older = q.a.year <= q.b.year ? q.a : q.b;

  const revealAll = () => {
    box.querySelectorAll('.opt-btn').forEach((b, idx) => {
      b.disabled = true;
      const ev = idx === 0 ? q.a : q.b;
      b.textContent = `${ev.text} — ${formatYear(ev.year)}`;
      if (ev === older) b.classList.add('correct');
    });
  };

  [q.a, q.b].forEach((ev) => {
    const btn = document.createElement('button');
    btn.className = 'opt-btn event';
    btn.textContent = ev.text;
    btn.addEventListener('click', () => {
      const correct = ev === older;
      revealAll();
      if (!correct) box.querySelector(`.opt-btn:nth-child(${ev === q.a ? 1 : 2})`).classList.add('wrong');
      settleSolo(correct, 'eski', q, `Yanlış! Daha eski olan: ${older.text} (${formatYear(older.year)})`, older.text, ev.text);
    });
    box.appendChild(btn);
  });

  startTimer(() => {
    revealAll();
    settleSolo(false, 'eski', q, `⏰ Süre doldu! Daha eski olan: ${older.text} (${formatYear(older.year)})`, older.text, null);
  });
}

// ---------- Yaz Bakalım (düello) ----------
function matchDuel(answers, raw) {
  const n = norm(raw);
  return (
    answers.find((a) => norm(a.name) === n || a.aliases.some((al) => norm(al) === n)) ||
    answers.find((a) =>
      [a.name, ...a.aliases].some((al) => {
        const t = norm(al);
        return t.length >= 6 && n.length >= 5 && withinOneEdit(t, n);
      })
    )
  );
}

function renderDuel(q) {
  const G = window.GAME;
  $('q-body').innerHTML = `<p class="q-text">⚔️ ${q.prompt}</p>
    <p class="q-hint">Sıra sende olunca <b>tek bir cevap</b> yaz ve gönder — sıra rakibe geçer. Süre dolan, yanlış veya daha önce söyleneni yazan kaybeder! (${q.answers.length} cevap var)</p>`;
  $('duel-box').classList.remove('hidden');
  $('duel-found').innerHTML = '';
  $('duel-input').value = '';
  applyDuelState();
}

// Düello durumunu (yerel veya uzak) ekrana uygula
function applyDuelState() {
  const G = window.GAME;
  const d = G.duel;
  const q = questionOf(G.deck[G.current]);
  $('duel-warn').classList.add('hidden');

  // Bulunan çipleri yeniden çiz
  const found = $('duel-found');
  found.innerHTML = '';
  d.found.forEach((name) => {
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.textContent = name;
    found.appendChild(chip);
  });

  if (d.over) {
    // Eksik cevapları soluk göster
    q.answers.forEach((a) => {
      if (!d.found.includes(a.name)) {
        const chip = document.createElement('span');
        chip.className = 'chip missed';
        chip.textContent = a.name;
        found.appendChild(chip);
      }
    });
    return;
  }

  const el = $('duel-turn');
  const canAct = G.canDuelAct();
  el.textContent = canAct
    ? `✍️ Yazma sırası SENDE!`
    : `✍️ Yazma sırası: ${G.players[d.writer]}`;
  el.className = `duel-turn p${d.writer + 1}`;

  $('duel-input').disabled = !canAct;
  $('duel-submit').disabled = !canAct;
  $('duel-input').placeholder = canAct ? "Cevabını yaz ve Enter'a bas..." : 'Rakip yazıyor…';
  $('duel-joker-pass').classList.toggle('hidden', !(canAct && G.jokers[d.writer].pass));
  $('duel-pass').classList.toggle('hidden', !canAct);

  stopTimer();
  if (canAct) {
    $('duel-input').focus();
    startTimer(() => G.duelTimeout(), DUEL_TIME_LIMIT);
  } else {
    $('timer-row').classList.add('hidden');
  }
}

function duelSubmit() {
  const G = window.GAME;
  if (!G.canDuelAct()) return;
  const raw = $('duel-input').value.trim();
  if (!raw) return;
  $('duel-input').value = ''; // gönderince kutuyu temizle (eski yazı kalmasın)
  const q = questionOf(G.deck[G.current]);
  const match = matchDuel(q.answers, raw);

  if (match && !G.duel.found.includes(match.name)) {
    const complete = G.duel.found.length + 1 === q.answers.length;
    G.duelFound(match.name, complete);
  } else if (match) {
    // Zaten söylenmiş cevap → KAYBETME, uyar ve o kutuyu yanıp söndür, tekrar dene
    flashDuplicate(match.name);
  } else {
    // Listede olmayan cevap → düelloyu kaybeder
    G.duelLose(`"${raw}" listede yok!`);
  }
}

// Daha önce söylenen bir cevap yazıldığında: uyarı + ilgili çipi yanıp söndür
function flashDuplicate(name) {
  $('duel-found').querySelectorAll('.chip').forEach((c) => {
    if (c.textContent === name) {
      c.classList.remove('blink');
      void c.offsetWidth; // animasyonu yeniden tetikle
      c.classList.add('blink');
    }
  });
  const w = $('duel-warn');
  w.textContent = `"${name}" zaten söylendi! Başka bir cevap yaz.`;
  w.classList.remove('hidden');
  clearTimeout(flashDuplicate._t);
  flashDuplicate._t = setTimeout(() => w.classList.add('hidden'), 2600);
  $('duel-input').focus();
}

// ---------- Bilgi paneli ----------
function showFact(resultText, isWin, factText) {
  const G = window.GAME;
  stopTimer();
  $('timer-row').classList.add('hidden');
  $('duel-box').classList.add('hidden');
  $('q-spectate').classList.add('hidden');
  updateScoreboard();
  const res = $('fact-result');
  res.textContent = resultText;
  res.className = isWin ? 'win' : 'lose';
  $('fact-text').textContent = factText;
  $('fact-panel').classList.remove('hidden');

  const owns = G.ownsAdvance();
  $('btn-next').classList.toggle('hidden', !owns);
  $('next-wait').classList.toggle('hidden', owns);
}

// ---------- Bitiş ----------
function showEndScreen(allStats) {
  const G = window.GAME;
  const [s1, s2] = G.scores;
  const tie = s1 === s2;
  const winnerIdx = s1 >= s2 ? 0 : 1;

  $('end-emoji').textContent = tie ? '🤝' : '🏆';
  $('end-title').textContent = tie ? 'Berabere!' : `${G.players[winnerIdx]} kazandı!`;

  $('final-scores').innerHTML = G.players
    .map((p, i) => {
      const rec = allStats && allStats[norm(p)];
      const acc = rec && rec.t > 0 ? Math.round((rec.c / rec.t) * 100) : 0;
      const karne = Object.entries(G.stats[i])
        .map(([cat, { c, t }]) => `<span class="karne-item">${CATEGORIES[cat].icon} ${c}/${t}</span>`)
        .join('');
      const allLine = rec
        ? `Genel: %${acc} doğru · ${rec.games} oyun · ${rec.wins} galibiyet`
        : '';
      return `
      <div class="final-card ${!tie && i === winnerIdx ? 'winner' : ''}">
        <div class="fname">${p}</div>
        <div class="fscore">${G.scores[i]}</div>
        <div class="karne">${karne}</div>
        ${allLine ? `<div class="alltime">${allLine}</div>` : ''}
      </div>`;
    })
    .join('');

  showScreen('screen-end');
  if (!tie) launchConfetti();
}

function launchConfetti() {
  const layer = $('confetti-layer');
  const colors = ['#ffd166', '#ff5e7a', '#4dabff', '#2ec27e', '#b388ff', '#ff9f43'];
  for (let i = 0; i < 90; i++) {
    const c = document.createElement('div');
    c.className = 'confetti';
    c.style.left = Math.random() * 100 + 'vw';
    c.style.background = colors[Math.floor(Math.random() * colors.length)];
    c.style.animationDuration = 2.2 + Math.random() * 2.2 + 's';
    c.style.animationDelay = Math.random() * 0.8 + 's';
    c.style.transform = `rotate(${Math.random() * 360}deg)`;
    layer.appendChild(c);
  }
  setTimeout(() => { layer.innerHTML = ''; }, 6000);
}

// Düello giriş kutusu olayları (her iki modda ortak)
$('duel-submit').addEventListener('click', duelSubmit);
$('duel-input').addEventListener('keydown', (e) => { if (e.key === 'Enter') duelSubmit(); });
$('duel-pass').addEventListener('click', () => {
  const G = window.GAME;
  if (G.canDuelAct()) G.duelLose(`${G.players[G.duel.writer]} pes etti —`);
});
$('duel-joker-pass').addEventListener('click', () => {
  const G = window.GAME;
  if (G.canDuelAct()) G.useDuelPass();
});
$('btn-next').addEventListener('click', () => {
  const G = window.GAME;
  if (G.ownsAdvance()) G.next();
});
