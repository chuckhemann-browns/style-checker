# Writing Style Enforcement Tools
**Chuck Hemann · April 2026**

---

## The Problem

I've been writing the same style guide for four versions. The rules are clear. The violations keep showing up anyway — in AI-drafted content, in first passes, in anything written at speed. The gap isn't knowledge. It's friction. Reviewing a draft against a document is slow, and "slow" means it doesn't happen.

The solution isn't a better style guide. It's removing the friction between the rules and the draft.

---

## What We Built

Three tools, one purpose: make it faster to write like me than to write like a corporate blog.

### 1. Browser Tool (`index.html`)

A self-contained HTML file. Open in any browser. Paste a draft. Hit Check Style.

No server. No login. No dependencies. Drag to a bookmark bar and it's always there.

**What it checks:**

- Em-dashes (hard rule — no exceptions, no format)
- Soft closes and trailing CTAs
- Staccato runs (3+ consecutive short sentences)
- Missing contractions
- Passive voice in key arguments
- Buzzwords and over-formal vocabulary
- Preamble openers
- Data points without a "so what"
- Soft CTA language in the body

**How it works:**

Violations are sorted into three tiers: hard rules (must fix), warnings (should fix), suggestions (consider fixing). Every flag shows the offending text, explains why it's a problem, and proposes a specific rewrite. Most have an Apply button that makes the change and re-checks automatically.

The things that can't be auto-applied — staccato runs, data interpretation — require judgment. The tool finds them and shows you what to do. You make the call.

---

### 2. CLI Script (`check.js`)

Same checks, terminal output. Useful when drafting in a text editor or when you want to pipe clipboard content through.

```bash
node check.js draft.txt
pbpaste | node check.js
```

Color-coded: red for hard rules, gold for warnings, blue for suggestions. Summary line at the end. Fast.

---

### 3. Reusable AI Prompt (`claude-chat-prompt.md`)

A system prompt that turns any AI session — Claude Chat, ChatGPT, Gemini — into a style checker. Paste it as your first message. Paste your draft next. The AI applies the full style guide and flags violations in order of severity.

Useful when you're already in a chat window drafting something and want inline feedback without switching tools.

---

## The Thinking

**Rule hierarchy matters.** Not all violations are equal. An em-dash is a hard rule. A preamble opener is a warning. A data point without interpretation is a suggestion. Treating them the same flattens the signal. The tool sorts by severity so you know what to fix first.

**Specific beats general.** "Avoid passive voice" is useless feedback. "Try: 'Develop your strategy' instead of 'strategies should be developed'" is actionable. Every flag in this tool proposes a specific rewrite, not a principle.

**Apply where safe, find where not.** Some violations have unambiguous fixes — em-dashes, contractions, soft CTAs. The tool applies those in one click. Others require judgment — merging staccato sentences, writing a "so what," reframing a question as a statement. The tool finds those and proposes a direction. The writer decides.

**Three tools for three contexts.** The browser tool is for intentional review. The CLI is for fast terminal checks. The prompt is for AI-assisted drafting. Same rules, different surfaces. Pick whichever has the least friction at the moment.

---

## The Rules Behind the Tool

The full source is the *Chuck Hemann Writing Style Guide v4* (April 2026). The tool enforces the mechanical rules — the ones that can be detected with pattern matching. The harder rules (peer-to-peer reader assumption, pressure-then-release rhythm, closing declaratively) still require a human read.

The checklist at the end of the style guide is the final gate. The tool handles the scan. The checklist handles the judgment.

---

## What's Not Here

These violations exist in the style guide but aren't in the tool yet:

- **Pop culture references not connected back to the business point** — requires semantic understanding
- **Numbered frameworks with no connective tissue** — structural, not pattern-detectable
- **Writing for a student, not a peer** — tone judgment, not a string match

A future version could route flagged drafts through the Claude API for semantic checks. The mechanical layer is solid. The judgment layer is next.

---

*Built with Claude Code · Style Guide v4*
