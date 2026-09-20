(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var STORE_KEY = 'birthdayGuestName';
  var COLORS = ['#ff6d98', '#ffd34e', '#75c9ff', '#b99aff', '#71d9b1', '#ff9fbc'];

  var DATE_KEY = 'birthdayGuestDate';
  function store(action, value, key) {
    key = key || STORE_KEY;
    try {
      if (action === 'get') return localStorage.getItem(key);
      if (action === 'set') localStorage.setItem(key, value);
      if (action === 'del') localStorage.removeItem(key);
    } catch (e) {}
    return null;
  }
  function rand(min, max) { return Math.random() * (max - min) + min; }

  /* Confetti */
  var layer = $('confetti-layer');
  function confetti(count) {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    count = reduce ? Math.min(count || 70, 12) : (count || 70);
    for (var i = 0; i < count; i++) {
      var piece = document.createElement('span');
      piece.className = 'confetti';
      piece.style.left = rand(0, 100) + 'vw';
      piece.style.background = COLORS[Math.floor(Math.random() * COLORS.length)];
      piece.style.setProperty('--drift', rand(-120, 120) + 'px');
      piece.style.animationDuration = rand(2.2, 3.8) + 's';
      piece.style.animationDelay = rand(0, 0.6) + 's';
      piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      layer.appendChild(piece);
      (function (p) { setTimeout(function () { p.remove(); }, 5000); })(piece);
    }
  }

  /* Name + birth date form */
  var intro = $('intro-card'), card = $('birthday-card');
  var form = $('name-form'), input = $('guest-name'), dateInput = $('birth-date'), note = $('form-note');
  var nameOut = $('name-output'), dateOut = $('birthday-date-output');
  var birth = null;

  function pad2(x) { return String(x).padStart(2, '0'); }
  var today0 = new Date();
  dateInput.max = today0.getFullYear() + '-' + pad2(today0.getMonth() + 1) + '-' + pad2(today0.getDate());
  dateInput.min = '1900-01-01';

  function parseDate(str) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str || '');
    if (!m) return null;
    var y = +m[1], mo = +m[2] - 1, d = +m[3];
    var t = new Date(y, mo, d);
    if (t.getFullYear() !== y || t.getMonth() !== mo || t.getDate() !== d) return null;
    return { y: y, m: mo, d: d };
  }

  function showCard(name, b) {
    birth = b;
    nameOut.textContent = name;
    dateOut.textContent = new Date(2000, b.m, b.d).toLocaleDateString(undefined, { day: 'numeric', month: 'long' });
    intro.classList.add('is-hidden');
    card.classList.remove('is-hidden');
    window.scrollTo(0, 0);
    tick();
    confetti(90);
  }

  var savedName = store('get'), savedDate = store('get', null, DATE_KEY);
  if (savedName) input.value = savedName;
  if (savedDate && parseDate(savedDate)) dateInput.value = savedDate;
  if (savedName && savedDate) note.textContent = 'Welcome back, ' + savedName + '! Tap “Open surprise” to continue. 💖';

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = input.value.replace(/\s+/g, ' ').trim();
    if (name.length < 2) {
      note.textContent = 'Please enter your name (at least 2 letters) 💌';
      input.focus();
      return;
    }
    var b = parseDate(dateInput.value);
    if (!b || b.y < 1900) {
      note.textContent = 'Please enter your birth date 🎂';
      dateInput.focus();
      return;
    }
    if (dateInput.value > dateInput.max) {
      note.textContent = 'Your birth date can’t be in the future 🙂';
      dateInput.focus();
      return;
    }
    note.textContent = '';
    store('set', name);
    store('set', dateInput.value, DATE_KEY);
    showCard(name, b);
  });

  $('replay-button').addEventListener('click', function () {
    card.classList.add('is-hidden');
    intro.classList.remove('is-hidden');
    var n = store('get'), d = store('get', null, DATE_KEY);
    if (n) input.value = n;
    if (d && parseDate(d)) dateInput.value = d;
    note.textContent = 'Ready for another round? ✨';
    window.scrollTo(0, 0);
    input.focus();
  });

  /* Candle */
  var flame = $('cake-flame'), candle = document.querySelector('.candle');
  var blowBtn = $('blow-button'), blowMsg = $('blow-message');
  var lit = true;
  blowBtn.addEventListener('click', function () {
    lit = !lit;
    flame.classList.toggle('is-out', !lit);
    candle.classList.toggle('is-out', !lit);
    if (!lit) {
      blowBtn.textContent = 'Relight the candle 🔥';
      blowMsg.textContent = 'Whoosh! Your wish is on its way ✨';
      confetti(60);
    } else {
      blowBtn.textContent = 'Blow out the candle 🎂';
      blowMsg.textContent = 'Make a wish, then tap to blow!';
    }
  });

  /* Countdown to the next birthday */
  function tick() {
    if (!birth) return;
    var now = new Date();
    var label = document.querySelector('.countdown-label');
    var isToday = now.getMonth() === birth.m && now.getDate() === birth.d;
    var target = new Date(now.getFullYear(), birth.m, birth.d);
    if (isToday) {
      target = now;
      label.textContent = 'Today is your special day! 🎉';
    } else {
      if (now > target) target = new Date(now.getFullYear() + 1, birth.m, birth.d);
      label.textContent = 'Counting down to your special day';
    }
    var s = Math.floor(Math.max(0, target - now) / 1000);
    $('days').textContent = pad2(Math.floor(s / 86400));
    $('hours').textContent = pad2(Math.floor(s % 86400 / 3600));
    $('minutes').textContent = pad2(Math.floor(s % 3600 / 60));
    $('seconds').textContent = pad2(s % 60);
  }
  setInterval(tick, 1000);

  /* Wishes */
  var wishBtns = document.querySelectorAll('.wish-button');
  wishBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      wishBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var name = nameOut.textContent || 'friend';
      $('wish-result').textContent = name + ', ' + btn.getAttribute('data-wish');
      confetti(25);
    });
  });

  /* Panda game */
  var board = $('game-board'), scoreLabel = $('score-label'), gameBtn = $('game-button');
  var pandaScore = 0, pandaOn = false;
  function spawnPanda() {
    board.querySelectorAll('.game-panda').forEach(function (p) { p.remove(); });
    var p = document.createElement('button');
    p.type = 'button';
    p.className = 'game-panda';
    p.textContent = '🐼';
    p.setAttribute('aria-label', 'Catch the panda');
    p.style.left = rand(8, Math.max(10, board.clientWidth - 48)) + 'px';
    p.style.top = rand(8, Math.max(10, board.clientHeight - 48)) + 'px';
    p.addEventListener('click', function () {
      pandaScore++;
      scoreLabel.textContent = pandaScore + ' / 5 pandas';
      if (pandaScore >= 5) {
        pandaOn = false;
        board.innerHTML = '<span class="game-start-copy">You caught them all! 🎉🐼</span>';
        gameBtn.textContent = 'Play again';
        confetti(100);
      } else {
        spawnPanda();
      }
    });
    board.appendChild(p);
  }
  gameBtn.addEventListener('click', function () {
    pandaScore = 0; pandaOn = true;
    scoreLabel.textContent = '0 / 5 pandas';
    board.innerHTML = '';
    gameBtn.textContent = 'Restart';
    spawnPanda();
  });

  /* Cake cutting */
  var stage = $('cutting-stage'), cutBtn = $('cut-button'), cutMsg = $('cut-message');
  var cut = false, cutBusy = false;
  cutBtn.addEventListener('click', function () {
    if (cutBusy) return;
    if (!cut) {
      cutBusy = true;
      cutBtn.disabled = true;
      cutMsg.textContent = 'Slicing… 🔪';
      stage.classList.add('is-cutting');
      setTimeout(function () {
        stage.classList.add('is-cut');
        cut = true;
        cutMsg.textContent = 'The first slice is for you, ' + (nameOut.textContent || 'friend') + '! 🍰💖';
        confetti(70);
        setTimeout(function () {
          cutBusy = false;
          cutBtn.disabled = false;
          cutBtn.textContent = 'Put the cake back 🍰';
        }, 900);
      }, 2400);
    } else {
      stage.classList.remove('is-cut', 'is-cutting');
      cut = false;
      cutBtn.textContent = 'Cut the cake ✨';
      cutMsg.textContent = 'One slice of happiness coming right up!';
    }
  });

  /* Balloon game */
  var bBoard = $('balloon-board'), bScore = $('balloon-score'), bBtn = $('balloon-game-button');
  var popped = 0;
  bBtn.addEventListener('click', function () {
    popped = 0;
    bScore.textContent = '0 / 6 balloons';
    bBoard.innerHTML = '';
    bBtn.textContent = 'Restart';
    var w = bBoard.clientWidth, h = bBoard.clientHeight;
    for (var i = 0; i < 6; i++) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'game-balloon';
      b.setAttribute('aria-label', 'Pop balloon');
      b.style.background = COLORS[i % COLORS.length];
      b.style.left = (8 + i * ((w - 60) / 5) + rand(-6, 6)) + 'px';
      b.style.top = rand(6, Math.max(8, h - 100)) + 'px';
      b.style.animationDelay = (-rand(0, 1.8)) + 's';
      b.addEventListener('click', function (ev) {
        ev.currentTarget.remove();
        popped++;
        bScore.textContent = popped + ' / 6 balloons';
        if (popped >= 6) {
          bBoard.innerHTML = '<span class="game-start-copy">All popped! Party time! 🎈🎉</span>';
          bBtn.textContent = 'Play again';
          confetti(100);
        }
      });
      bBoard.appendChild(b);
    }
  });

  /* Thank-you modal */
  var modal = $('thanks-modal'), openBtn = $('thank-you-button'), lastFocus = null;

  function launchModalBalloons() {
    var box = $('modal-balloons');
    box.innerHTML = '';
    for (var i = 0; i < 14; i++) {
      var b = document.createElement('span');
      b.className = 'rise-balloon';
      b.style.left = (3 + i * 7 + rand(-2, 2)) + '%';
      b.style.background = COLORS[i % COLORS.length];
      b.style.setProperty('--w', Math.round(rand(36, 60)) + 'px');
      b.style.setProperty('--dur', rand(7, 12).toFixed(1) + 's');
      b.style.setProperty('--delay', (-rand(0, 10)).toFixed(1) + 's');
      box.appendChild(b);
    }
  }
  function openModal() {
    launchModalBalloons();
    $('hug-message').textContent = '';
    $('modal-hug-button').textContent = 'Sending you a big hug 🤗';
    lastFocus = document.activeElement;
    modal.classList.remove('is-hidden');
    modal.setAttribute('aria-hidden', 'false');
    $('modal-close').focus();
    confetti(60);
  }
  function closeModal() {
    modal.classList.add('is-hidden');
    modal.setAttribute('aria-hidden', 'true');
    if (lastFocus) lastFocus.focus();
  }
  openBtn.addEventListener('click', openModal);
  $('modal-close').addEventListener('click', closeModal);
  modal.querySelector('[data-close-modal]').addEventListener('click', closeModal);
  var HUG_EMOJIS = ['🤗', '💖', '💕', '🥰', '🧸', '💗', '💞', '✨'];
  var hugBtn = $('modal-hug-button'), hugMsg = $('hug-message'), hugTimer = null;
  hugBtn.addEventListener('click', function () {
    var mcard = modal.querySelector('.modal-card'), layer = $('hug-layer');
    var name = nameOut.textContent || 'friend';
    var r = hugBtn.getBoundingClientRect();
    for (var i = 0; i < 28; i++) {
      var e = document.createElement('span');
      e.className = 'hug-emoji';
      e.textContent = HUG_EMOJIS[Math.floor(Math.random() * HUG_EMOJIS.length)];
      e.style.left = (r.left + r.width / 2 + rand(-r.width / 2, r.width / 2)) + 'px';
      e.style.top = r.top + 'px';
      e.style.setProperty('--dx', rand(-110, 110).toFixed(0) + 'px');
      e.style.setProperty('--dy', (-rand(180, 460)).toFixed(0) + 'px');
      e.style.setProperty('--rot', rand(-45, 45).toFixed(0) + 'deg');
      e.style.setProperty('--s', rand(1.5, 2.8).toFixed(2) + 'rem');
      e.style.setProperty('--dur', rand(1.6, 2.8).toFixed(1) + 's');
      e.style.setProperty('--delay', rand(0, 0.5).toFixed(2) + 's');
      layer.appendChild(e);
      (function (el) { setTimeout(function () { el.remove(); }, 3600); })(e);
    }
    mcard.classList.remove('is-hugging');
    void mcard.offsetWidth;
    mcard.classList.add('is-hugging');
    if (mcard.animate) {
      mcard.animate([
        { transform: 'scale(1)' }, { transform: 'scale(.93, 1.03)', offset: .3 },
        { transform: 'scale(1.05)', offset: .6 }, { transform: 'scale(1)' }
      ], { duration: 900, easing: 'ease-in-out' });
    }
    try { if (navigator.vibrate) navigator.vibrate([40, 30, 40]); } catch (err) {}
    hugMsg.textContent = 'Hugging you tight, ' + name + '! 🤗💗';
    hugBtn.textContent = 'Hug sent! 🤗💖';
    clearTimeout(hugTimer);
    hugTimer = setTimeout(function () {
      mcard.classList.remove('is-hugging');
      hugBtn.textContent = 'Send another hug 🤗';
    }, 1600);
    confetti(40);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.classList.contains('is-hidden')) closeModal();
  });
})();

