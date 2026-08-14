#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fixturesDir = path.join(root, '.agents', 'fixtures', 'harness');
const failures = [];
const validClasses = new Set(['trivial', 'bugfix', 'analyze', 'strategy', 'feature', 'orchestrate', 'docs', 'meta']);
const validModes = new Set(['implement', 'review', 'plan']);
const validProfiles = new Set(['mt5-code', 'cbot-code', 'analyze-only', 'docs-only', 'kit-meta']);

function classify(prompt) {
    const text = prompt.toLowerCase();
    if (/harness|ea-kit|agent kit/.test(text)) return 'meta';
    if (/readme|\badr\b|changelog|tài liệu|documentation/.test(text)) return 'docs';
    if (/end-to-end|full (ea|ctrader|cbot)|orchestrate/.test(text)) return 'orchestrate';
    if (/strategy tester|backtest|journal|\bpf\b|drawdown|\bdd\b|phân tích/.test(text)) return 'analyze';
    if (/lỗi|error|compile|10016|10013|4756|bug/.test(text)) return 'bugfix';
    if (/chiến lược|strategy|entry|breakout|mean reversion/.test(text)) return 'strategy';
    if (/thêm|add|feature|multi.module|nhiều module/.test(text)) return 'feature';
    return 'trivial';
}

function route(prompt) {
    const requestClass = classify(prompt);
    const isCbot = /ctrader|cbot|c#/.test(prompt.toLowerCase());
    if (requestClass === 'meta') return { class: requestClass, mode: 'implement', persona: 'kit-maintainer', verify_profile: 'kit-meta' };
    if (requestClass === 'docs') return { class: requestClass, mode: 'implement', persona: 'documentation-writer', verify_profile: 'docs-only' };
    if (requestClass === 'analyze') return { class: requestClass, mode: 'review', persona: 'ea-tester', verify_profile: 'analyze-only' };
    if (['strategy', 'feature', 'orchestrate'].includes(requestClass)) return { class: requestClass, mode: 'plan', persona: 'algo-strategist', verify_profile: 'docs-only' };
    return { class: requestClass, mode: 'implement', persona: isCbot ? 'cbot-expert' : 'mql5-expert', verify_profile: isCbot ? 'cbot-code' : 'mt5-code' };
}

function fail(message) { failures.push(message); console.log(`  ✗ ${message}`); }

function verifyFixture(fixture, source) {
    if (!fixture.id || !fixture.prompt || !fixture.expect) return fail(`${source}: id, prompt, and expect are required`);
    const expected = fixture.expect;
    if (!validClasses.has(expected.class) || !validModes.has(expected.mode) || !validProfiles.has(expected.verify_profile) || !expected.persona) return fail(`${fixture.id}: invalid expected route`);
    const actual = route(fixture.prompt);
    const mismatches = Object.keys(expected).filter((key) => actual[key] !== expected[key]);
    if (mismatches.length) return fail(`${fixture.id}: ${mismatches.map((key) => `${key}=${actual[key]} (expected ${expected[key]})`).join(', ')}`);
    console.log(`  ✓ ${fixture.id} → ${actual.class}/${actual.mode}/${actual.persona}`);
}

console.log('\nea-kit harness contracts\n');
if (!fs.existsSync(fixturesDir)) fail('missing .agents/fixtures/harness/');
else {
    const files = fs.readdirSync(fixturesDir).filter((file) => file.startsWith('routing') && file.endsWith('.json'));
    if (!files.length) fail('no harness fixture files');
    for (const file of files) {
        try {
            const fixtures = JSON.parse(fs.readFileSync(path.join(fixturesDir, file), 'utf8'));
            if (!Array.isArray(fixtures)) fail(`${file}: expected a JSON array`);
            else fixtures.forEach((fixture) => verifyFixture(fixture, file));
        } catch (error) { fail(`${file}: ${error.message}`); }
    }
}

if (failures.length) { console.log(`\nFAILED: ${failures.length} harness contract(s)\n`); process.exit(1); }
console.log('\nPASSED: harness contracts\n');
