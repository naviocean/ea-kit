#!/usr/bin/env node
/**
 * ea-kit self-test — validates agent/skill/workflow contracts.
 * Exit 0 on success, 1 on failure.
 *
 * Usage: node scripts/verify-kit.mjs
 *        npm test
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const AGENTS_DIR = path.join(ROOT, '.agents');

const FORBIDDEN_PATTERNS = [
    { re: /\bNx Monorepo\b/i, label: 'Nx Monorepo' },
    { re: /\binit-monorepo\b/i, label: 'init-monorepo' },
    { re: /\bproduct-manager\b/i, label: 'product-manager (web agent)' },
    { re: /\bfrontend-specialist\b/i, label: 'frontend-specialist' },
    { re: /\bqa-engineer\b/i, label: 'qa-engineer (web)' },
    { re: /\bworkspace-conventions\b/i, label: 'workspace-conventions (missing skill)' },
    { re: /\bredwave-architecture\b/i, label: 'redwave-architecture (missing skill)' },
];

const errors = [];
const warnings = [];

const ok = (msg) => console.log(`  ✓ ${msg}`);
const fail = (msg) => {
    errors.push(msg);
    console.log(`  ✗ ${msg}`);
};
const warn = (msg) => {
    warnings.push(msg);
    console.log(`  ! ${msg}`);
};

function listDirs(dir) {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name);
}

function listFiles(dir, ext = '.md') {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir)
        .filter((f) => f.endsWith(ext))
        .map((f) => path.join(dir, f));
}

function walkMarkdown(dir, acc = []) {
    if (!fs.existsSync(dir)) return acc;
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, ent.name);
        if (ent.isDirectory()) walkMarkdown(full, acc);
        else if (ent.name.endsWith('.md')) acc.push(full);
    }
    return acc;
}

function parseFrontmatter(content) {
    if (!content.startsWith('---')) return { data: {}, body: content };
    const end = content.indexOf('\n---', 3);
    if (end === -1) return { data: {}, body: content };
    const raw = content.slice(3, end).trim();
    const body = content.slice(end + 4);
    const data = {};
    // skills: as YAML list or inline
    const skillsBlock = raw.match(/^skills:\s*\n((?:[ \t]+-\s+.+\n?)*)/m);
    if (skillsBlock) {
        data.skills = skillsBlock[1]
            .split('\n')
            .map((l) => l.replace(/^\s*-\s*/, '').trim())
            .filter(Boolean);
    } else {
        const skillsInline = raw.match(/^skills:\s*(.+)$/m);
        if (skillsInline) {
            data.skills = skillsInline[1].split(',').map((s) => s.trim()).filter(Boolean);
        }
    }
    const name = raw.match(/^name:\s*(.+)$/m);
    if (name) data.name = name[1].trim();
    const desc = raw.match(/^description:\s*(.+)$/m);
    if (desc) data.description = desc[1].trim();
    return { data, body };
}

function skillExists(skillName, skillDirs) {
    // skills live as .agents/skills/<name>/ or nested gitnexus/*
    if (skillDirs.has(skillName)) return true;
    // nested: gitnexus-exploring under skills/gitnexus/
    const nested = path.join(AGENTS_DIR, 'skills', 'gitnexus', skillName, 'SKILL.md');
    if (fs.existsSync(nested)) return true;
    const flat = path.join(AGENTS_DIR, 'skills', skillName, 'SKILL.md');
    return fs.existsSync(flat);
}

function collectSkillNames() {
    const names = new Set();
    const skillsRoot = path.join(AGENTS_DIR, 'skills');
    for (const name of listDirs(skillsRoot)) {
        const skillMd = path.join(skillsRoot, name, 'SKILL.md');
        if (fs.existsSync(skillMd)) names.add(name);
        // nested skill packages (gitnexus/*)
        const sub = path.join(skillsRoot, name);
        for (const child of listDirs(sub)) {
            if (fs.existsSync(path.join(sub, child, 'SKILL.md'))) {
                names.add(child);
                names.add(`${name}/${child}`);
            }
        }
    }
    return names;
}

console.log('\nea-kit verify\n');

// --- Structure ---
console.log('Structure');
if (!fs.existsSync(AGENTS_DIR)) fail('.agents/ missing');
else ok('.agents/ present');

const agentFiles = listFiles(path.join(AGENTS_DIR, 'agents'));
const workflowFiles = listFiles(path.join(AGENTS_DIR, 'workflows')).filter(
    (f) => path.basename(f) !== 'README.md'
);
const skillNames = collectSkillNames();

if (agentFiles.length === 0) fail('no agent files under .agents/agents/');
else ok(`${agentFiles.length} agent file(s)`);

if (workflowFiles.length === 0) fail('no workflow files under .agents/workflows/');
else ok(`${workflowFiles.length} workflow file(s)`);

if (skillNames.size === 0) fail('no skills under .agents/skills/');
else ok(`${skillNames.size} skill name(s) discoverable`);

const expectedAgents = [
    'algo-strategist',
    'mql5-expert',
    'cbot-expert',
    'ea-tester',
    'documentation-writer',
];
const agentBasenames = new Set(agentFiles.map((f) => path.basename(f, '.md')));
for (const a of expectedAgents) {
    if (agentBasenames.has(a)) ok(`agent ${a}.md`);
    else fail(`missing expected agent ${a}.md`);
}

const expectedWorkflows = ['brainstorm', 'plan', 'orchestrate', 'test'];
const workflowBasenames = new Set(workflowFiles.map((f) => path.basename(f, '.md')));
for (const w of expectedWorkflows) {
    if (workflowBasenames.has(w)) ok(`workflow ${w}.md`);
    else fail(`missing expected workflow ${w}.md`);
}

// --- Agent → skill refs ---
console.log('\nAgent skill references');
for (const file of agentFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const { data } = parseFrontmatter(content);
    const base = path.basename(file);
    if (!data.skills || data.skills.length === 0) {
        warn(`${base}: no skills: in frontmatter`);
        continue;
    }
    for (const skill of data.skills) {
        if (skillExists(skill, skillNames)) ok(`${base} → ${skill}`);
        else fail(`${base} references missing skill "${skill}"`);
    }
}

// --- Workflows mention only known agents ---
console.log('\nWorkflow agent references');
const knownAgents = agentBasenames;
// Also catch obvious wrong personas
const ghostAgents = [
    'product-manager',
    'team-lead',
    'frontend-specialist',
    'qa-engineer',
    'ui-ux-designer',
];

for (const file of workflowFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const base = path.basename(file);
    for (const ghost of ghostAgents) {
        if (content.includes(ghost)) {
            fail(`${base} mentions ghost agent "${ghost}"`);
        }
    }
    // orchestrate/plan should mention at least one real agent
    const found = new Set();
    let m;
    const re = new RegExp(`\\b(${[...knownAgents].join('|')})\\b`, 'g');
    while ((m = re.exec(content)) !== null) found.add(m[1]);
    if (found.size === 0 && base !== 'README.md') {
        warn(`${base}: no known agent names found`);
    } else if (found.size > 0) {
        ok(`${base} references: ${[...found].join(', ')}`);
    }
}

// Workflows README
const wfReadme = path.join(AGENTS_DIR, 'workflows', 'README.md');
if (fs.existsSync(wfReadme)) {
    const content = fs.readFileSync(wfReadme, 'utf-8');
    for (const ghost of ghostAgents) {
        if (content.includes(ghost)) fail(`workflows/README.md mentions ghost agent "${ghost}"`);
    }
    for (const label of FORBIDDEN_PATTERNS) {
        if (label.re.test(content)) fail(`workflows/README.md contains forbidden: ${label.label}`);
    }
    ok('workflows/README.md scanned');
}

// --- Forbidden monorepo ghosts in .agents ---
console.log('\nForbidden legacy strings in .agents');
const mdFiles = walkMarkdown(AGENTS_DIR);
let ghostHits = 0;
for (const file of mdFiles) {
    const rel = path.relative(ROOT, file);
    // skip vendor bulk docs that might mention unrelated things? scan all
    const content = fs.readFileSync(file, 'utf-8');
    for (const { re, label } of FORBIDDEN_PATTERNS) {
        if (re.test(content)) {
            fail(`${rel}: forbidden pattern "${label}"`);
            ghostHits++;
        }
    }
}
if (ghostHits === 0) ok(`no forbidden patterns in ${mdFiles.length} markdown files`);

// --- package identity ---
console.log('\nPackage identity');
const pkgPath = path.join(ROOT, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
if (pkg.name === 'ea-kit') ok(`package.name = ea-kit`);
else fail(`package.name is "${pkg.name}", expected "ea-kit"`);
if (pkg.bin && pkg.bin['ea-kit']) ok('bin.ea-kit mapped');
else fail('bin.ea-kit missing');
if (pkg.bin && pkg.bin['redwavelabs-kit']) fail('legacy bin redwavelabs-kit still present');

// --- others/ is not shipped ---
console.log('\nPackage files');
if (Array.isArray(pkg.files) && pkg.files.includes('others')) {
    fail('package.files must not ship others/');
} else {
    ok('others/ not in package.files');
}
if (fs.existsSync(path.join(ROOT, 'others'))) {
    if (fs.existsSync(path.join(ROOT, 'others', 'README.md'))) ok('others/README.md present');
    else warn('others/ exists without README.md');
}

// --- Harness v0.1 contracts ---
console.log('\nHarness v0.1');
const geminiPath = path.join(AGENTS_DIR, 'rules', 'GEMINI.md');
if (!fs.existsSync(geminiPath)) {
    fail('missing .agents/rules/GEMINI.md');
} else {
    const gemini = fs.readFileSync(geminiPath, 'utf-8');
    const requiredSnippets = [
        { re: /RequestClass|class=`trivial`|class=\`trivial\`|`trivial`/, label: 'RequestClass / trivial class' },
        { re: /rwcommon/i, label: 'rwcommon policy' },
        { re: /optional/i, label: 'flexible/optional rwcommon (not always-only)' },
        { re: /HANDOFF/, label: 'HANDOFF' },
        { re: /SESSION/, label: 'SESSION conditional' },
        { re: /VERIFY-PROFILES|verify_profile|mt5-code/, label: 'verify profiles' },
        { re: /mode=`plan`|mode=\`plan\`|mode.*plan/i, label: 'mode machine' },
    ];
    for (const { re, label } of requiredSnippets) {
        if (re.test(gemini)) ok(`GEMINI.md: ${label}`);
        else fail(`GEMINI.md missing harness piece: ${label}`);
    }
    // Must NOT require 3 questions before ANY tool for all requests
    if (/Every user request must pass through the Socratic Gate before ANY tool/i.test(gemini)) {
        fail('GEMINI.md still has old always-Socratic-before-ANY-tool rule');
    } else {
        ok('GEMINI.md: no always-Socratic-before-ANY-tool');
    }
}

const harnessFiles = [
    'docs/v1.0/4-tasks/HANDOFF.template.md',
    'docs/v1.0/4-tasks/SESSION.template.md',
    'docs/architecture/VERIFY-PROFILES.md',
    'docs/architecture/DESIGN-agent-harness.md',
    'docs/architecture/ADR-003-agent-harness.md',
];
for (const rel of harnessFiles) {
    if (fs.existsSync(path.join(ROOT, rel))) ok(`present ${rel}`);
    else fail(`missing ${rel}`);
}

const orch = path.join(AGENTS_DIR, 'workflows', 'orchestrate.md');
if (fs.existsSync(orch)) {
    const t = fs.readFileSync(orch, 'utf-8');
    if (/class=`orchestrate`|class=\`orchestrate\`|class.*orchestrate/i.test(t) && /HANDOFF/i.test(t) && /SESSION/i.test(t)) {
        ok('orchestrate.md: class + HANDOFF + SESSION');
    } else {
        fail('orchestrate.md missing harness wiring (class/HANDOFF/SESSION)');
    }
}

const brainstormSkill = path.join(AGENTS_DIR, 'skills', 'brainstorming', 'SKILL.md');
if (fs.existsSync(brainstormSkill)) {
    const t = fs.readFileSync(brainstormSkill, 'utf-8');
    if (/Port Conflict/i.test(t)) fail('brainstorming skill still has web Port Conflict category');
    else ok('brainstorming: no web Port Conflict');
    if (/trivial/i.test(t) && (/bugfix/i.test(t) || /bug fix/i.test(t))) {
        ok('brainstorming: scopes out trivial/bugfix');
    } else {
        warn('brainstorming: should mention skipping trivial/bugfix');
    }
}

// --- Summary ---
console.log('\n────────────────────────────────────────');
if (warnings.length) console.log(chalkyWarnings(warnings.length));
if (errors.length) {
    console.log(`FAILED: ${errors.length} error(s), ${warnings.length} warning(s)\n`);
    process.exit(1);
}
console.log(`PASSED: ${warnings.length} warning(s)\n`);
process.exit(0);

function chalkyWarnings(n) {
    return `Warnings: ${n}`;
}
