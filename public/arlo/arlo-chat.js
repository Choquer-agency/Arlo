/* ============================================================
   Arlo arlo-cstudy chat (vanilla port of Futur Labs AgentChatHero).
   A looping Claude conversation: the user's question types out and
   sends, Claude "thinks", queries the data source, then streams an
   answer. Injected into .arlo-xcase, replacing the old arlo-cstudy videos. Loaded on /arlo.
   ============================================================ */
(function () {
  if (window.__arloChatInit) return;
  window.__arloChatInit = true;

  var BASE = "/arlo/";
  var CLAUDE_WORDMARK = BASE + "ui/claude-logo.svg";

  /* ---- Claude sunburst mark (currentColor; pulses green when live) ---- */
  function claudeBurst() {
    var rays = 11, s = "";
    for (var i = 0; i < rays; i++) {
      var a = (i / rays) * Math.PI * 2 - Math.PI / 2;
      var r1 = 15, r2 = 31;
      s += '<line x1="' + (50 + Math.cos(a) * r1).toFixed(1) + '" y1="' + (50 + Math.sin(a) * r1).toFixed(1) +
        '" x2="' + (50 + Math.cos(a) * r2).toFixed(1) + '" y2="' + (50 + Math.sin(a) * r2).toFixed(1) + '"/>';
    }
    return '<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round">' + s + "</svg>";
  }

  /* ---- data-source mini logos ---- */
  var LOGOS = {
    ga4: '<svg class="alh-logo" viewBox="0 0 24 24"><rect width="24" height="24" rx="5" fill="#F9AB00"/><rect x="5.6" y="12.5" width="3.4" height="6" rx="1.7" fill="#fff"/><rect x="10.3" y="8.5" width="3.4" height="10" rx="1.7" fill="#E37400"/><rect x="15" y="5.5" width="3.4" height="13" rx="1.7" fill="#fff"/></svg>',
    gsc: '<svg class="alh-logo" viewBox="0 0 24 24"><rect width="24" height="24" rx="5" fill="#8AB4F8"/><circle cx="10.7" cy="10.7" r="4" fill="none" stroke="#fff" stroke-width="2"/><line x1="13.8" y1="13.8" x2="17.6" y2="17.6" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>',
    ads: '<svg class="alh-logo" viewBox="0 0 24 24"><rect width="24" height="24" rx="5" fill="#fff"/><rect x="7.4" y="4" width="4.6" height="14" rx="2.3" transform="rotate(-30 9.7 11)" fill="#FBBC04"/><rect x="12" y="4" width="4.6" height="14" rx="2.3" transform="rotate(30 14.3 11)" fill="#4285F4"/><circle cx="8.4" cy="17.6" r="2.3" fill="#34A853"/></svg>',
    meta: '<svg class="alh-logo" viewBox="0 0 24 24"><rect width="24" height="24" rx="5" fill="#0866FF"/><path d="M6 15.5c0-3.6 1.6-6.5 3.9-6.5 1.3 0 2.2.9 3.1 2.4.9-1.5 1.8-2.4 3.1-2.4 2.3 0 3.9 2.9 3.9 6.5" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>'
  };

  /* ---- "Connected to" flipper items ---- */
  function connItem(logo, name) {
    return LOGOS[logo].replace('class="alh-logo"', 'style="height:14px;width:auto"') + '<span class="alh-conn-name">' + name + "</span>";
  }
  var CONN = [connItem("ga4", "GA4"), connItem("gsc", "Search Console"), connItem("ads", "Google Ads"), connItem("meta", "Meta Ads")];

  /* ---- the conversation ---- */
  var EXCHANGES = [
    {
      client: "Power Smile Dental",
      q: "How did organic traffic do last week?",
      tools: [{ icon: "ga4", label: "Querying GA4 sessions" }, { icon: "gsc", label: "Reading Search Console" }],
      a: "Up 18% — 1,240 to 1,462 sessions. Search Console shows the lift came from three blog posts breaking onto page 1 for ‘emergency dentist’ searches."
    },
    {
      client: "Northline Hotels",
      q: "Which Google Ads campaign is wasting spend?",
      tools: [{ icon: "ads", label: "Pulling Google Ads spend" }],
      a: "‘Brand — Broad’ at $88 per conversion vs your $31 account average — 22% of spend for 6% of conversions. Want me to draft a pause and reallocation?"
    },
    {
      client: "Bayfield Family Dental",
      q: "Did our rankings move this month?",
      tools: [{ icon: "gsc", label: "Comparing Search Console positions" }],
      a: "14 keywords up, 3 down. Biggest win: ‘dentist downtown’ #8 to #3. ‘teeth whitening cost’ slipped #4 to #7 after a competitor refreshed their page."
    },
    {
      client: "Aria Pools",
      q: "What's our best converting landing page?",
      tools: [{ icon: "ga4", label: "Querying GA4 conversions" }],
      a: "/free-quote at 9.2% — three times your site average — but it's only getting 5% of traffic. Worth pushing more ad budget there."
    }
  ];

  var PACE = { typeChar: 34, beforeSend: 380, thinkDots: 850, toolRun: 720, toolGap: 170, streamWord: 46, read: 3000, betweenLoops: 800 };

  var ACTIONS =
    '<div class="alh-actions">' +
    '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>' +
    '<svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-2.6-6.4"/><path d="M21 3v6h-6"/></svg>' +
    '<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>' +
    "</div>";

  // [opacity, blur(px)=0 — no blur, keep a gentle recede via opacity+scale, scale]
  var DEPTH = [[1, 0, 1], [0.85, 0, 0.99], [0.62, 0, 0.975], [0.42, 0, 0.96], [0.26, 0, 0.945], [0.12, 0, 0.93]];

  /* ---- panel markup ---- */
  function panelHTML() {
    return '' +
      '<div class="alh">' +
      '<div class="alh-glow"><span></span><span></span><span></span></div>' +
      '<div class="alh-panel">' +
      '<div class="alh-thread" id="alhThread"></div>' +
      '<div class="alh-topfade"></div>' +
      '<div class="alh-titlebadge" id="alhTitle">' +
      '<img class="alh-claudemark" src="' + CLAUDE_WORDMARK + '" alt="Claude"/>' +
      '<div class="alh-conn"><span class="alh-conn-label">Connected to</span>' +
      '<span class="alh-conn-flip"><span class="alh-conn-item" id="alhConnItem"></span></span></div>' +
      "</div>" +
      '<div class="alh-inputwrap"><div class="alh-inputbar">' +
      '<div class="alh-input" id="alhInput"><span class="alh-ph">Ask Claude about your data</span></div>' +
      '<div class="alh-send" id="alhSend"><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg></div>' +
      "</div></div>" +
      "</div></div>";
  }

  /* ---- animation ---- */
  function runChat(root) {
    var thread = root.querySelector("#alhThread");
    var input = root.querySelector("#alhInput");
    var send = root.querySelector("#alhSend");
    var connItemEl = root.querySelector("#alhConnItem");
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
    var scrollDown = function () { thread.scrollTop = thread.scrollHeight; };
    var clock = function () { var d = new Date(); return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2); };

    function applyDepth() {
      var rows = thread.querySelectorAll(".alh-row"), n = rows.length;
      for (var i = 0; i < n; i++) {
        var d = DEPTH[Math.min(n - 1 - i, DEPTH.length - 1)];
        rows[i].style.opacity = d[0];
        rows[i].style.filter = d[1] ? "blur(" + d[1] + "px)" : "none";
        rows[i].style.transform = "scale(" + d[2] + ")";
      }
      while (thread.children.length > DEPTH.length + 2) thread.removeChild(thread.firstChild);
    }

    function initials(name) {
      return name.split(/\s+/).slice(0, 2).map(function (w) { return w[0]; }).join("").toUpperCase();
    }
    function userRow(ex, text) {
      var row = document.createElement("div");
      row.className = "alh-row alh-user";
      row.innerHTML = '<div class="alh-client">' + ex.client + "</div>" +
        '<div class="alh-userline">' +
        '<div class="alh-bubble">' + text + '<span class="alh-time">' + clock() + "</span></div>" +
        '<div class="alh-avatar">' + initials(ex.client) + "</div>" +
        "</div>";
      thread.appendChild(row); applyDepth(); scrollDown(); return row;
    }
    function agentRow() {
      var row = document.createElement("div"); row.className = "alh-row alh-agent";
      var meta = document.createElement("div"); meta.className = "alh-agentmeta";
      var orb = document.createElement("span"); orb.className = "alh-orb"; orb.innerHTML = claudeBurst();
      meta.appendChild(orb);
      meta.insertAdjacentHTML("beforeend", '<span class="alh-an">Claude</span><span class="alh-sep">|</span><span class="alh-as">Connected to your data</span>');
      var body = document.createElement("div"); body.className = "alh-body"; body.style.width = "100%";
      row.appendChild(meta); row.appendChild(body);
      thread.appendChild(row); applyDepth(); scrollDown();
      return { row: row, body: body, orb: orb };
    }
    function statline(icon, label, spinning) {
      var el = document.createElement("div"); el.className = "alh-statline";
      var iconHtml = icon === "think" ? '<span class="alh-sparkle">✦</span>' : (LOGOS[icon] || "");
      el.innerHTML = iconHtml + "<span>" + label + "</span>" + (spinning ? '<span class="alh-spin"></span>' : "");
      return el;
    }
    function greet() { var ar = agentRow(); ar.body.innerHTML = '<div class="alh-answer">Hi — ask me anything about your marketing data.</div>'; }

    /* connected-to flipper */
    var connIdx = 0; connItemEl.innerHTML = CONN[0];
    if (!reduced) {
      setInterval(function () {
        connItemEl.style.transform = "translateY(-115%)"; connItemEl.style.opacity = "0";
        setTimeout(function () {
          connIdx = (connIdx + 1) % CONN.length; connItemEl.innerHTML = CONN[connIdx];
          connItemEl.style.transition = "none"; connItemEl.style.transform = "translateY(115%)";
          void connItemEl.offsetWidth; connItemEl.style.transition = ""; connItemEl.style.transform = "translateY(0)"; connItemEl.style.opacity = "1";
        }, 330);
      }, 2000);
    }

    if (reduced) {
      greet();
      EXCHANGES.slice(0, 2).forEach(function (ex) {
        userRow(ex, ex.q); var ar = agentRow();
        var sl = document.createElement("div"); sl.className = "alh-statlines";
        ex.tools.forEach(function (tl) { var line = statline(tl.icon, tl.label, false); line.classList.add("alh-done"); sl.appendChild(line); });
        var ans = document.createElement("div"); ans.className = "alh-answer"; ans.textContent = ex.a;
        ar.body.appendChild(sl); ar.body.appendChild(ans);
      });
      applyDepth(); scrollDown(); return;
    }

    function typeIntoInput(text) {
      return new Promise(function (resolve) {
        var i = 0; input.innerHTML = "";
        (function step() {
          input.innerHTML = text.slice(0, i + 1) + '<span class="alh-caret"></span>';
          if (i === 2) send.classList.add("alh-armed");
          i++;
          if (i < text.length) setTimeout(step, PACE.typeChar + (Math.random() * 22 - 8));
          else setTimeout(function () {
            send.classList.add("alh-fire");
            setTimeout(function () {
              send.classList.remove("alh-fire"); send.classList.remove("alh-armed");
              input.innerHTML = '<span class="alh-ph">Ask Claude about your data</span>'; resolve();
            }, 150);
          }, PACE.beforeSend);
        })();
      });
    }
    function streamAnswer(el, text) {
      return new Promise(function (resolve) {
        var words = text.split(" "), i = 0, acc = "";
        (function step() {
          acc += (i ? " " : "") + words[i]; el.innerHTML = acc + '<span class="alh-caret"></span>'; scrollDown(); i++;
          if (i < words.length) setTimeout(step, PACE.streamWord + Math.random() * 30);
          else { el.innerHTML = acc; resolve(); }
        })();
      });
    }
    async function runExchange(ex) {
      await typeIntoInput(ex.q);
      userRow(ex, ex.q);
      var ar = agentRow(); ar.orb.classList.add("alh-live");
      var sl = document.createElement("div"); sl.className = "alh-statlines"; ar.body.appendChild(sl);
      var thinkLine = statline("think", "Thinking…", true); sl.appendChild(thinkLine); scrollDown();
      await sleep(PACE.thinkDots); thinkLine.classList.add("alh-done");
      var tsp = thinkLine.querySelector(".alh-spin"); if (tsp) tsp.remove();
      for (var i = 0; i < ex.tools.length; i++) {
        var line = statline(ex.tools[i].icon, ex.tools[i].label + "…", true); sl.appendChild(line); scrollDown();
        await sleep(PACE.toolRun + Math.random() * 250); line.classList.add("alh-done");
        var sp = line.querySelector(".alh-spin"); if (sp) sp.remove(); await sleep(PACE.toolGap);
      }
      var ans = document.createElement("div"); ans.className = "alh-answer"; ar.body.appendChild(ans); scrollDown();
      await streamAnswer(ans, ex.a); ar.orb.classList.remove("alh-live");
      ar.body.insertAdjacentHTML("beforeend", ACTIONS);
      requestAnimationFrame(function () { var a = ar.body.querySelector(".alh-actions"); if (a) a.classList.add("alh-on"); scrollDown(); });
      await sleep(PACE.read);
    }
    (async function loop() {
      greet(); await sleep(900); var idx = 0;
      while (true) { await runExchange(EXCHANGES[idx % EXCHANGES.length]); idx++; await sleep(PACE.betweenLoops); }
    })();
  }

  /* ---- inject: replace the old video swiper with the chat ---- */
  function inject() {
    var sec = document.querySelector(".arlo-xcase");
    if (!sec) return false;
    var swiper = sec.querySelector(".arlo-cstudy_tabs-content-swiper");
    if (!swiper) return false;
    sec.classList.add("arlo-boosted");

    var wrap = document.createElement("div");
    wrap.className = "arlo-cs-wrap";

    // Rebuild the "30+ clients" card cleanly (the original one uses the base template
    // absolute positioning that breaks once moved out of its swiper).
    var oldCard = sec.querySelector(".arlo-storyc_cta");
    if (oldCard) oldCard.style.display = "none";
    var card = document.createElement("div");
    card.className = "arlo-cs-card";
    card.innerHTML =
      '<div class="arlo-cs-num">30+</div>' +
      '<div class="arlo-cs-label">Clients served via MCP</div>' +
      '<p class="arlo-cs-body">Choquer Agency built the first version of ARLO as an internal Claude connector, then answered client questions in seconds instead of hours of tab-hopping.</p>' +
      '<a class="arlo-cs-link" href="/about">Read our story →</a>';
    wrap.appendChild(card);

    var mount = document.createElement("div");
    mount.className = "arlo-chat-mount";
    mount.innerHTML = panelHTML();
    wrap.appendChild(mount);

    swiper.replaceWith(wrap);
    runChat(mount);
    return true;
  }

  /* ---- page-wide brand recolor ----
     primary blue #397DFF -> neon green;  orange accent #F55C15 -> purple
     (Claude clay #D97757 is left alone). */
  var BLUE = "rgb(57, 125, 255)";       // #397DFF
  var ORANGE = "rgb(245, 92, 21)";      // #F55C15 — eyebrows, dots, bullets
  var NEON = "#D0FF71", INK = "#14181c", PURPLE = "#8F93FF";
  function recolor() {
    var els = document.querySelectorAll("*");
    for (var i = 0; i < els.length; i++) {
      var e = els[i], cs = getComputedStyle(e);
      if (cs.backgroundColor === BLUE) {
        e.style.setProperty("background-color", NEON, "important");
        e.style.setProperty("color", INK, "important");
        e.querySelectorAll("*").forEach(function (c) {
          c.style.setProperty("color", INK, "important");
          if (c.tagName === "path" || c.tagName === "svg") { c.style.setProperty("stroke", INK, "important"); }
        });
      }
      if (cs.borderTopColor === BLUE && cs.borderTopWidth !== "0px") e.style.setProperty("border-color", NEON, "important");
      if (cs.color === BLUE && cs.backgroundColor !== BLUE) e.style.setProperty("color", INK, "important");
      // orange -> purple (incl. inline-SVG arrows via stroke/fill)
      if (cs.color === ORANGE) e.style.setProperty("color", PURPLE, "important");
      if (cs.backgroundColor === ORANGE) e.style.setProperty("background-color", PURPLE, "important");
      if (cs.borderTopColor === ORANGE && cs.borderTopWidth !== "0px") e.style.setProperty("border-color", PURPLE, "important");
      if (cs.stroke === ORANGE) e.style.setProperty("stroke", PURPLE, "important");
      if (cs.fill === ORANGE) e.style.setProperty("fill", PURPLE, "important");
    }
  }

  /* ---- Section 3: overlay Arlo app "screens" on the step cards ---- */
  /* ---- reusable "media card": a scenic bg with an app screenshot floating on
          top, pinned to a corner. Drives BOTH the Connect/Assign/Ask steps and
          the Live-data cards so the two sections stay visually identical.
          cfg = { section, card, wrap?, appImg?, svgs?, bgs?, pin } ---- */
  function buildMediaCards(cfg) {
    var sec = document.querySelector(cfg.section);
    if (!sec) return;
    var cards = sec.querySelectorAll(cfg.card);
    if (!cards.length) return;
    cards.forEach(function (card, i) {
      // Case A: the card already has a media wrapper with its own scenic bg
      // (Connect/Assign/Ask). Just drop the app overlay in.
      var wrap = cfg.wrap ? card.querySelector(cfg.wrap) : null;
      if (wrap) {
        if (wrap.querySelector(".arlo-step-overlay")) return;
        wrap.classList.add("arlo-step-wrap");
        var ov = document.createElement("img");
        ov.className = "arlo-step-overlay " + (cfg.pin[i] || "");
        ov.alt = "";
        ov.src = BASE + "ui/" + cfg.svgs[i] + "?v=" + Date.now();
        wrap.appendChild(ov);
        return;
      }
      // Case B: no wrapper (Live-data cards). Build the same frame around the
      // existing app image and slide a scenic bg behind it.
      var app = card.querySelector(cfg.appImg);
      if (!app || card.querySelector(".arlo-media-frame")) return;
      var box = document.createElement("div");
      box.className = "arlo-step-wrap arlo-media-frame";
      card.insertBefore(box, app);
      var bg = document.createElement("img");
      bg.className = "arlo-media-bg";
      bg.alt = "";
      bg.src = cfg.bgs[i % cfg.bgs.length];
      box.appendChild(bg);
      app.classList.add("arlo-step-overlay");
      if (cfg.pin[i]) app.classList.add(cfg.pin[i]);
      box.appendChild(app);
    });
  }

  function enhanceSteps() {
    // Connect → connections · Assign → live data · Ask → Claude/Slack frame
    buildMediaCards({
      section: ".arlo-xconnect",
      card: ".arlo-conn_card",
      wrap: ".arlo-conncard_image-wrapper",
      svgs: ["homepage-story-new.svg", "live-data-new.svg", "conversation.svg"],
      pin: ["arlo-step-br", "arlo-step-br", "arlo-step-br"],
    });
    // Live-data cards reuse the exact same component (scenic bg + app overlay)
    buildMediaCards({
      section: ".arlo-xdata",
      card: ".arlo-datac_card",
      appImg: ".arlo-datac_card-image",
      bgs: [BASE + "bg/card-blur-1.jpg", BASE + "bg/card-blur-2.jpg", BASE + "bg/card-blur-3.jpg"],
      pin: ["arlo-step-bm", "arlo-step-br", "arlo-step-br"],
    });
  }

  /* ---- flip the nav logo to its dark-state (purple flower + white ARLO)
          whenever the fixed navbar is sitting over a dark section ---- */
  function navDarkState() {
    var logo = document.querySelector(".nav_logo");
    var navc = document.querySelector(".arlo-nav_component");
    var ref = document.querySelector(".navbar_component, .nav_component, .ui-nav") || logo;
    if (!ref) return;
    var rr = ref.getBoundingClientRect();
    var y = rr.top + rr.height / 2; // vertical center of the nav bar
    var dark = document.querySelectorAll(
      ".arlo-xtrust, .footer_bottom-content-wrapper, .footer_component, footer"
    );
    var over = false;
    dark.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.height && r.top <= y && r.bottom >= y) over = true;
    });
    if (logo) logo.classList.toggle("dark-state", over);   // purple flower + white ARLO
    if (navc) navc.classList.toggle("arlo-nav-dark", over); // light the whole menu
  }

  // Liquid-chrome: replace each section's bg PHOTO with a rippling water-shader
  // version of the same photo, sitting in the photo's own stacking slot (so any
  // content/app-screenshot layered above it stays on top). Reusable across pages —
  // just add a selector below. Only runs where the vanilla shader is loaded
  // (window.ArloChrome), so it's a no-op on pages that don't include arlo-water.js.
  var CHROME_SELECTORS = [
    ".arlo-stab-_bg-image", // feature-tabs desktop bg  (home + service)
    ".arlo-conncard_image",   // Connect / Assign / Ask cards (home)
    ".arlo-synct-bg",            // Destinations / Sync (home)
    ".arlo-media-bg",           // Connect everything / You own the data / Live never stale (home)
    ".arlo-blog-media img",     // blog post thumbnails (home)
    ".arlo-feat-bg",            // feature-accordion media panels (SEO page)
    ".arlo-form-section-image",  // SEO hero image
    ".arlo-hiw-bg"              // How-it-works step images (SEO page)
  ];
  // CSS-background hosts. `pseudo` reads the bg off ::before/::after; `z` sets the
  // chrome layer's z-index (opaque, so it hides the flat bg beneath it).
  var CHROME_CSS_HOSTS = [
    { sel: ".footer_bottom-content-wrapper" },              // footer statue (element bg)
    { sel: ".arlo-conncard_image-wrapper" },             // "Ask" card (element bg; no-op on <img> cards)
    { sel: ".arlo-xcase", pseudo: "::before" } // 30+/chat wildflowers bg lives on ::before
  ];
  var CHROME_PARAMS = {
    colorBack: "#909090", colorHighlight: "#ffffff",
    highlights: 0.02, layering: 0.10, edges: 1.0, waves: 0.40,
    caustic: 0.64, size: 0.58, speed: 0.235, scale: 1.64, fit: "cover"
  };

  // The shader normalizes its ripple pattern to the container, so a small panel
  // gets small ripples (and proportionally slower motion) and a big one gets big
  // ripples. To make the effect IDENTICAL everywhere, scale u_size inversely with
  // container width → the ripple wavelength (and thus speed) is a constant number
  // of PIXELS. Calibrated so size≈0.58 at ~640px wide.
  function chromeParamsFor(width) {
    var size = (39.8 / Math.max(160, width) - 0.01) / 0.09;
    size = Math.max(0.1, Math.min(2.5, size));
    var p = {};
    for (var k in CHROME_PARAMS) p[k] = CHROME_PARAMS[k];
    p.size = size;
    return p;
  }

  // Mount the water shader on `layer` (inside `el`), fed `imgUrl`, and keep its
  // canvas buffer sized to the layer. Shared by the <img> and CSS-bg paths.
  function startShader(el, layer, imgUrl) {
    var img = new Image();
    img.onload = function () {
      try {
        var m = window.ArloChrome.mount(layer, img, chromeParamsFor(el.offsetWidth || layer.offsetWidth || 640));
        el.__chromeInstance = m;
        // ShaderMount's ResizeObserver doesn't reliably size the buffer here
        // (it stays at the 300x150 default), so feed it the measured box directly.
        var sizeIt = function () {
          var r = layer.getBoundingClientRect();
          if (!r.width || !r.height) return;
          var dpr = Math.max(1, window.devicePixelRatio);
          m.parentWidth = r.width; m.parentHeight = r.height;
          m.parentDevicePixelWidth = r.width * dpr; m.parentDevicePixelHeight = r.height * dpr;
          m.devicePixelsSupported = true;
          if (m.handleResize) m.handleResize();
        };
        requestAnimationFrame(sizeIt);
        [120, 500, 1200].forEach(function (d) { setTimeout(sizeIt, d); });
        window.addEventListener("resize", sizeIt, { passive: true });
      } catch (e) { layer.remove(); el.__chromeMounted = false; }
    };
    img.src = imgUrl;
  }

  // <img> bg photo → ripple it in place, in the photo's own stacking slot.
  function mountChrome(bg) {
    if (bg.__chromeMounted) return;
    if (bg.offsetWidth < 40 || bg.offsetHeight < 40) {       // not laid out yet — retry
      bg.__chromeTries = (bg.__chromeTries || 0) + 1;
      if (bg.__chromeTries < 12) setTimeout(function () { mountChrome(bg); }, 400);
      return;
    }
    bg.__chromeMounted = true;
    var host = bg.parentElement;
    if (getComputedStyle(host).position === "static") host.style.position = "relative";
    var z = getComputedStyle(bg).zIndex;
    var layer = document.createElement("div");
    layer.className = "arlo-chrome";
    layer.style.zIndex = (z && z !== "auto") ? z : "0"; // sit in the photo's slot
    host.appendChild(layer);
    bg.style.visibility = "hidden"; // keep layout box, hide the flat photo
    startShader(bg, layer, bg.currentSrc || bg.src);
  }

  // CSS background-image host (footer, "Ask" card, or a ::before pseudo like the
  // 30+/chat section) → ripple behind the host's content.
  function mountChromeCSS(host, cfg) {
    cfg = cfg || {};
    if (host.__chromeMounted) return;
    if (host.offsetWidth < 40 || host.offsetHeight < 40) {
      host.__chromeTries = (host.__chromeTries || 0) + 1;
      if (host.__chromeTries < 12) setTimeout(function () { mountChromeCSS(host, cfg); }, 400);
      return;
    }
    var srcStyle = cfg.pseudo ? getComputedStyle(host, cfg.pseudo) : getComputedStyle(host);
    var m = srcStyle.backgroundImage.match(/url\(["']?([^"')]+)["']?\)/);
    if (!m) return;
    host.__chromeMounted = true;
    // Give the host its own stacking context and lift its content above the chrome
    // layer (which is opaque, so it hides the flat photo / ::before beneath it).
    if (getComputedStyle(host).position === "static") host.style.position = "relative";
    host.style.zIndex = "0";
    [].forEach.call(host.children, function (ch) {
      ch.style.position = "relative";
      if (getComputedStyle(ch).zIndex === "auto") ch.style.zIndex = "1";
    });
    var layer = document.createElement("div");
    layer.className = "arlo-chrome";
    layer.style.zIndex = "0";
    host.insertBefore(layer, host.firstChild);
    if (!cfg.pseudo) host.style.backgroundImage = "none"; // element bg can be nulled; a ::before can't (chrome covers it)
    startShader(host, layer, m[1]);
  }

  function initChrome() {
    if (!window.ArloChrome) return;
    // Lazy-mount + pause off-screen so only shaders near the viewport animate.
    if (!initChrome._io && "IntersectionObserver" in window) {
      initChrome._io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var bg = en.target;
          if (en.isIntersecting) {
            if (bg.__chromeCss) mountChromeCSS(bg, bg.__chromeCss); else mountChrome(bg);
            if (bg.__chromeInstance) bg.__chromeInstance.setSpeed(CHROME_PARAMS.speed);
          } else if (bg.__chromeInstance) {
            bg.__chromeInstance.setSpeed(0); // pause when scrolled away
          }
        });
      }, { rootMargin: "300px 0px" });
    }
    // Idempotent: observe any target not yet observed (catches dynamically-built cards).
    function observe(el, cssCfg) {
      if (el.__chromeObserved) return;
      el.__chromeObserved = true;
      el.__chromeCss = cssCfg || null; // truthy config → CSS-bg path; null → <img> path
      if (initChrome._io) initChrome._io.observe(el);
      else if (cssCfg) mountChromeCSS(el, cssCfg); else mountChrome(el);
    }
    CHROME_SELECTORS.forEach(function (s) {
      document.querySelectorAll(s).forEach(function (el) { observe(el, null); });
    });
    CHROME_CSS_HOSTS.forEach(function (cfg) {
      document.querySelectorAll(cfg.sel).forEach(function (el) { observe(el, cfg); });
    });
  }

  // Feature accordion (cohere-style): each .arlo-feat auto-advances its items
  // every 8s, cross-fading the matching media image; click to jump; pause off-screen.
  function initFeatureAccordion() {
    document.querySelectorAll(".arlo-feat").forEach(function (sec) {
      if (sec.__featInit) return;
      var items = [].slice.call(sec.querySelectorAll(".arlo-feat-item"));
      var imgs = [].slice.call(sec.querySelectorAll(".arlo-feat-img"));
      if (!items.length) return;
      sec.__featInit = true;
      var index = 0, timer = null;
      function activate(i) {
        index = i;
        items.forEach(function (it, k) { it.classList.toggle("is-active", k === i); });
        imgs.forEach(function (im, k) { im.classList.toggle("is-active", k === i); });
      }
      function start() { if (!timer) timer = setInterval(function () { activate((index + 1) % items.length); }, 8000); }
      function stop() { clearInterval(timer); timer = null; }
      items.forEach(function (it, i) {
        it.addEventListener("click", function (e) { e.preventDefault(); stop(); activate(i); start(); });
      });
      activate(0);
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (es) {
          es.forEach(function (en) { if (en.isIntersecting) start(); else stop(); });
        }, { threshold: 0 }).observe(sec);
      } else { start(); }
    });
  }

  // Example-prompts accordion: first open by default, auto-advances every 7s
  // (one closes, next opens), single-open (clicking one closes the others),
  // pauses off-screen. Native <details> can't do this, so we drive it.
  function initAskPrompts() {
    document.querySelectorAll(".arlo-ask").forEach(function (sec) {
      if (sec.__askInit) return;
      var items = [].slice.call(sec.querySelectorAll(".arlo-ask-item"));
      if (!items.length) return;
      sec.__askInit = true;
      var index = 0, timer = null;
      function activate(i) {
        index = i;
        items.forEach(function (it, k) {
          if (k === i) it.setAttribute("open", ""); else it.removeAttribute("open");
        });
      }
      function start() { if (!timer) timer = setInterval(function () { activate((index + 1) % items.length); }, 7000); }
      function stop() { clearInterval(timer); timer = null; }
      items.forEach(function (it, i) {
        var sum = it.querySelector(".arlo-ask-q");
        sum.addEventListener("click", function (e) {
          e.preventDefault();            // take over the native toggle → single-open
          stop(); activate(i); start();  // open this one, restart the timer
        });
      });
      activate(0);                       // first open by default
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (es) {
          es.forEach(function (en) { if (en.isIntersecting) start(); else stop(); });
        }, { threshold: 0 }).observe(sec);
      } else { start(); }
    });
  }

  // Mobile hamburger menu. Toggles .arlo-nav-open on the nav; CSS shows/hides
  // the menu on mobile.
  function initMobileNav() {
    var btn = document.querySelector(".nav_menu-button-4");
    var nav = document.querySelector(".arlo-nav_component") || document.querySelector("[class*='nav_component']");
    if (!btn || !nav || btn.__navInit) return;
    btn.__navInit = true;
    function toggle(open) {
      var isOpen = open == null ? !nav.classList.contains("arlo-nav-open") : open;
      nav.classList.toggle("arlo-nav-open", isOpen);
      btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      document.body.style.overflow = isOpen ? "hidden" : "";
    }
    btn.addEventListener("click", function (e) { e.preventDefault(); toggle(); });
    nav.querySelectorAll(".nav_content a").forEach(function (a) {
      a.addEventListener("click", function () { toggle(false); });
    });
    window.addEventListener("resize", function () { if (window.innerWidth > 991) toggle(false); }, { passive: true });
  }

  function boot() {
    var ready = inject();
    recolor();
    enhanceSteps();
    navDarkState();
    initChrome();
    initFeatureAccordion();
    initAskPrompts();
    initMobileNav();
    window.addEventListener("scroll", navDarkState, { passive: true });
    window.addEventListener("resize", navDarkState, { passive: true });
    if (!ready) { setTimeout(boot, 250); return; }
    setTimeout(function () { recolor(); enhanceSteps(); navDarkState(); initChrome(); }, 800); // catch late-painted links
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(boot, 60); });
  else setTimeout(boot, 60);
})();
