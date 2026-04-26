// ─── Constants ────────────────────────────────────────────────────────────────

const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL   = 'claude-sonnet-4-6';

const DEFAULT_STYLE_GUIDE = `Chuck Hemann Writing Style Guide v4

HARD RULES — must fix, no exceptions:
- No em-dashes (—). Ever. Any format. Replace with a comma, period, or parentheses.
- Close declaratively. The final sentence must be a statement. No questions, no soft CTAs ("feel free to share," "let me know your thoughts," "what do you think?").
- No staccato runs. Never 3 or more consecutive short sentences (under ~10 words each). Short sentences need setup to land — without contrast, it's choppiness.
- Use contractions throughout (don't, it's, you're, we've). Formal constructions (do not, it is, they are) kill the conversational register.

WARNINGS — should fix:
- No passive voice in key arguments. Rewrite as active. ("Strategies should be developed" → "Develop your strategy.")
- No buzzwords or over-formal vocabulary: utilize, leverage, facilitate, synergy, paradigm, holistic, going forward, circle back, touch base, move the needle, best practices, deep dive, low-hanging fruit, actionable insights, impactful, scalable, robust solution.
- No preamble openers. Flag openers like "In today's fast-paced world," "As many of us know," "It's no secret that." If the point lands without the opener, cut it.
- Data points need a "so what." Every stat or data cite needs interpretation. Never leave data floating without a takeaway.
- No soft CTA language in the body of the piece ("feel free to," "don't hesitate," "share your thoughts").

VOICE RULES:
- Write peer-to-peer. Don't explain terms your reader already knows professionally.
- Sentence rhythm: build context in a longer sentence, then land with a short one that crystallizes. The short sentence adds weight, not new information.
- Direct address: talk to the reader directly and frequently ("you," "we").
- Organize around numbered frameworks where possible.
- Pop culture references must connect back to the business point in one sentence. Never left floating.
- Parentheses are the preferred tool for elaboration, humor, and qualifications. Not em-dashes.`;

const SYSTEM_PROMPT = `You are an expert writing style editor. The user will give you their writing style guide and a draft to check against it.

Your job:
1. Read the style guide carefully — understand every rule, preference, and prohibition.
2. Read the draft thoroughly.
3. Identify every violation of the style guide rules.
4. Return ONLY a valid JSON object — no markdown, no explanation, no prose outside the JSON.

JSON format to return:
{
  "summary": "One honest sentence assessing the draft overall.",
  "word_count": <integer>,
  "flags": [
    {
      "level": "error",
      "rule": "Name of the rule from the style guide",
      "title": "Specific, concrete violation title",
      "detail": "Why this violates the style guide — be specific, not generic.",
      "quote": "The exact offending text from the draft (max 120 chars). Must be a verbatim substring.",
      "suggestion": "A specific proposed rewrite. Not vague advice — actual replacement text.",
      "original": "Exact substring from the draft to find for auto-replace. Must match draft verbatim. Null if structural fix needed.",
      "replacement": "Exact replacement string. Must be a drop-in swap. Null if the fix requires judgment or structural rewrite."
    }
  ]
}

Level definitions:
- "error": Hard rule in the style guide. Must fix.
- "warn": Should fix. Clear violation of a stated preference.
- "info": Worth considering. Minor issue or style nudge.

Rules for original/replacement:
- original must be copied EXACTLY from the draft — same punctuation, same spacing, same case.
- replacement must be a drop-in swap — grammatically correct in context.
- If fixing requires rewriting a full sentence or paragraph, set both to null.
- Contractions, single-word swaps, phrase removals: these are good candidates for original/replacement.
- Keep replacements tight — only replace what needs replacing, not surrounding words.

Return max 15 flags, prioritized by severity. Return ONLY the JSON object.`;

// ─── State ────────────────────────────────────────────────────────────────────

let currentFlags = [];

// ─── Init ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const savedKey   = localStorage.getItem('sc_api_key');
  const savedGuide = localStorage.getItem('sc_style_guide');

  if (savedKey)   document.getElementById('apiKey').value = savedKey;
  if (savedGuide) document.getElementById('styleGuide').value = savedGuide;
  else            document.getElementById('styleGuide').value = DEFAULT_STYLE_GUIDE;

  document.getElementById('apiKey').addEventListener('input', updateApiStatus);
  updateApiStatus();

  // File upload handlers
  document.getElementById('guideUpload').addEventListener('change', e => handleUpload(e, 'styleGuide'));
  document.getElementById('draftUpload').addEventListener('change', e => handleUpload(e, 'draft'));

  // Cmd/Ctrl+Enter to check
  document.getElementById('draft').addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') runCheck();
  });
});

// ─── File upload ──────────────────────────────────────────────────────────────

function handleUpload(e, targetId) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    document.getElementById(targetId).value = ev.target.result;
    showToast(`${file.name} loaded`);
  };
  reader.readAsText(file);
  e.target.value = '';
}

// ─── API status indicator ─────────────────────────────────────────────────────

function updateApiStatus() {
  const key = document.getElementById('apiKey').value.trim();
  const dot = document.getElementById('apiDot');
  const label = document.getElementById('apiLabel');
  if (key.startsWith('sk-ant-') && key.length > 20) {
    dot.className = 'api-dot connected';
    label.textContent = 'API key set';
  } else if (key.length > 0) {
    dot.className = 'api-dot invalid';
    label.textContent = 'Invalid key format';
  } else {
    dot.className = 'api-dot empty';
    label.textContent = 'No API key';
  }
}

// ─── Main check ───────────────────────────────────────────────────────────────

async function runCheck() {
  const apiKey     = document.getElementById('apiKey').value.trim();
  const styleGuide = document.getElementById('styleGuide').value.trim();
  const draft      = document.getElementById('draft').value.trim();

  if (!apiKey) { showError('Add your Anthropic API key to get started.'); return; }
  if (!styleGuide) { showError('Paste or upload a style guide.'); return; }
  if (!draft) { showError('Paste or upload a draft to check.'); return; }

  setLoading(true);
  clearResults();

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 4000,
        system: SYSTEM_PROMPT,
        messages: [{
          role: 'user',
          content: `STYLE GUIDE:\n\n${styleGuide}\n\n${'─'.repeat(40)}\n\nDRAFT TO CHECK:\n\n${draft}`
        }]
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `API error ${res.status}`);
    }

    const data = await res.json();
    const raw  = data.content?.[0]?.text || '';

    // Strip markdown code fences if present
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Response was not valid JSON. Try again.');

    const result = JSON.parse(jsonMatch[0]);
    currentFlags = result.flags || [];

    renderResults(result, draft);

    // Persist key and guide
    localStorage.setItem('sc_api_key', apiKey);
    localStorage.setItem('sc_style_guide', styleGuide);

  } catch (err) {
    showError(err.message);
  } finally {
    setLoading(false);
  }
}

// ─── Reset style guide ────────────────────────────────────────────────────────

function resetGuide() {
  document.getElementById('styleGuide').value = DEFAULT_STYLE_GUIDE;
  localStorage.removeItem('sc_style_guide');
  showToast('Reset to default style guide');
}

// ─── Apply fix ────────────────────────────────────────────────────────────────

function applyFix(flagIdx) {
  const flag = currentFlags[flagIdx];
  if (!flag || !flag.original) return;

  const ta   = document.getElementById('draft');
  const idx  = ta.value.indexOf(flag.original);

  if (idx === -1) {
    showToast('Text not found — may have already been changed');
    return;
  }

  ta.value = ta.value.slice(0, idx) + (flag.replacement || '') + ta.value.slice(idx + flag.original.length);

  // Mark flag as applied
  const card = document.querySelector(`[data-flag-idx="${flagIdx}"]`);
  if (card) {
    card.classList.add('applied');
    const applyBtn = card.querySelector('.btn-apply');
    if (applyBtn) { applyBtn.textContent = 'Applied'; applyBtn.disabled = true; }
  }

  showToast('Applied — re-check when ready');
}

// ─── Find in draft ────────────────────────────────────────────────────────────

function findInDraft(searchText) {
  if (!searchText) return;
  const ta   = document.getElementById('draft');
  const text = ta.value;
  const idx  = text.toLowerCase().indexOf(searchText.toLowerCase());

  if (idx === -1) { showToast('Not found — may have already been changed'); return; }

  ta.focus();
  ta.setSelectionRange(idx, idx + searchText.length);
  ta.classList.add('found');
  setTimeout(() => ta.classList.remove('found'), 1200);

  const linesBefore = text.slice(0, idx).split('\n').length;
  const lh = parseInt(getComputedStyle(ta).lineHeight) || 24;
  ta.scrollTop = Math.max(0, linesBefore * lh - ta.clientHeight / 2);
}

// ─── Rendering ────────────────────────────────────────────────────────────────

function renderResults(result, draft) {
  const flags   = result.flags || [];
  const errors  = flags.filter(f => f.level === 'error');
  const warns   = flags.filter(f => f.level === 'warn');
  const infos   = flags.filter(f => f.level === 'info');
  const wc      = result.word_count || draft.split(/\s+/).filter(Boolean).length;

  // Score bar
  const scoreBar     = document.getElementById('scoreBar');
  const scoreNum     = document.getElementById('scoreNum');
  const scoreVerdict = document.getElementById('scoreVerdict');
  const scoreDetail  = document.getElementById('scoreDetail');
  const scoreSummary = document.getElementById('scoreSummary');

  scoreBar.classList.add('visible');
  scoreNum.textContent = flags.length;

  if (flags.length === 0) {
    scoreNum.style.color     = 'var(--green)';
    scoreVerdict.style.color = 'var(--green)';
    scoreVerdict.textContent = 'Clean';
  } else if (errors.length > 0) {
    scoreNum.style.color     = 'var(--red)';
    scoreVerdict.style.color = 'var(--red)';
    scoreVerdict.textContent = `${errors.length} hard violation${errors.length > 1 ? 's' : ''}`;
  } else {
    scoreNum.style.color     = 'var(--gold)';
    scoreVerdict.style.color = 'var(--gold)';
    scoreVerdict.textContent = 'Review needed';
  }

  scoreDetail.textContent  = `${flags.length} flag${flags.length !== 1 ? 's' : ''} · ${wc} words`;
  scoreSummary.textContent = result.summary || '';

  // Results list
  const resultsEl = document.getElementById('results');

  if (flags.length === 0) {
    resultsEl.innerHTML = `
      <div class="all-clear">
        <div class="all-clear-num">0</div>
        <div class="all-clear-label">${wc} words — no violations found</div>
      </div>`;
    return;
  }

  let html = '';

  if (errors.length) {
    html += `<div class="section-heading">Hard Rules (${errors.length})</div>`;
    errors.forEach((f, i) => { html += renderFlag(f, flags.indexOf(f)); });
  }
  if (warns.length) {
    html += `<div class="section-heading">Warnings (${warns.length})</div>`;
    warns.forEach((f, i) => { html += renderFlag(f, flags.indexOf(f)); });
  }
  if (infos.length) {
    html += `<div class="section-heading">Suggestions (${infos.length})</div>`;
    infos.forEach((f, i) => { html += renderFlag(f, flags.indexOf(f)); });
  }

  resultsEl.innerHTML = html;
}

function renderFlag(f, idx) {
  const hasFind  = !!f.quote;
  const hasApply = !!(f.original && f.replacement !== undefined);
  const findText = f.original || f.quote || '';

  const findBtn  = hasFind
    ? `<button class="btn-sm btn-find" onclick="findInDraft(${JSON.stringify(findText)})">Find</button>`
    : '';

  const applyBtn = hasApply
    ? `<button class="btn-apply" onclick="applyFix(${idx})">${esc(f.rule?.includes('contraction') || f.original?.length < 30 ? 'Apply' : 'Apply fix')}</button>`
    : '';

  const suggestionBlock = f.suggestion ? `
    <div class="suggestion">
      <div class="suggestion-tag">Try</div>
      <div class="suggestion-text">${esc(f.suggestion)}</div>
      ${applyBtn}
    </div>` : '';

  return `
    <div class="flag ${f.level}" data-flag-idx="${idx}">
      <div class="flag-body">
        <div class="flag-header">
          <div class="flag-title">${esc(f.title || f.rule)}</div>
          <div class="flag-actions">${findBtn}</div>
        </div>
        <div class="flag-rule">${esc(f.rule || '')}</div>
        <div class="flag-detail">${esc(f.detail || '')}</div>
        ${f.quote ? `<div class="flag-quote">"${esc(truncate(f.quote))}"</div>` : ''}
      </div>
      ${suggestionBlock}
    </div>`;
}

// ─── Loading / error states ───────────────────────────────────────────────────

function setLoading(on) {
  const btn = document.getElementById('checkBtn');
  const res = document.getElementById('results');

  if (on) {
    btn.disabled = true;
    btn.textContent = 'Checking…';
    res.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <div class="loading-label">Reading your style guide and draft…</div>
      </div>`;
  } else {
    btn.disabled = false;
    btn.textContent = 'Check Style';
  }
}

function showError(msg) {
  document.getElementById('results').innerHTML =
    `<div class="error-state"><div class="error-icon">⚠</div><div class="error-msg">${esc(msg)}</div></div>`;
  document.getElementById('scoreBar').classList.remove('visible');
}

function clearResults() {
  currentFlags = [];
  document.getElementById('scoreBar').classList.remove('visible');
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2200);
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function esc(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function truncate(s, max = 110) {
  s = s.trim();
  return s.length > max ? s.slice(0, max).trim() + '…' : s;
}
