/* Sermons section: live countdown + player/carousel populated from YouTube */
(function () {
  "use strict";

  // Main player is a link to YouTube: the live broadcast while one is running
  // (reported by the API), otherwise the latest sermon.
  var player = document.querySelector(".sermon-player");

  // Set to true once the YouTube API reports an active live broadcast.
  // Overrides the schedule-based guess so the tag reflects reality.
  var apiLiveNow = false;

  function updatePlayer() {
    if (!player) return;
    var videoUrl = player.getAttribute("data-video-url");
    // The tag reflects the real YouTube signal only. When a broadcast is live,
    // its url is already in data-video-url (it's the first video), so the
    // player links straight to it.
    var live = apiLiveNow;

    player.setAttribute("href", videoUrl);
    var tag = player.querySelector(".sermon-latest-tag");
    if (tag) {
      tag.textContent = live ? "LIVE ACUM" : "Ultimul mesaj";
      tag.classList.toggle("is-live", live);
    }
    player.setAttribute(
      "aria-label",
      live ? "Urmărește transmisiunea live pe YouTube" : "Urmărește ultimul mesaj pe YouTube"
    );
  }
  updatePlayer();

  // Carousel navigation (scrollbar hidden in CSS)
  var track = document.querySelector(".recent-sermons-track");
  var prevBtn = document.querySelector(".carousel-prev");
  var nextBtn = document.querySelector(".carousel-next");

  if (track && prevBtn && nextBtn) {
    function stepSize() {
      var card = track.querySelector(".sermon-card");
      if (!card) return track.clientWidth;
      var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 16;
      return card.getBoundingClientRect().width + gap;
    }

    function maxScroll() {
      return track.scrollWidth - track.clientWidth;
    }

    // Wrap around at the ends
    nextBtn.addEventListener("click", function () {
      if (track.scrollLeft >= maxScroll() - 1) {
        track.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        track.scrollBy({ left: stepSize(), behavior: "smooth" });
      }
    });
    prevBtn.addEventListener("click", function () {
      if (track.scrollLeft <= 1) {
        track.scrollTo({ left: maxScroll(), behavior: "smooth" });
      } else {
        track.scrollBy({ left: -stepSize(), behavior: "smooth" });
      }
    });
  }

  // Live countdown. Services run Sunday at data-service-times in data-timezone.
  // Works in the church timezone (wall clock), regardless of visitor's timezone.
  var el = document.querySelector(".live-countdown");
  if (!el) return;

  var TZ = el.getAttribute("data-timezone") || "Europe/Vienna";
  var SERVICE_DURATION_MIN = 90; // default duration when only a start hour is given

  // Services as {start, end} in seconds from midnight.
  // Format: "9-12,18-20" (start-end) or "9,18" (start, +90 min).
  var SERVICES = (el.getAttribute("data-service-times") || "9-12,18-20")
    .split(",")
    .map(function (item) {
      var parts = item.trim().split("-");
      var start = parseInt(parts[0], 10);
      var end = parts.length > 1 ? parseInt(parts[1], 10) : null;
      if (isNaN(start)) return null;
      return {
        start: start * 3600,
        end: (end != null && !isNaN(end) ? end * 3600 : start * 3600 + SERVICE_DURATION_MIN * 60),
      };
    })
    .filter(function (s) {
      return s !== null;
    })
    .sort(function (a, b) {
      return a.start - b.start;
    });

  var badge = el.querySelector(".live-badge");
  var badgeText = el.querySelector(".live-text");
  var elDays = el.querySelector(".cd-days");
  var elHours = el.querySelector(".cd-hours");
  var elMins = el.querySelector(".cd-mins");
  var elSecs = el.querySelector(".cd-secs");

  // Wall-clock parts of `date` in timezone TZ
  function partsInTz(date) {
    var fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: TZ,
      weekday: "short",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    var map = {};
    fmt.formatToParts(date).forEach(function (p) {
      map[p.type] = p.value;
    });
    var weekdays = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    var hour = parseInt(map.hour, 10);
    if (hour === 24) hour = 0;
    return {
      year: parseInt(map.year, 10),
      month: parseInt(map.month, 10),
      day: parseInt(map.day, 10),
      hour: hour,
      minute: parseInt(map.minute, 10),
      second: parseInt(map.second, 10),
      weekday: weekdays[map.weekday],
    };
  }

  // Seconds until next service, and whether we're live now
  function computeState() {
    var now = new Date();
    var p = partsInTz(now);
    var secsToday = p.hour * 3600 + p.minute * 60 + p.second;

    if (p.weekday === 0) {
      for (var i = 0; i < SERVICES.length; i++) {
        if (secsToday >= SERVICES[i].start && secsToday < SERVICES[i].end) {
          return { live: true };
        }
      }
      for (var j = 0; j < SERVICES.length; j++) {
        if (secsToday < SERVICES[j].start) {
          return { live: false, seconds: SERVICES[j].start - secsToday };
        }
      }
    }

    var daysUntilSunday = (7 - p.weekday) % 7;
    if (daysUntilSunday === 0) daysUntilSunday = 7;
    var firstService = SERVICES[0].start;
    var seconds = daysUntilSunday * 86400 - secsToday + firstService;
    return { live: false, seconds: seconds };
  }

  function pad(n) {
    return n < 10 ? "0" + n : "" + n;
  }

  function render() {
    var state = computeState();
    // The badge goes red only when YouTube confirms a live (same signal as
    // the player tag), not merely because the service window opened.
    var live = state.live && apiLiveNow;
    if (badge) badge.classList.toggle("is-live", live);
    if (badgeText) badgeText.textContent = live ? "LIVE ACUM" : "Live începe în";

    if (state.live) {
      if (elDays) elDays.textContent = "00";
      if (elHours) elHours.textContent = "00";
      if (elMins) elMins.textContent = "00";
      if (elSecs) elSecs.textContent = "00";
      return;
    }

    var s = state.seconds;
    var days = Math.floor(s / 86400);
    s -= days * 86400;
    var hours = Math.floor(s / 3600);
    s -= hours * 3600;
    var mins = Math.floor(s / 60);
    var secs = s - mins * 60;

    if (elDays) elDays.textContent = pad(days);
    if (elHours) elHours.textContent = pad(hours);
    if (elMins) elMins.textContent = pad(mins);
    if (elSecs) elSecs.textContent = pad(secs);
  }

  render();
  setInterval(render, 1000);

  // Populate from YouTube via api/youtube.php. On success, the main player
  // becomes the latest sermon and the carousel the rest. On failure, the
  // HTML placeholders remain.
  var LUNI = [
    "ianuarie", "februarie", "martie", "aprilie", "mai", "iunie",
    "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie",
  ];
  function formatDateRo(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.getDate() + " " + LUNI[d.getMonth()] + " " + d.getFullYear();
  }

  // Strip the trailing "| Speranța Perg" suffix from titles
  function cleanTitle(t) {
    return (t || "").replace(/\s*\|\s*Speran[țt]a\s+Perg\s*$/i, "").trim();
  }

  function populateFromYouTube(videos) {
    if (!videos || !videos.length) return;

    // First video carries live:true when a broadcast is running right now.
    // Trust it only while the local service window is open: right after the
    // window closes the server cache can still say live for up to a minute,
    // and it must not re-arm the LIVE tag on the player.
    apiLiveNow = !!videos[0].live && computeState().live;

    if (player) {
      var latest = videos[0];
      player.setAttribute("data-video-url", latest.url);
      var img = player.querySelector(".sermon-player-poster img");
      if (img && (latest.thumbnail_hi || latest.thumbnail)) {
        // Prefer the high-res thumbnail; fall back if maxres is missing (404)
        if (latest.thumbnail_hi && latest.thumbnail) {
          img.onerror = function () {
            img.onerror = null;
            img.src = latest.thumbnail;
          };
        }
        img.src = latest.thumbnail_hi || latest.thumbnail;
        img.alt = cleanTitle(latest.title) || "Ultimul mesaj";
      }
      updatePlayer();
    }

    var cards = document.querySelectorAll(".sermon-card");
    var rest = videos.slice(1);
    cards.forEach(function (card, i) {
      var v = rest[i];
      if (!v) {
        card.hidden = true;
        return;
      }
      card.hidden = false;
      card.setAttribute("href", v.url);
      var img = card.querySelector(".sermon-card-thumb img");
      if (img && v.thumbnail) {
        img.src = v.thumbnail;
        img.alt = cleanTitle(v.title) || "";
      }
      var title = card.querySelector(".sermon-card-title");
      if (title) title.textContent = cleanTitle(v.title) || "";
      var date = card.querySelector(".sermon-card-date");
      if (date) date.textContent = formatDateRo(v.date);
    });
  }

  // Fetch the sermon list from the proxy. Returns a promise resolving to
  // true when a live broadcast is currently running, false otherwise.
  function loadYouTube() {
    if (!window.fetch) return Promise.resolve(false);
    return fetch("api/youtube.php", { headers: { Accept: "application/json" } })
      .then(function (r) {
        return r.ok ? r.json() : null;
      })
      .then(function (data) {
        if (data && data.videos) populateFromYouTube(data.videos);
        return !!(data && data.live);
      })
      .catch(function () {
        return false;
      });
  }

  var POLL_INTERVAL = 90 * 1000; // 90s
  var livePollTimer = null;

  // Initial load: populate the player and carousel with the latest sermons.
  // If the page opens while a service window is already open but no live was
  // found yet, begin polling so we still catch a broadcast that starts late.
  loadYouTube().then(function (live) {
    if (!live && computeState().live) startLivePolling();
  });

  // Live polling driven by the countdown. We only ask YouTube "is there a
  // live now?" once a service window opens (countdown hits zero), then keep
  // asking every POLL_INTERVAL until a live is found or the window closes.
  // Between services we make no requests at all.
  function startLivePolling() {
    if (livePollTimer !== null) return; // already polling
    livePollTimer = setInterval(function () {
      // Window closed (service ended) -> stop asking, drop the live state.
      if (!computeState().live) {
        stopLivePolling();
        apiLiveNow = false;
        loadYouTube(); // refresh once so the player leaves live mode
        return;
      }
      loadYouTube().then(function (live) {
        // Live found: keep it on screen, no need to keep hammering.
        if (live) stopLivePolling();
      });
    }, POLL_INTERVAL);
  }

  function stopLivePolling() {
    if (livePollTimer !== null) {
      clearInterval(livePollTimer);
      livePollTimer = null;
    }
  }

  // Watch for service-window edges once a second. When a window opens
  // (countdown reaches zero) we ask YouTube right away and start polling;
  // when it closes we stop and leave live mode. Between services: no requests.
  var wasInWindow = computeState().live;
  setInterval(function () {
    var inWindow = computeState().live;
    if (inWindow && !wasInWindow) {
      loadYouTube().then(function (live) {
        if (!live) startLivePolling();
      });
    } else if (!inWindow && wasInWindow) {
      stopLivePolling();
      apiLiveNow = false;
      loadYouTube();
    }
    wasInWindow = inWindow;
  }, 1000);
})();
