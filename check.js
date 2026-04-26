#!/usr/bin/env node
// Chuck Hemann Style Checker — CLI
// Usage: node check.js draft.txt
//        cat draft.txt | node check.js

import fs from 'fs';

const RESET = '\x1b[0m';
const RED   = '\x1b[31m';
const GOLD  = '\x1b[33m';
const BLUE  = '\x1b[34m';
const GREEN = '\x1b[32m';
const BOLD  = '\x1b[1m';
const DIM   = '\x1b[2m';

const FORMAL_WORDS = [
  'utilize','utilizes','utilized','utilizing',
  'leverage','leverages','leveraged','leveraging',
  'facilitate','facilitates','facilitated','facilitating',
  'endeavor','endeavors','endeavored','endeavoring',
  'subsequently','aforementioned','herein','thereof',
  'implementation','implementations',
  'operationalize','operationalizes',
  'synergize','synergies','synergy',
  'paradigm shift','paradigm',
  'holistic approach','holistic',
  'going forward',
  'at this point in time',
  'in order to',
  'it should be noted',
  'it is important to note',
  'needless to say',
  'as per',
  'circle back','touch base',
  'move the needle',
  'best practices',
  'deep dive',
  'low-hanging fruit',
  'value add',
  'actionable insights',
  'robust solution',
  'scalable','impactful'
];

const SOFT_CTA_PHRASES = [
  "feel free to",
  "don't hesitate to",
  "let me know your thoughts",
  "let me know what you think",
  "share your thoughts",
  "share your feedback",
  "i'd love to hear",
  "i would love to hear",
  "what do you think",
  "thoughts?",
  "drop a comment",
  "leave a comment",
  "curious what you think"
];

const PASSIVE_PATTERNS = [
  /\b(is|are|was|were|be|been|being)\s+([\w]+ed)\b/gi,
  /\bshould be (developed|built|created|considered|evaluated|implemented|reviewed|addressed|explored|examined|analyzed)\b/gi,
  /\bcan be (done|improved|increased|reduced|used|applied|seen)\b/gi,
  /\bwill be (handled|managed|addressed|completed|reviewed)\b/gi,
  /\bmust be (followed|considered|implemented|noted|addressed)\b/gi
];

const CONTRACTION_MAP = [
  [/\bdo not\b/gi, "don't"],
  [/\bdoes not\b/gi, "doesn't"],
  [/\bdid not\b/gi, "didn't"],
  [/\bwill not\b/gi, "won't"],
  [/\bwould not\b/gi, "wouldn't"],
  [/\bcould not\b/gi, "couldn't"],
  [/\bshould not\b/gi, "shouldn't"],
  [/\bcannot\b/gi, "can't"],
  [/\bit is\b/gi, "it's"],
  [/\bthat is\b/gi, "that's"],
  [/\bthey are\b/gi, "they're"],
  [/\byou are\b/gi, "you're"],
  [/\bwe are\b/gi, "we're"],
  [/\bI am\b/g, "I'm"],
  [/\bI have\b/g, "I've"],
  [/\byou have\b/gi, "you've"],
  [/\bwe have\b/gi, "we've"],
  [/\bthey have\b/gi, "they've"],
];

function getSentences(text) {
  return text.match(/[^.!?]+[.!?]+/g) || [];
}

function wordCount(sentence) {
  return sentence.trim().split(/\s+/).filter(Boolean).length;
}

function truncate(str, max = 90) {
  str = str.trim();
  return str.length > max ? str.slice(0, max).trim() + '…' : str;
}

function printFlag(level, title, detail, quote) {
  const color = level === 'error' ? RED : level === 'warn' ? GOLD : BLUE;
  const tag = level === 'error' ? '[HARD RULE]' : level === 'warn' ? '[WARNING] ' : '[SUGGEST] ';
  console.log(`${color}${BOLD}${tag}${RESET} ${BOLD}${title}${RESET}`);
  console.log(`         ${DIM}${detail}${RESET}`);
  if (quote) console.log(`         ${DIM}→ ${quote}${RESET}`);
  console.log();
}

function runChecks(text) {
  const flags = { error: 0, warn: 0, info: 0 };
  const sentences = getSentences(text);
  const lower = text.toLowerCase();

  console.log(`\n${BOLD}Chuck Hemann Style Checker${RESET} ${DIM}— v4${RESET}\n`);
  console.log(`${DIM}Word count: ${text.split(/\s+/).filter(Boolean).length}${RESET}\n`);
  console.log('─'.repeat(60));

  // 1. Em-dashes
  const emDashes = [...text.matchAll(/—/g)];
  if (emDashes.length) {
    flags.error++;
    const ctx = text.slice(Math.max(0, emDashes[0].index - 35), emDashes[0].index + 35);
    printFlag('error',
      `Em-dash found (${emDashes.length} instance${emDashes.length > 1 ? 's' : ''})`,
      'Hard rule. No em-dashes, ever. Use a period, comma, or parentheses.',
      '…' + ctx.trim() + '…'
    );
  }

  // 2. Soft/question close
  const lastSentence = sentences[sentences.length - 1] || '';
  const lastLower = lastSentence.toLowerCase();
  if (lastSentence.trim().endsWith('?')) {
    flags.error++;
    printFlag('error',
      'Closes on a question',
      'Close declaratively. Final sentence must be a statement.',
      truncate(lastSentence)
    );
  }
  for (const phrase of SOFT_CTA_PHRASES) {
    if (lastLower.includes(phrase)) {
      flags.error++;
      printFlag('error',
        'Soft CTA in closing',
        `"${phrase}" — the argument does the work. Cut it.`,
        truncate(lastSentence)
      );
      break;
    }
  }

  // 3. Staccato runs
  let run = 0, runStart = -1;
  for (let i = 0; i < sentences.length; i++) {
    if (wordCount(sentences[i]) <= 10) {
      if (run === 0) runStart = i;
      run++;
      if (run >= 3) {
        flags.error++;
        const excerpt = sentences.slice(runStart, runStart + 3).map(s => s.trim()).join(' ');
        printFlag('error',
          'Staccato run (3+ short sentences in a row)',
          'Short sentences need setup to land. Without contrast, it\'s choppiness.',
          truncate(excerpt, 100)
        );
        run = 0;
      }
    } else {
      run = 0;
    }
  }

  // 4. Missing contractions
  const contractionHits = [];
  for (const [pattern, suggestion] of CONTRACTION_MAP) {
    const matches = [...text.matchAll(pattern)];
    if (matches.length) contractionHits.push({ formal: matches[0][0], suggestion, count: matches.length });
  }
  if (contractionHits.length >= 3) {
    flags.warn++;
    const examples = contractionHits.slice(0, 3).map(h => `"${h.formal}" → "${h.suggestion}"`).join(', ');
    printFlag('warn',
      `Formal constructions instead of contractions (${contractionHits.reduce((a, h) => a + h.count, 0)} instances)`,
      'Contractions are core to your register. No contractions = doesn\'t sound like you.',
      examples
    );
  } else if (contractionHits.length > 0) {
    flags.info++;
    const examples = contractionHits.map(h => `"${h.formal}" → "${h.suggestion}"`).join(', ');
    printFlag('info',
      'Possible contraction opportunities',
      'Consider contracting these where they fit naturally.',
      examples
    );
  }

  // 5. Passive voice
  const passiveHits = [];
  for (const pattern of PASSIVE_PATTERNS) {
    for (const m of text.matchAll(pattern)) {
      if (!passiveHits.includes(m[0])) passiveHits.push(m[0]);
    }
  }
  if (passiveHits.length) {
    flags.warn++;
    printFlag('warn',
      `Passive voice (${passiveHits.length} instance${passiveHits.length > 1 ? 's' : ''})`,
      'Rewrite key arguments as active voice.',
      passiveHits.slice(0, 4).map(h => `"${h}"`).join(', ')
    );
  }

  // 6. Buzzwords
  const formalHits = [];
  for (const word of FORMAL_WORDS) {
    const regex = new RegExp(`\\b${word.replace(/\s+/g, '\\s+')}\\b`, 'gi');
    if (regex.test(text)) formalHits.push(word);
  }
  if (formalHits.length) {
    flags.warn++;
    printFlag('warn',
      `Buzzwords / over-formal vocabulary (${formalHits.length})`,
      'Say it like you would in a meeting, not a report.',
      formalHits.slice(0, 6).join(', ')
    );
  }

  // 7. Soft CTAs in body
  const softAnywhere = [];
  for (const phrase of SOFT_CTA_PHRASES) {
    if (lower.includes(phrase) && !lastLower.includes(phrase)) {
      softAnywhere.push(`"${phrase}"`);
    }
  }
  if (softAnywhere.length) {
    flags.warn++;
    printFlag('warn',
      'Soft CTA language in body',
      'Cut or rephrase — you don\'t invite readers to share thoughts mid-piece.',
      softAnywhere.join(', ')
    );
  }

  // 8. Preamble opener
  const firstSentence = sentences[0] || '';
  const preamblePatterns = [
    /^in today.s (fast[- ]paced|digital|ever[- ]changing|complex)/i,
    /^in (recent|today.s|the current)/i,
    /^as (we|you|many|most|organizations|companies|businesses)/i,
    /^it.s (no secret|well known|widely known|common knowledge)/i,
    /^everyone knows/i,
    /^we.ve all (heard|seen|been)/i
  ];
  for (const p of preamblePatterns) {
    if (p.test(firstSentence.trim())) {
      flags.warn++;
      printFlag('warn',
        'Preamble opener',
        'If you can cut it and the point still lands, cut it. Open with a position.',
        truncate(firstSentence)
      );
      break;
    }
  }

  // 9. Data without so-what
  const dataPattern = /(\d+%|\d+ percent|according to|research (shows|finds|found|suggests)|studies show|data (shows|suggests)|survey (found|shows))/gi;
  const dataMatches = [...text.matchAll(dataPattern)];
  const dataWithoutSoWhat = [];
  for (const m of dataMatches) {
    const sentenceIdx = sentences.findIndex(s => s.includes(m[0]));
    if (sentenceIdx !== -1) {
      const next = sentences[sentenceIdx + 1] || '';
      const hasSoWhat = /\b(so|which means|that means|meaning|this means|this suggests|in other words|the takeaway|what that means)\b/i.test(next);
      if (!hasSoWhat) dataWithoutSoWhat.push(truncate(sentences[sentenceIdx], 75));
    }
  }
  if (dataWithoutSoWhat.length) {
    flags.info++;
    printFlag('info',
      'Data point may be missing a "so what"',
      'Always translate data into a takeaway. Information without application is just content.',
      dataWithoutSoWhat[0]
    );
  }

  // Summary
  console.log('─'.repeat(60));
  const total = flags.error + flags.warn + flags.info;
  if (total === 0) {
    console.log(`\n${GREEN}${BOLD}All clear.${RESET} ${DIM}No style violations found.${RESET}\n`);
  } else {
    const parts = [];
    if (flags.error) parts.push(`${RED}${flags.error} hard rule${flags.error > 1 ? 's' : ''}${RESET}`);
    if (flags.warn)  parts.push(`${GOLD}${flags.warn} warning${flags.warn > 1 ? 's' : ''}${RESET}`);
    if (flags.info)  parts.push(`${BLUE}${flags.info} suggestion${flags.info > 1 ? 's' : ''}${RESET}`);
    console.log(`\n${BOLD}${total} issue${total > 1 ? 's' : ''}:${RESET} ${parts.join('  ')}\n`);
  }
}

// Read from file arg or stdin
if (process.argv[2]) {
  const text = fs.readFileSync(process.argv[2], 'utf8');
  runChecks(text);
} else if (!process.stdin.isTTY) {
  let text = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => text += chunk);
  process.stdin.on('end', () => runChecks(text));
} else {
  console.error('Usage: node check.js draft.txt\n       cat draft.txt | node check.js');
  process.exit(1);
}
