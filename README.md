# Style Checker

**Paste your style guide. Paste your draft. Get back specific violations, proposed rewrites, and one-click fixes.**

Built by [Chuck Hemann](https://github.com/chuckhemann). Powered by Claude.

---

## What it does

Most style guides sit in a doc no one opens. This tool puts them to work.

Upload your writing style guide — any guide, any rules — and a draft. The tool reads both, identifies every violation, proposes a specific rewrite for each one, and lets you apply fixes directly in the browser.

It ships with Chuck Hemann's personal style guide as the default. Clear it and paste your own.

---

## Features

- **Any style guide** — paste plain text, or upload a `.txt` or `.md` file
- **Any draft** — blog posts, LinkedIn posts, book chapters, newsletters
- **Violation cards** sorted by severity: hard rules → warnings → suggestions
- **Find in draft** — jumps to the exact offending text
- **Proposed rewrites** — specific, not vague
- **One-click Apply** — applies the fix directly in the textarea
- **Remembers your setup** — API key and style guide persist across sessions
- **No server** — runs entirely in the browser

---

## How to use it

### Hosted version (GitHub Pages)
Go to **[chuckhemann.github.io/style-checker](https://chuckhemann.github.io/style-checker)**

### Run locally
```bash
git clone https://github.com/chuckhemann/style-checker.git
cd style-checker
open index.html
```

No build step. No dependencies. Just open the file.

---

## Setup

You need a free Anthropic API key.

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an account and generate an API key
3. Paste it into the API Key field — it's stored in your browser only, never sent anywhere else

---

## Using your own style guide

The default is Chuck Hemann's Writing Style Guide v4. To use your own:

1. Clear the Style Guide field
2. Paste your guide as plain text — rules, vocabulary, tone preferences, structural patterns, anything
3. The more specific your guide, the more specific the feedback

**Tips for better results:**
- Label severity clearly ("hard rule," "never," "avoid," "prefer")
- List specific vocabulary swaps ("use 'use' not 'utilize'")
- Include structural rules ("open with a position, not a preamble")
- Include examples of what to do and what not to do

---

## CLI version

For terminal use — same checks, no browser needed:

```bash
node check.js draft.txt
pbpaste | node check.js
```

Note: the CLI uses pattern-matching only (no API). Good for fast passes on the hard rules.

---

## Deploy your own

1. Fork this repo
2. Go to Settings → Pages → Source: Deploy from branch → `main` / `root`
3. Your tool lives at `yourusername.github.io/style-checker`

That's it. No config. No build pipeline.

---

## Tech

Vanilla HTML, CSS, and JavaScript. No frameworks, no build step, no dependencies.

Checks are powered by [Claude](https://anthropic.com) via the Anthropic API. The style guide and draft are sent to Claude with a structured prompt that returns violations as JSON. The UI renders them as interactive flag cards.

---

## File structure

```
style-checker/
├── index.html          — main app
├── css/style.css       — all styles
├── js/checker.js       — API logic + rendering
├── check.js            — CLI checker (Node.js, pattern-matching)
├── claude-chat-prompt.md — reusable prompt for Claude Chat / ChatGPT
└── thinking-brief.md   — product thinking behind the tool
```

---

