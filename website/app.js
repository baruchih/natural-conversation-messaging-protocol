(() => {
  const THEME_KEY = "ncmp-theme";

  function c6(utterance) {
    const nfc = utterance.normalize("NFC").toLowerCase();
    let sum = 0;
    let letters = "";
    for (const ch of nfc) {
      const code = ch.codePointAt(0);
      if (code >= 97 && code <= 122) {
        sum += code - 96;
        letters += ch;
      }
    }
    return { v: sum % 64, sum, letters, digits: /\d/.test(utterance) };
  }

  function transition(v) {
    return v < 32 ? "DATA" : "SKIP";
  }

  function applyTheme() {
    const pref = localStorage.getItem(THEME_KEY) || "system";
    const systemDark = matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = pref === "dark" || (pref === "system" && systemDark);
    document.documentElement.dataset.theme = pref;
    document.documentElement.dataset.scheme = dark ? "dark" : "light";
    const btn = document.getElementById("theme-toggle");
    if (btn) btn.setAttribute("aria-label", `Theme: ${pref}`);
  }

  function cycleTheme() {
    const order = ["system", "light", "dark"];
    const cur = localStorage.getItem(THEME_KEY) || "system";
    const next = order[(order.indexOf(cur) + 1) % order.length];
    localStorage.setItem(THEME_KEY, next);
    applyTheme();
  }

  const HEADER_BITS = 2;
  const ARGUMENT_BITS = 5;
  const WIRE_BITS = HEADER_BITS + ARGUMENT_BITS;

  const TURNS = [
    {
      speaker: "A",
      text: "Thinking we could walk Saturday morning—what do you say? I’ll pack an umbrella, just to be on the safe side!",
      kind: "control",
      meta: "PROBE",
      mode: "-",
      owner: "-",
      v: null,
      bits: "",
      acc: "",
      action: null,
      resource: null,
      argument: null,
      note: "idle → handshake. Hint umbrella and P_sec = 0x01. The session is not yet interpreting BODY.",
    },
    {
      speaker: "B",
      text: "Sounds good. I'll bring my umbrella too, just in case.",
      kind: "control",
      meta: "ACK",
      mode: "-",
      owner: "-",
      v: null,
      bits: "",
      acc: "",
      action: null,
      resource: null,
      argument: null,
      note: "handshake → active. Residual 0x0F is derived from the exact PROBE string. K_session = 0xDCA0B418. The two strings donate (saturday, morning) and (sounds, bring).",
    },
    {
      speaker: "A",
      text: "We can set off Saturday in the morning. The park works!",
      kind: "control",
      meta: "START · argument 5",
      mode: "SKIP",
      owner: "A",
      v: null,
      bits: "",
      acc: "",
      action: null,
      resource: null,
      argument: null,
      note: "active → frame. The handshake donated (saturday, morning). Residual 0x25 names START. L(K_session, U) = 5. No umbrella. Header width is 2 because the tables are 2×2.",
    },
    {
      speaker: "A",
      text: "How was dinner last night after you sat down?",
      kind: "skip",
      meta: "BODY · owner SKIP",
      mode: "DATA",
      owner: "A",
      v: 22,
      bits: "",
      acc: "",
      action: null,
      resource: null,
      argument: null,
      note: "First body turn is always SKIP. transition(22) → DATA.",
    },
    {
      speaker: "B",
      text: "The pasta was decent and the bread came out warm.",
      kind: "skip",
      meta: "BODY · peer",
      mode: "DATA",
      owner: "A",
      v: 15,
      bits: "",
      acc: "",
      action: null,
      resource: null,
      argument: null,
      note: "B does not own the payload. Mode still moves. transition(15) → DATA.",
    },
    {
      speaker: "A",
      text: "Yes, the park gate works if we leave early.",
      kind: "data",
      meta: "BODY · bit 0",
      mode: "DATA",
      owner: "A",
      v: 12,
      bits: "0",
      acc: "0",
      action: "GET",
      resource: null,
      argument: null,
      note: "First header bit. In this profile, 0 → GET.",
    },
    {
      speaker: "A",
      text: "I packed two bottles and left the extra sweater.",
      kind: "data",
      meta: "BODY · bit 0",
      mode: "DATA",
      owner: "A",
      v: 6,
      bits: "0",
      acc: "00",
      action: "GET",
      resource: "CUSTOMER",
      argument: "",
      note: "Second header bit. In this profile, 0 → CUSTOMER. Five argument bits remain.",
    },
    {
      speaker: "A",
      text: "Should we grab some fresh bread at the market, or do you think we should just bake it later?",
      kind: "data",
      meta: "BODY · bits 10",
      mode: "DATA",
      owner: "A",
      v: 19,
      bits: "10",
      acc: "0010",
      action: "GET",
      resource: "CUSTOMER",
      argument: "10",
      note: "Argument begins. 19 mod 3 = 1 → 10.",
    },
    {
      speaker: "B",
      text: "Do you think we should bring jackets this time?",
      kind: "skip",
      meta: "BODY · peer",
      mode: "DATA",
      owner: "A",
      v: 23,
      bits: "",
      acc: "0010",
      action: "GET",
      resource: "CUSTOMER",
      argument: "10",
      note: "Peer turn. Mode still moves. transition(23) → DATA.",
    },
    {
      speaker: "A",
      text: "What do you think about cooking at home with all our fresh finds, or should we go out and eat instead?",
      kind: "data",
      meta: "BODY · bits 11",
      mode: "DATA",
      owner: "A",
      v: 11,
      bits: "11",
      acc: "001011",
      action: "GET",
      resource: "CUSTOMER",
      argument: "1011",
      note: "11 mod 3 = 2 → 11. One argument bit remains.",
    },
    {
      speaker: "A",
      text: "Mostly yes and the coffee almost made up for it.",
      kind: "data",
      meta: "BODY · bit 1",
      mode: "DATA",
      owner: "A",
      v: 5,
      bits: "1",
      acc: "0010111",
      action: "GET",
      resource: "CUSTOMER",
      argument: "10111",
      note: "Final argument bit. 5 is odd → 1. Wire 00 10111.",
      argBits: "10111",
    },
    {
      speaker: "A",
      text: "Alright, that sounds good. I'll bring the notes.",
      kind: "control",
      meta: "FINISH_ARGUMENT",
      mode: "-",
      owner: "-",
      v: null,
      bits: "",
      acc: "0010111",
      action: "GET",
      resource: "CUSTOMER",
      argument: "10111",
      note: "The handshake donated (sounds, bring). Residual 0x08 names FINISH. NCMP transported 10111. An application may read those bits as 23.",
      reveal: "GET CUSTOMER 23",
      argBits: "10111",
    },
  ];

  let active = 0;

  function bitsRow(acc, fresh) {
    return Array.from({ length: WIRE_BITS }, (_, i) => {
      const on = i < acc.length;
      const mark = i === 0 ? "A" : i === 1 ? "R" : "";
      const isNew = on && i >= fresh;
      return `<span class="bit${on ? " is-on" : ""}${isNew ? " is-new" : ""}" title="${mark}">${on ? acc[i] : ""}</span>`;
    }).join("");
  }

  function argumentView(t) {
    const value = t.argument === null ? "-" : t.argument === "" ? '""' : t.argument;
    return `${row("ARGUMENT", value)}<p class="arg-bits">${t.argBits || ""}</p>`;
  }

  function row(k, v) {
    const text = v === null || v === undefined || v === "" ? "-" : v;
    return `<div class="scope-row"><span class="k">${k}</span><span>${text}</span></div>`;
  }

  function revealTurn(i) {
    const rail = document.getElementById("example-rail");
    const on = rail?.querySelectorAll(".turn")[i];
    if (!rail || !on) return;
    const railBox = rail.getBoundingClientRect();
    const onBox = on.getBoundingClientRect();
    if (onBox.top >= railBox.top && onBox.bottom <= railBox.bottom) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    rail.scrollTo({
      top: rail.scrollTop + (onBox.top < railBox.top ? onBox.top - railBox.top : onBox.bottom - railBox.bottom),
      behavior: reduce ? "auto" : "smooth",
    });
  }

  function renderPanel(i) {
    const t = TURNS[i];
    const fresh = i === 0 ? 0 : TURNS[i - 1].acc.length;
    document.getElementById("example-body").innerHTML = `
      <header class="lab-msg">
        <h3>After this turn</h3>
        <p class="said-now">${t.speaker}: “${t.text}”</p>
      </header>
      <div class="lab-state">
        <div class="scope-block">
          <p class="label">State</p>
          ${row("recognized", t.meta)}
          ${row("next mode", t.mode)}
          ${row("owner", t.owner)}
          ${row("V", t.v)}
          ${row("symbol", t.bits || "-")}
        </div>
        <div class="scope-block">
          <p class="label">Wire</p>
          <div class="bits" aria-label="Accumulator">${bitsRow(t.acc, fresh)}</div>
          <div class="wire-key is-10"><span>A</span><span>R</span><span>argument · ${ARGUMENT_BITS}</span></div>
        </div>
        <div class="scope-block">
          <p class="label">Object</p>
          ${row("ACTION", t.action ?? "-")}
          ${row("RESOURCE", t.resource ?? "-")}
          ${argumentView(t)}
          ${
            t.reveal
              ? `<p class="label">Application view</p><p class="app-object">${t.reveal}</p>`
              : `<p class="app-object"></p>`
          }
        </div>
        <p class="note">${t.note}</p>
      </div>
    `;
    document.getElementById("lab-prev").disabled = i === 0;
    document.getElementById("lab-next").disabled = i === TURNS.length - 1;
    document.getElementById("lab-step").textContent = `${i + 1} / ${TURNS.length}`;
    document.querySelectorAll("#example-rail .turn").forEach((el, n) => {
      el.classList.toggle("is-on", n === i);
      el.setAttribute("aria-selected", String(n === i));
    });
    revealTurn(i);
  }

  function go(i) {
    active = Math.max(0, Math.min(TURNS.length - 1, i));
    renderPanel(active);
  }

  function renderExample() {
    const rail = document.getElementById("example-rail");
    rail.innerHTML = TURNS.map(
      (t, i) => `
      <button type="button" class="turn is-${t.speaker.toLowerCase()} is-${t.kind}" data-i="${i}" role="option">
        <p class="meta">${t.speaker} · ${t.meta}</p>
        <p class="said">${t.text}</p>
      </button>
    `,
    ).join("");
    renderPanel(0);

    rail.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-i]");
      if (!btn) return;
      go(Number(btn.dataset.i));
    });

    let wheelLock = 0;
    rail.addEventListener(
      "wheel",
      (e) => {
        if (Math.abs(e.deltaY) < 4) return;
        e.preventDefault();
        const now = performance.now();
        if (now - wheelLock < 280) return;
        wheelLock = now;
        go(active + (e.deltaY > 0 ? 1 : -1));
      },
      { passive: false },
    );

    document.getElementById("example-panel").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-step]");
      if (!btn) return;
      go(active + Number(btn.dataset.step));
    });

    document.addEventListener("keydown", (e) => {
      if (e.target.closest("textarea, input")) return;
      const lab = document.getElementById("lab");
      if (!lab.contains(e.target) && !lab.matches(":hover")) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        go(active + 1);
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        go(active - 1);
      }
    });
  }

  function renderC6(text) {
    const { v, sum, letters, digits } = c6(text);
    const next = transition(v);
    const empty = letters.length === 0;
    document.getElementById("c6-steps").innerHTML = `
      <div class="dim">not a meaning · C6(U)</div>
      <div class="letters">${empty ? "(no a–z letters)" : letters}</div>
      <div class="dim">a=1 … z=26 · Σ = ${sum} · Σ mod 64</div>
      <div>V = ${v}</div>
      <div>${digits ? "digits ignored · " : ""}V ${v < 32 ? "<" : "≥"} 32</div>
      <div>therefore next mode = ${next}</div>
    `;
  }

  function wireC6() {
    const input = document.getElementById("c6-input");
    const preset = new URLSearchParams(location.search).get("u");
    if (preset) input.value = preset;
    const update = () => renderC6(input.value);
    input.addEventListener("input", update);
    document.querySelectorAll("[data-fill]").forEach((btn) => {
      btn.addEventListener("click", () => {
        input.value = btn.dataset.fill;
        input.focus();
        update();
      });
    });
    update();
  }

  applyTheme();
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applyTheme);
  document.getElementById("theme-toggle")?.addEventListener("click", cycleTheme);
  renderExample();
  wireC6();
})();
