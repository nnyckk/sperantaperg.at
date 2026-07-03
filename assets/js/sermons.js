/* Sermons section: live countdown + player/carousel populated from YouTube */
(function () {
  "use strict";

  // Are we inside a live service window right now? Reads data-service-times
  // ("9-12,18-20") and data-timezone. Services are on Sunday.
  function isLiveNow(el) {
    if (!el) return false;
    var tz = el.getAttribute("data-timezone") || "Europe/Vienna";
    var services = (el.getAttribute("data-service-times") || "9-12,18-20")
      .split(",")
      .map(function (item) {
        var p = item.trim().split("-");
        var s = parseInt(p[0], 10);
        var e = p.length > 1 ? parseInt(p[1], 10) : s + 2;
        if (isNaN(s)) return null;
        return { start: s * 3600, end: (isNaN(e) ? s + 2 : e) * 3600 };
      })
      .filter(Boolean);

    var fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    var map = {};
    fmt.formatToParts(new Date()).forEach(function (part) {
      map[part.type] = part.value;
    });
    var weekdays = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    if (weekdays[map.weekday] !== 0) return false;
    var hour = parseInt(map.hour, 10);
    if (hour === 24) hour = 0;
    var secs = hour * 3600 + parseInt(map.minute, 10) * 60 + parseInt(map.second, 10);
    for (var i = 0; i < services.length; i++) {
      if (secs >= services[i].start && secs < services[i].end) return true;
    }
    return false;
  }

  // Main player is a link to YouTube: live stream during a service,
  // otherwise the latest sermon.
  var player = document.querySelector(".sermon-player");

  function updatePlayer() {
    if (!player) return;
    var videoUrl = player.getAttribute("data-video-url");
    var liveUrl = player.getAttribute("data-live-url");
    var live = isLiveNow(player) && liveUrl;

    player.setAttribute("href", live ? liveUrl : videoUrl);
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
    if (badge) badge.classList.toggle("is-live", state.live);
    if (badgeText) badgeText.textContent = state.live ? "LIVE ACUM" : "Live începe în";

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

  if (window.fetch) {
    fetch("api/youtube.php", { headers: { Accept: "application/json" } })
      .then(function (r) {
        return r.ok ? r.json() : null;
      })
      .then(function (data) {
        if (data && data.videos) populateFromYouTube(data.videos);
      })
      .catch(function () {});
  }
})();
