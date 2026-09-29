/* script.js — UI + inference engine. Medical content is in data/conditions.js */
(function () {
  "use strict";

  /* ---------- Routing (hash based, works from file:// too) ---------- */
  const pages = document.querySelectorAll(".page");
  function route() {
    const id = (location.hash || "#home").slice(1);
    const target = document.getElementById(id) ? id : "home";
    pages.forEach(p => { p.hidden = p.id !== target; });
    document.querySelectorAll("[data-nav]").forEach(a =>
      a.classList.toggle("on", a.dataset.nav === target));
    document.getElementById("main").focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);

  /* ---------- Helpers ---------- */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const srcLink = s => `<a href="${s.url}" target="_blank" rel="noopener">${s.title}</a>`;

  /* Free text -> set of canonical symptom ids */
  function textToSymptoms(text) {
    const t = text.toLowerCase(), found = new Set();
    SYMPTOMS.forEach(s => { if (t.includes(s.id)) found.add(s.id); });
    Object.keys(SYNONYMS).forEach(k => { if (t.includes(k)) found.add(SYNONYMS[k]); });
    return found;
  }

  /* ---------- Emergency / urgent check (runs BEFORE scoring) ---------- */
  function checkRedFlags(symptoms, freeText) {
    const t = freeText.toLowerCase(), out = [];
    RED_FLAGS.forEach(r => { if (r.any.some(k => t.includes(k))) out.push(r); });
    symptoms.forEach(s => { if (FLAG_SYMPTOMS[s]) out.push(FLAG_SYMPTOMS[s]); });
    return out;
  }

  /* ---------- Inference engine: AND / OR / NOT + confidence score ---------- */
  function infer(profile, mode) {
    const results = [];
    for (const rule of CONDITIONS.filter(c => c.category === mode)) {
      const has = s => profile.symptoms.has(s);
      if (!rule.required.every(has)) continue;                       // AND
      const matched = rule.optional.filter(has);                     // OR
      if (matched.length < rule.threshold) continue;
      if (rule.exclude.some(has)) continue;                          // NOT

      let score = matched.length / rule.optional.length;             // base ratio
      if (rule.required.length) score += 0.15;                       // required bonus
      const [lo, hi] = rule.risk.age;
      if (profile.age >= lo && profile.age <= hi && (lo > 0 || hi < 120)) score += 0.1;
      if (rule.risk.text.some(w => profile.context.includes(w))) score += 0.08;
      score = Math.min(score, 0.95);

      results.push({
        rule, score,
        matched: [...rule.required, ...matched],
        missing: rule.optional.filter(s => !has(s)).slice(0, 4)
      });
    }
    return results.sort((a, b) => b.score - a.score);
  }

  /* ---------- Checker UI ---------- */
  const CATS = { general: "General", respiratory: "Respiratory", urinary: "Urinary", head: "Head" };

  function buildChecker(root) {
    const mode = root.dataset.mode, chosen = new Set();
    let cat = mode === "injury" ? "injury" : "general";
    const tabs = mode === "injury" ? "" :
      `<div class="tabs" role="group" aria-label="Symptom category">` +
      Object.keys(CATS).map(k => `<button type="button" data-cat="${k}" aria-pressed="${k === cat}">${CATS[k]}</button>`).join("") + `</div>`;

    root.innerHTML = `
      <form novalidate>
        <label for="${mode}-age">Age</label>
        <input id="${mode}-age" type="number" min="0" max="120" inputmode="numeric">
        <label for="${mode}-ctx">Existing conditions and recent events <span class="small">(e.g. diabetes, a fall, running)</span></label>
        <textarea id="${mode}-ctx" rows="2"></textarea>
        <fieldset><legend>${mode === "injury" ? "What describes the injury?" : "Select symptoms"}</legend>
          ${tabs}<div class="chips" data-chips></div></fieldset>
        <label for="${mode}-free">Anything else, in your own words</label>
        <textarea id="${mode}-free" rows="2" placeholder="${mode === "injury" ? "e.g. twisted my ankle playing football" : "e.g. high temperature and aching"}"></textarea>
        <p class="error" role="alert" data-error hidden></p>
        <button type="submit">Check</button>
        <button type="reset" class="secondary">Restart</button>
      </form>
      <div data-out aria-live="polite"></div>`;

    const form = $("form", root), chips = $("[data-chips]", root), out = $("[data-out]", root), err = $("[data-error]", root);

    function drawChips() {
      chips.innerHTML = SYMPTOMS.filter(s => s.group.includes(cat)).map(s =>
        `<label><input type="checkbox" value="${s.id}" ${chosen.has(s.id) ? "checked" : ""}> ${s.label}</label>`).join("");
    }
    drawChips();
    chips.addEventListener("change", e => e.target.checked ? chosen.add(e.target.value) : chosen.delete(e.target.value));
    root.querySelectorAll("[data-cat]").forEach(b => b.addEventListener("click", () => {
      cat = b.dataset.cat;
      root.querySelectorAll("[data-cat]").forEach(x => x.setAttribute("aria-pressed", x === b));
      drawChips();
    }));
    form.addEventListener("reset", () => { chosen.clear(); out.innerHTML = ""; err.hidden = true; setTimeout(drawChips); });

    form.addEventListener("submit", e => {
      e.preventDefault();
      const age = parseInt($(`#${mode}-age`, root).value, 10);
      const ctx = $(`#${mode}-ctx`, root).value.toLowerCase();
      const free = $(`#${mode}-free`, root).value;
      if (isNaN(age) || age < 0 || age > 120) { err.textContent = "Please enter an age between 0 and 120."; err.hidden = false; return; }
      const symptoms = new Set([...chosen, ...textToSymptoms(free)]);
      if (!symptoms.size) { err.textContent = "Please select or describe at least one symptom."; err.hidden = false; return; }
      err.hidden = true;
      render(out, infer({ age, symptoms, context: ctx + " " + free.toLowerCase() }, mode),
             checkRedFlags(symptoms, free + " " + ctx));
    });
  }

  function render(out, matches, flags) {
    let html = "";
    // Warnings ALWAYS come first and are independent of confidence.
    flags.forEach(f => {
      html += `<div class="alert ${f.level === "111" ? "l111" : ""}" role="alert"><strong>${f.level === "999" ? "🚨 Emergency: call 999 or go to A&amp;E" : "⚠️ Get urgent advice: NHS 111"}</strong><p>${f.text}</p><p class="small">Source: ${srcLink(f.source)}</p></div>`;
    });
    if (!matches.length) {
      html += `<div class="card"><h3>No matching conditions found</h3><p>Your answers did not meet the criteria for any condition currently in this tool. That does <strong>not</strong> mean nothing is wrong. Speak to a pharmacist or GP, or call NHS 111 if you are worried.</p></div>`;
    } else {
      html += `<h2>Possible conditions that may match your symptoms</h2>
        <p class="small">The confidence score shows how closely your answers match this app's symptom patterns. It is not a medical probability or a diagnosis. Consider seeking professional medical assessment.</p>`;
      matches.forEach(m => {
        const r = m.rule, pct = Math.round(m.score * 100);
        html += `<article class="card ${r.urgency}">
          <h3>${r.name}</h3>
          <p class="small" id="c-${r.id}">Pattern match: ${pct}%</p>
          <div class="meter" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-labelledby="c-${r.id}"><span style="width:${pct}%"></span></div>
          <p><strong>Why it may match:</strong> your answers include ${m.matched.join(", ")}. This may be consistent with ${r.name}.</p>
          ${m.missing.length ? `<p><strong>Not reported:</strong> ${m.missing.join(", ")}</p>` : ""}
          <p><strong>About (NHS):</strong> ${r.description}</p>
          <p><strong>Next steps (NHS):</strong> ${r.nextSteps}</p>
          <p><strong>Warning signs (NHS):</strong> ${r.warnings}</p>
          <p class="small">Source: ${srcLink(r.source)} · Based on NHS guidance. Check the page for the latest advice.</p></article>`;
      });
    }
    out.innerHTML = html;
    out.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ---------- General questions: NHS-only lookup, never invents ---------- */
  const ALIASES = { gp: "doctor", help: "doctor", seek: "doctor", long: "last", infectious: "spread",
    contagious: "spread", cure: "treat", treatment: "treat", recovery: "recover", healing: "recover", urinary: "uti", cystitis: "uti" };
  const NONE = "I could not find enough relevant information from official NHS guidance to answer this reliably. Try rewording your question, search on <a href='https://www.nhs.uk/' target='_blank' rel='noopener'>nhs.uk</a>, or ask a pharmacist, GP or NHS 111.";

  function answer(q) {
    let t = q.toLowerCase();
    Object.keys(ALIASES).forEach(k => { if (t.includes(k)) t += " " + ALIASES[k]; });
    if (/\b(dose|dosage|how much|how many|increase|decrease|stop taking|start taking|double)\b/.test(t))
      return `<p>This tool cannot advise on medicine doses or on starting, stopping or changing medicines. Check the packaging or leaflet, and speak to a pharmacist or your doctor.</p>`;
    if (/(do i have|what condition|what do i have|diagnos|what is wrong with me)/.test(t))
      return `<p>This section cannot diagnose. Please use the <a href="#symptom">Symptom Checker</a> or <a href="#injury">Injury Checker</a>. If you feel very unwell, call NHS 111, or 999 in an emergency.</p>`;
    let best = null, bestN = 0;
    QA.forEach(e => {
      if (e.keys.every(k => t.includes(k)) && e.keys.length > bestN) { best = e; bestN = e.keys.length; }
    });
    if (!best) return `<p>${NONE}</p>`;
    return `<div class="card"><h3>${best.q}</h3><p>${best.answer}</p><p class="small">Source: ${srcLink(best.source)}. Based on NHS guidance; this is general information, not personal medical advice.</p></div>`;
  }

  function setupAsk() {
    const form = $("#askForm"), input = $("#question"), err = $("#askError"), out = $("#askResult");
    form.addEventListener("submit", e => {
      e.preventDefault();
      if (!input.value.trim()) { err.hidden = false; return; }
      err.hidden = true; out.innerHTML = answer(input.value);
    });
    $("#examples").innerHTML = QA.map((e, i) => `<li><button type="button" data-i="${i}">${e.q}</button></li>`).join("");
    $("#examples").addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      input.value = QA[b.dataset.i].q; out.innerHTML = answer(input.value);
    });
  }

  /* ---------- Init ---------- */
  document.querySelectorAll(".checker").forEach(buildChecker);
  setupAsk();
  route();
})();
