# Style Checker

**Paste your style guide. Paste your draft. Get back specific violations, proposed rewrites, and one-click fixes.**

Built by [Chuck Hemann](https://github.com/chuckhemann-browns). Powered by Claude.

---

## What it does

Most style guides sit in a doc no one opens. This tool puts them to work.

Upload your writing style guide — any guide, any rules — and a draft. The tool reads both, identifies every violation, proposes a specific rewrite for each one, and lets you apply fixes directly in the browser. When you're done, export your revised draft as a .txt or .docx file.

No default style guide is pre-loaded. Start from one of eight built-in examples or paste your own.

---

## Features

- **Any style guide** — paste plain text, or upload a `.txt` or `.md` file
- **Any draft** — blog posts, LinkedIn posts, book chapters, newsletters, press releases
- **Violation cards** sorted by severity: hard rules → warnings → suggestions
- **Find in draft** — jumps to the exact offending text
- **Proposed rewrites** — specific, not vague
- **One-click Apply** — applies the fix directly in the editor
- **Revised Draft panel** — live view of your draft as fixes are applied
- **Export** — download your revised draft as `.txt` or `.docx`, or copy to clipboard
- **Reset** — clear draft and results to start fresh without losing your style guide or API key
- **Remembers your setup** — API key and style guide persist across sessions
- **No server** — runs entirely in the browser

---

## How to use it

### Hosted version (GitHub Pages)
Go to **[chuckhemann-browns.github.io/style-checker](https://chuckhemann-browns.github.io/style-checker)**

### Run locally
```bash
git clone https://github.com/chuckhemann-browns/style-checker.git
cd style-checker
open index.html
```

No build step. No server required. Open `index.html` for the landing page, `tool.html` for the tool directly.

---

## Setup

You need a free Anthropic API key.

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an account and generate an API key
3. Paste it into the API Key field in the tool — it's stored in your browser only, never transmitted anywhere except directly to the Anthropic API

---

## Using your own style guide

No default guide is pre-loaded. Eight examples are available as starting points:

- Chuck Hemann's Style Guide (April 2026)
- Journalism (AP-influenced)
- Business Writing
- Newsletter & Email
- LinkedIn & Thought Leadership
- Technical Writing & Documentation
- PR & Press Release
- Executive Communications

To use your own: paste it as plain text or upload a `.txt` or `.md` file.

**Tips for better results:**
- Label severity clearly ("hard rule," "never," "avoid," "prefer")
- List specific vocabulary swaps ("use 'use' not 'utilize'")
- Include structural rules ("open with a position, not a preamble")
- Include examples of what to do and what not to do

---

## CLI version

For terminal use — pattern-matching only, no API required:

```bash
node check.js draft.txt
pbpaste | node check.js
```

Color-coded output: red for hard rules, gold for warnings, blue for suggestions. Good for fast passes without leaving the terminal.

---

## Deploy your own

1. Fork this repo
2. Go to Settings → Pages → Source: Deploy from branch → `main` / `root`
3. Your tool lives at `yourusername.github.io/style-checker`

No config. No build pipeline.

---

## Tech

Vanilla HTML, CSS, and JavaScript. No frameworks, no build step.

Checks are powered by [Claude](https://anthropic.com) via the Anthropic API — called directly from the browser using Anthropic's supported browser access header. The style guide and draft are sent to Claude with a structured prompt that returns violations as JSON. The UI renders them as interactive flag cards.

`.docx` export uses [JSZip](https://stuk.github.io/jszip/) to construct a valid Open XML document in the browser.

---

## File structure

```
style-checker/
├── index.html              — landing page
├── tool.html               — the tool
├── check.js                — CLI checker (Node.js, pattern-matching)
├── claude-chat-prompt.md   — reusable prompt for Claude Chat / ChatGPT
└── thinking-brief.md       — product thinking behind the tool
```
