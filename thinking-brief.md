# Style Checker: A Writing Style Enforcement Tool
**Chuck Hemann · April 2026**

---

## The Problem

I've written four versions of my personal writing style guide. The violations kept showing up anyway.

Not because the rules were unclear. Because reviewing a draft against a document is slow, and slow means it doesn't happen. AI-drafted content made this worse. The model knows my voice reasonably well at this point. But "reasonably well" and "right" aren't the same thing. I needed the last mile.

The gap isn't knowledge. It's friction.

---

## The Insight

Most style enforcement tools are built for teams — editorial systems, brand compliance software, workflow integrations. None of that is relevant for a single writer trying to close the gap between their own rules and their own output.

What I needed was simpler: paste a style guide, paste a draft, get violations back in seconds. No account. No installation. No friction between the rules and the writing.

The format constraints mattered. This had to run in a browser, work offline, and not require me to maintain anything. A single HTML file covers all of that.

---

## What We Built

A two-page web application deployed to GitHub Pages. No server. No backend. No login.

**Landing page (`index.html`)** — explains what the tool does and links to the tool. Clean, brand-consistent, shareable.

**Tool (`tool.html`)** — the actual checker. Two-panel layout that changes based on state:

- **Before check:** left panel is inputs (API key, style guide, draft). Right panel is empty.
- **After check:** left panel disappears. Revised Draft takes the left column. Results take the right.

The Revised Draft panel is the key UX decision. It's not a read-only preview — it's a live document that updates with every fix applied. Export buttons (Copy, .txt, .docx) sit at the top so the last step is fast.

Results are sorted by severity: hard violations first, warnings second, suggestions third. Each flag shows the violated rule, the offending text, and a specific proposed rewrite. Where the fix is mechanical (em-dash, contraction, filler phrase), there's an Apply button. Where judgment is required (structural rewrites, staccato runs), the tool flags it and proposes a direction. The writer decides.

---

## Key Decisions

**Any style guide, not just mine.** The tool ships with eight built-in examples — journalism, business, LinkedIn, technical docs, PR, executive communications, newsletter, and my own. Paste your own and it works on that too. The more specific the guide, the more specific the feedback.

**Severity tiers.** Not all violations are equal. An em-dash is a hard rule. A preamble opener is a warning. A floating data point is a suggestion. Treating them the same flattens the signal. Sorting by severity tells the writer what to fix first.

**Specific rewrites, not principles.** "Avoid passive voice" is useless feedback. "Try: 'We completed the report' instead of 'The report was completed'" is actionable. Every flag in this tool proposes a specific replacement, not a general direction.

**Apply where safe, skip where not.** One-click Apply handles mechanical fixes. Structural violations get flagged and explained, but the writer makes the call. Automating the obvious frees up attention for the judgment calls.

**Bring your own API key.** The tool calls the Anthropic API directly from the browser. The key lives in localStorage, never leaves the device. This keeps the tool free, maintenance-free, and private.

---

## Technical Choices

Built as vanilla HTML, CSS, and JavaScript — no framework, no build step, no dependencies. This was a deliberate constraint. A build step means something to maintain. A framework means something to update. Neither is appropriate for a personal tool.

The Anthropic API call uses `anthropic-dangerous-direct-browser-access: true`, which allows direct browser requests without a proxy server. Appropriate for a personal tool with a local API key; not appropriate for anything with users beyond the owner.

Export to `.docx` is handled by JSZip constructing raw Open XML in the browser — no server-side generation, no external service. It's minimal but correct: paragraphs, spacing, and encoding. Enough for Word and Google Docs to open cleanly.

Deployed to GitHub Pages. The repository is public at `chuckhemann-browns.github.io/style-checker`. Social sharing uses a custom OG image generated from the brand design and embedded via meta tags.

---

## The Outcome

A tool I use every time I check a draft before publishing. The mechanical violations — em-dashes, staccato runs, filler phrases, soft closes — get caught before a human read. The time between "done writing" and "clean draft" dropped from twenty minutes of careful re-reading to about ninety seconds.

The harder violations (peer-to-peer register, pressure-release rhythm, declarative close) still require judgment. The tool handles the scan. The writer handles the read.

That division of labor is what makes it work.

---

*Built with Claude Code · April 2026 · [chuckhemann-browns.github.io/style-checker](https://chuckhemann-browns.github.io/style-checker)*
