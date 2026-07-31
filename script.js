(function () {
  "use strict";

  var NOTE_MESSAGES = [
    "You make ordinary days feel special.",
    "Your smile is my favorite view.",
    "I'm lucky I get to call you mine.",
    "You always know how to make me laugh.",
    "I still get excited every time I see your name.",
    "Thank you for existing.",
    "You're prettier than every sunset I've ever seen.",
    "Home feels like wherever you are.",
    "I hope today makes you smile.",
    "Never forget how amazing you are.",
    "I love every little thing about you.",
    "Happy Girlfriend Day ❤️",
    "Your laugh is my favorite sound in the world.",
    "I fall for you a little more every day.",
    "You're the best part of my everyday.",
    "Even on hard days, thinking of you helps.",
    "You make my heart feel so full.",
    "I love how you see the world.",
    "Being with you feels like coming home.",
    "You're my favorite person to talk to about nothing.",
    "I still remember the first time you made me smile.",
    "You're the calm in every storm.",
    "You're the best person I've ever met.",
    "I love the way you say my name.",
    "You're kind in a way that inspires me.",
    "I could listen to you talk for hours.",
    "You make the little moments feel big.",
    "I'm so proud of who you are.",
    "You have the softest heart I know.",
    "Every love song makes more sense because of you.",
    "I love your weird little habits too.",
    "You're my favorite hello and hardest goodbye.",
    "I hope I make you as happy as you make me.",
    "You're my person, today and always.",
    "Thank you for choosing me, every day.",
    "I love you more than words fit in this tiny note.",
  ];

  var TOTAL = NOTE_MESSAGES.length;
  var openedCount = 0;
  var notesData = [];
  var currentFlyer = null;

  var jarWrapper = document.getElementById("jarWrapper");
  var notesContainer = document.getElementById("notesContainer");
  var openedNumEl = document.getElementById("openedNum");
  var progressCountEl = document.getElementById("progressCount");
  var finalLetterBtn = document.getElementById("finalLetterBtn");
  var letterOverlay = document.getElementById("letterOverlay");
  var letterClose = document.getElementById("letterClose");
  var noteBackdrop = document.getElementById("noteBackdrop");
  var openJarBtn = document.getElementById("openJarBtn");
  var jarSection = document.getElementById("jarSection");
  var soundBtn = document.getElementById("soundBtn");
  var heroDecor = document.getElementById("heroDecor");
  var starDecor = document.getElementById("starDecor");

  if (document.getElementById("totalNum")) {
    document.getElementById("totalNum").textContent = TOTAL;
  }

  /* ---------------- utilities ---------------- */
  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  function randRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  /* ---------------- hero floating decor ---------------- */
  function buildHeroDecor() {
    if (!heroDecor) return;
    var glyphs = ["❤", "❤", "✨", "❤", "♡", "✨"];
    var count = 16;
    for (var i = 0; i < count; i++) {
      var el = document.createElement("span");
      var isSparkle = glyphs[i % glyphs.length] === "✨";
      el.className = "drift" + (isSparkle ? " sparkle" : "");
      el.textContent = glyphs[i % glyphs.length];
      el.style.left = randRange(2, 96) + "%";
      el.style.setProperty("--drift-x", randRange(-40, 40) + "px");
      el.style.animationDuration = randRange(9, 17) + "s";
      el.style.animationDelay = randRange(0, 14) + "s";
      el.style.fontSize = randRange(0.8, 1.6) + "rem";
      heroDecor.appendChild(el);
    }
  }

  function buildStars() {
    if (!starDecor) return;
    for (var i = 0; i < 22; i++) {
      var s = document.createElement("span");
      s.className = "star-dot";
      s.style.left = randRange(4, 96) + "%";
      s.style.top = randRange(4, 96) + "%";
      s.style.animationDelay = randRange(0, 2.4) + "s";
      starDecor.appendChild(s);
    }
  }

  /* ---------------- build notes ---------------- */
  function randomNotePosition() {
    return {
      left: randRange(12, 84),
      top: randRange(12, 84),
      rot: randRange(-22, 22),
    };
  }

  function buildNotes() {
    if (!notesContainer) return;
    var order = shuffle(NOTE_MESSAGES.slice());
    var cols = 6,
      rows = Math.ceil(TOTAL / cols);
    var cellW = 100 / cols,
      cellH = 100 / rows;

    for (var i = 0; i < TOTAL; i++) {
      var col = i % cols,
        row = Math.floor(i / cols);
      var jitterX = randRange(-cellW * 0.32, cellW * 0.32);
      var jitterY = randRange(-cellH * 0.32, cellH * 0.32);
      var left = col * cellW + cellW / 2 + jitterX;
      var top = row * cellH + cellH / 2 + jitterY;
      var rot = randRange(-22, 22);

      var data = { id: i, message: order[i], opened: false };
      notesData.push(data);

      var el = document.createElement("div");
      el.className = "note";
      el.tabIndex = 0;
      el.setAttribute("role", "button");
      el.setAttribute("aria-label", "Open a love note");
      el.style.left = left + "%";
      el.style.top = top + "%";
      el.style.transform = "rotate(" + rot + "deg)";
      el.dataset.id = i;
      el.dataset.rot = rot;

      el.addEventListener("click", onNoteActivate);
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onNoteActivate.call(this, e);
        }
      });

      notesContainer.appendChild(el);
    }
  }

  function onNoteActivate(e) {
    e.stopPropagation();
    if (this.dataset.opening) return;
    openNote(this);
  }

  /* ---------------- shake / hearts-burst ---------------- */
  if (jarWrapper) {
    jarWrapper.addEventListener("click", function (e) {
      if (e.target === jarWrapper || e.target === notesContainer) {
        shakeJar();
      }
    });
    jarWrapper.addEventListener("dblclick", function (e) {
      if (e.target === jarWrapper || e.target === notesContainer) {
        burstHearts();
      }
    });
  }

  function shakeJar() {
    if (!jarWrapper) return;
    jarWrapper.classList.remove("shaking");
    void jarWrapper.offsetWidth;
    jarWrapper.classList.add("shaking");

    var els = notesContainer.querySelectorAll(".note");
    els.forEach(function (el) {
      var pos = randomNotePosition();
      el.style.left = pos.left + "%";
      el.style.top = pos.top + "%";
      el.style.transform = "rotate(" + pos.rot + "deg)";
      el.dataset.rot = pos.rot;
    });
  }

  function burstHearts() {
    if (!jarWrapper) return;
    var rect = jarWrapper.getBoundingClientRect();
    spawnHearts(rect.left + rect.width / 2, rect.top + rect.height * 0.55, 14);
  }

  /* ---------------- open / unfold note ---------------- */
  function openNote(noteEl) {
    noteEl.dataset.opening = "1";
    var id = parseInt(noteEl.dataset.id, 10);
    var rect = noteEl.getBoundingClientRect();
    var rot = parseFloat(noteEl.dataset.rot || "0");

    var cardW = Math.min(320, window.innerWidth * 0.86);
    var cardH = 190;
    var startScale = Math.max(rect.width, 16) / cardW;
    var startX = rect.left + rect.width / 2 - cardW / 2;
    var startY = rect.top + rect.height / 2 - cardH / 2;

    var flyer = document.createElement("div");
    flyer.className = "flying-note";
    flyer.style.width = cardW + "px";
    flyer.style.height = cardH + "px";
    flyer.style.transform =
      "translate(" +
      startX +
      "px," +
      startY +
      "px) scale(" +
      startScale +
      ") rotate(" +
      rot +
      "deg)";
    document.body.appendChild(flyer);
    currentFlyer = flyer;

    showBackdrop();
    noteEl.style.opacity = "0";
    noteEl.style.pointerEvents = "none";

    spawnHearts(rect.left + rect.width / 2, rect.top + rect.height / 2, 6);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        var targetX = window.innerWidth / 2 - cardW / 2;
        var targetY = window.innerHeight / 2 - cardH / 2;
        flyer.style.transform =
          "translate(" +
          targetX +
          "px," +
          targetY +
          "px) scale(1) rotate(0deg)";
      });
    });

    setTimeout(function () {
      var msg = document.createElement("p");
      msg.className = "note-message";
      msg.textContent = notesData[id].message;
      var hint = document.createElement("span");
      hint.className = "note-hint";
      hint.textContent = "tap to close";
      flyer.appendChild(msg);
      flyer.appendChild(hint);
      spawnSparkles(flyer);
    }, 680);

    flyer.addEventListener("click", function () {
      closeFlyer(flyer);
    });

    setTimeout(function () {
      noteEl.remove();
    }, 720);

    notesData[id].opened = true;
    openedCount++;
    updateCounter();

    if (openedCount >= TOTAL) {
      setTimeout(unlockFinalLetter, 900);
    }
  }

  function closeFlyer(flyer) {
    if (!flyer || flyer.dataset.closing) return;
    flyer.dataset.closing = "1";
    flyer.classList.add("closing");
    hideBackdrop();
    currentFlyer = null;
    setTimeout(function () {
      flyer.remove();
    }, 320);
  }

  if (noteBackdrop) {
    noteBackdrop.addEventListener("click", function () {
      if (currentFlyer) {
        closeFlyer(currentFlyer);
      }
    });
  }

  function showBackdrop() {
    if (noteBackdrop) noteBackdrop.classList.add("visible");
  }
  function hideBackdrop() {
    if (noteBackdrop) noteBackdrop.classList.remove("visible");
  }

  /* ---------------- floating hearts + sparkles ---------------- */
  function spawnHearts(x, y, count) {
    count = count || 6;
    for (var i = 0; i < count; i++) {
      (function () {
        var h = document.createElement("span");
        h.className = "floating-heart";
        h.textContent = "❤";
        h.style.left = x + randRange(-24, 24) + "px";
        h.style.top = y + "px";
        h.style.setProperty("--dx", randRange(-50, 50) + "px");
        h.style.animationDelay = randRange(0, 0.25) + "s";
        h.style.fontSize = randRange(0.9, 1.5) + "rem";
        document.body.appendChild(h);
        h.addEventListener("animationend", function () {
          h.remove();
        });
      })();
    }
  }

  function spawnSparkles(container) {
    container.style.position = "fixed";
    for (var i = 0; i < 5; i++) {
      (function () {
        var s = document.createElement("span");
        s.className = "sparkle-bit";
        s.textContent = "✨";
        s.style.left = randRange(4, 90) + "%";
        s.style.top = randRange(4, 85) + "%";
        s.style.animationDelay = randRange(0, 0.4) + "s";
        container.appendChild(s);
        s.addEventListener("animationend", function () {
          s.remove();
        });
      })();
    }
  }

  /* ---------------- progress ---------------- */
  function updateCounter() {
    if (openedNumEl) openedNumEl.textContent = openedCount;
    if (progressCountEl) {
      progressCountEl.classList.remove("pop");
      void progressCountEl.offsetWidth;
      progressCountEl.classList.add("pop");
    }
  }

  /* ---------------- completion / final letter ---------------- */
  function unlockFinalLetter() {
    if (jarWrapper) jarWrapper.classList.add("jar-complete");
    if (finalLetterBtn) {
      finalLetterBtn.classList.remove("hidden");
      requestAnimationFrame(function () {
        finalLetterBtn.classList.add("show");
      });
    }
  }

  if (finalLetterBtn && letterOverlay) {
    finalLetterBtn.addEventListener("click", function () {
      letterOverlay.classList.add("visible");
    });
  }
  if (letterClose && letterOverlay) {
    letterClose.addEventListener("click", function () {
      letterOverlay.classList.remove("visible");
    });
  }

  /* ---------------- scroll from hero ---------------- */
  if (openJarBtn && jarSection) {
    openJarBtn.addEventListener("click", function () {
      jarSection.scrollIntoView({ behavior: "smooth" });
    });
  }

  /* ---------------- AUDIO HANDLER ---------------- */
  var bgMusic = document.getElementById("bgMusic");
  var musicOn = false;

  function playAudio() {
    if (!bgMusic) return;
    bgMusic.volume = 0.4;

    bgMusic
      .play()
      .then(function () {
        musicOn = true;
        updateSoundBtn();
      })
      .catch(function (err) {
        console.log(
          "Audio play blocked by browser. Waiting for interaction...",
          err,
        );
      });
  }

  function updateSoundBtn() {
    if (!soundBtn) return;
    soundBtn.textContent = musicOn ? "♫" : "♪";
    soundBtn.classList.toggle("playing", musicOn);
    soundBtn.setAttribute("aria-label", musicOn ? "Pause music" : "Play music");
  }

  // First click/tap anywhere on the page starts audio
  function enableAudioGlobal() {
    if (!musicOn) {
      playAudio();
    }
    window.removeEventListener("click", enableAudioGlobal);
    window.removeEventListener("touchstart", enableAudioGlobal);
  }

  window.addEventListener("click", enableAudioGlobal);
  window.addEventListener("touchstart", enableAudioGlobal);

  // Sound Toggle Button (Manual Play / Pause)
  if (soundBtn) {
    soundBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (!bgMusic) return;

      if (musicOn) {
        bgMusic.pause();
        musicOn = false;
      } else {
        playAudio();
      }
      updateSoundBtn();
    });
  }

  /* ---------------- INIT ---------------- */
  buildHeroDecor();
  buildStars();
  buildNotes();
  playAudio();
})();
