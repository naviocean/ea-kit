#!/usr/bin/env node

/**
 * ea-kit Harness Compliance & Benchmark Evaluation Runner
 * Evaluates harness rule compliance across request routing, sequential Socratic gate,
 * evidence & verification honesty, and trading policy.
 *
 * Usage:
 *   node scripts/eval-harness.mjs
 *   node scripts/eval-harness.mjs --verbose
 *   node scripts/eval-harness.mjs --filter=socratic
 *   node scripts/eval-harness.mjs --json
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { evaluateFixture } from './lib/compliance-grader.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const FIXTURES_DIR = path.join(ROOT, '.agents', 'fixtures', 'harness');

// Parse CLI flags
const args = process.argv.slice(2);
const isVerbose = args.includes('--verbose') || args.includes('-v');
const isJson = args.includes('--json');
const filterArg = args.find((a) => a.startsWith('--filter='));
const filter = filterArg ? filterArg.split('=')[1].toLowerCase() : null;

// ============================================================================
// ROUTING EVALUATION
// ============================================================================

function classifyPrompt(prompt) {
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

function routePrompt(prompt) {
    const requestClass = classifyPrompt(prompt);
    const isCbot = /ctrader|cbot|c#/.test(prompt.toLowerCase());
    if (requestClass === 'meta') return { class: requestClass, mode: 'implement', persona: 'kit-maintainer', verify_profile: 'kit-meta' };
    if (requestClass === 'docs') return { class: requestClass, mode: 'implement', persona: 'documentation-writer', verify_profile: 'docs-only' };
    if (requestClass === 'analyze') return { class: requestClass, mode: 'review', persona: 'ea-tester', verify_profile: 'analyze-only' };
    if (['strategy', 'feature', 'orchestrate'].includes(requestClass)) return { class: requestClass, mode: 'plan', persona: 'algo-strategist', verify_profile: 'docs-only' };
    return { class: requestClass, mode: 'implement', persona: isCbot ? 'cbot-expert' : 'mql5-expert', verify_profile: isCbot ? 'cbot-code' : 'mt5-code' };
}

function evalRoutingFixtures() {
    const routingFile = path.join(FIXTURES_DIR, 'routing.json');
    if (!fs.existsSync(routingFile)) return { total: 0, passed: 0, results: [] };

    const fixtures = JSON.parse(fs.readFileSync(routingFile, 'utf-8'));
    const results = [];
    let passed = 0;

    for (const item of fixtures) {
        if (filter && !item.id.toLowerCase().includes(filter)) continue;
        const actual = routePrompt(item.prompt);
        const expected = item.expect;
        const isMatch = Object.keys(expected).every((k) => actual[k] === expected[k]);
        if (isMatch) passed++;
        results.push({
            id: item.id,
            category: 'routing',
            prompt: item.prompt,
            expected,
            actual,
            pass: isMatch,
        });
    }

    return { total: results.length, passed, results };
}

// ============================================================================
// COMPLIANCE EVALUATION
// ============================================================================

function evalComplianceFixtures() {
    const complianceFile = path.join(FIXTURES_DIR, 'compliance-eval.json');
    if (!fs.existsSync(complianceFile)) return { total: 0, passed: 0, results: [] };

    const fixtures = JSON.parse(fs.readFileSync(complianceFile, 'utf-8'));
    const results = [];
    let passed = 0;

    for (const item of fixtures) {
        if (filter && !item.id.toLowerCase().includes(filter) && !item.category.toLowerCase().includes(filter)) continue;
        const evalResult = evaluateFixture(item);
        if (evalResult.matchesExpectation) passed++;
        results.push(evalResult);
    }

    return { total: results.length, passed, results };
}

// ============================================================================
// RUNNER & REPORTING
// ============================================================================

function runEvaluation() {
    const routingData = evalRoutingFixtures();
    const complianceData = evalComplianceFixtures();

    const totalTests = routingData.total + complianceData.total;
    const totalPassed = routingData.passed + complianceData.passed;
    const overallScore = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0;

    // Group compliance by category
    const categoryBreakdown = {};
    for (const item of complianceData.results) {
        if (!categoryBreakdown[item.category]) categoryBreakdown[item.category] = { total: 0, passed: 0 };
        categoryBreakdown[item.category].total++;
        if (item.matchesExpectation) categoryBreakdown[item.category].passed++;
    }

    if (isJson) {
        console.log(JSON.stringify({
            overallScore,
            totalTests,
            totalPassed,
            routing: routingData,
            compliance: complianceData,
            categoryBreakdown,
        }, null, 2));
        return;
    }

    // Terminal Display
    console.log(chalk.bold.cyan('\n╔════════════════════════════════════════════════════════════════════╗'));
    console.log(chalk.bold.cyan('║            RedWave Labs EA-Kit — Harness Compliance Benchmark     ║'));
    console.log(chalk.bold.cyan('╚════════════════════════════════════════════════════════════════════╝\n'));

    // Category Table
    console.log(chalk.bold.white('📊 Category Score Breakdown:'));
    console.log(chalk.gray('──────────────────────────────────────────────────────────────────────'));
    
    const routingScore = routingData.total > 0 ? Math.round((routingData.passed / routingData.total) * 100) : 100;
    console.log(`  • ${chalk.bold('Request Routing & Persona')}:     ${routingScore === 100 ? chalk.green(`${routingScore}%`) : chalk.yellow(`${routingScore}%`)} (${routingData.passed}/${routingData.total})`);

    for (const [cat, data] of Object.entries(categoryBreakdown)) {
        const catScore = data.total > 0 ? Math.round((data.passed / data.total) * 100) : 100;
        const label = cat === 'socratic-gate' ? 'Sequential Socratic Gate' :
                      cat === 'evidence-honesty' ? 'Evidence Before Claims' :
                      cat === 'rwcommon-policy' ? 'RWCommon Trading Policy' : cat;
        console.log(`  • ${chalk.bold(label.padEnd(27))}: ${catScore === 100 ? chalk.green(`${catScore}%`) : chalk.yellow(`${catScore}%`)} (${data.passed}/${data.total})`);
    }
    console.log(chalk.gray('──────────────────────────────────────────────────────────────────────\n'));

    // Details if verbose or failures
    if (isVerbose) {
        console.log(chalk.bold.white('🔍 Detailed Test Results:'));
        for (const res of routingData.results) {
            const icon = res.pass ? chalk.green('✓') : chalk.red('✗');
            console.log(`  ${icon} [routing] ${chalk.bold(res.id)}: ${res.pass ? chalk.gray('passed') : chalk.red('failed')}`);
        }
        for (const res of complianceData.results) {
            const icon = res.matchesExpectation ? chalk.green('✓') : chalk.red('✗');
            console.log(`  ${icon} [${res.category}] ${chalk.bold(res.id)}: ${chalk.gray(res.reason)}`);
        }
        console.log('');
    }

    // Final Badge
    const badgeColor = overallScore === 100 ? chalk.bgGreen.bold.black : overallScore >= 80 ? chalk.bgYellow.bold.black : chalk.bgRed.bold.white;
    console.log(`Harness Compliance Index (HCI): ${badgeColor(` ${overallScore}% `)} (${totalPassed}/${totalTests} contracts verified)\n`);

    if (totalPassed < totalTests) {
        process.exitCode = 1;
    }
}

runEvaluation();
