import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cli = path.join(root, 'bin', 'cli.js');

async function makeProject() {
    return mkdtemp(path.join(tmpdir(), 'ea-kit-test-'));
}

async function runCli(...args) {
    return execFileAsync(process.execPath, [cli, ...args], { cwd: root });
}

test('init installs the agent folder and version manifest', async (t) => {
    const project = await makeProject();
    t.after(() => rm(project, { recursive: true, force: true }));

    await runCli('init', '--path', project, '--quiet');

    const manifest = JSON.parse(await readFile(path.join(project, '.agents', 'ea-kit-version.json'), 'utf8'));
    assert.equal(manifest.name, 'ea-kit');
    assert.equal(manifest.version, '1.0.1');
});

test('forced update replaces stale files and preserves a backup', async (t) => {
    const project = await makeProject();
    t.after(() => rm(project, { recursive: true, force: true }));

    await runCli('init', '--path', project, '--quiet');
    await mkdir(path.join(project, '.agents', 'legacy'));
    await writeFile(path.join(project, '.agents', 'legacy', 'obsolete.md'), 'obsolete');

    await runCli('update', '--path', project, '--quiet', '--force');

    await assert.rejects(readFile(path.join(project, '.agents', 'legacy', 'obsolete.md')));
    const entries = await readdir(project);
    assert.ok(entries.some((entry) => entry.startsWith('.agents.bak-')));
});

test('quiet update requires explicit force', async (t) => {
    const project = await makeProject();
    t.after(() => rm(project, { recursive: true, force: true }));

    await runCli('init', '--path', project, '--quiet');
    await assert.rejects(runCli('update', '--path', project, '--quiet'), /Refusing to overwrite/);
});

test('dry-run does not create an agent folder', async (t) => {
    const project = await makeProject();
    t.after(() => rm(project, { recursive: true, force: true }));

    await runCli('init', '--path', project, '--quiet', '--dry-run');
    await assert.rejects(readFile(path.join(project, '.agents', 'ea-kit-version.json')));
});

test('link-host installs the Codex adapter and protects existing files', async (t) => {
    const project = await makeProject();
    t.after(() => rm(project, { recursive: true, force: true }));

    await runCli('init', '--path', project, '--quiet');
    await runCli('link-host', 'codex', '--path', project);

    const adapter = await readFile(path.join(project, 'AGENTS.md'), 'utf8');
    assert.match(adapter, /EA-KIT\.md/);
    await assert.rejects(runCli('link-host', 'codex', '--path', project), /Destination already exists/);
});

test('link-host installs the Gemini/Antigravity adapter', async (t) => {
    const project = await makeProject();
    t.after(() => rm(project, { recursive: true, force: true }));

    await runCli('init', '--path', project, '--quiet');
    await runCli('link-host', 'antigravity', '--path', project);

    const adapter = await readFile(path.join(project, 'GEMINI.md'), 'utf8');
    assert.match(adapter, /EA-KIT\.md/);
    assert.match(adapter, /Request routing/);
});

test('doctor is read-only and reports the portable core', async (t) => {
    const project = await makeProject();
    t.after(() => rm(project, { recursive: true, force: true }));

    await runCli('init', '--path', project, '--quiet');
    const { stdout } = await runCli('doctor', '--path', project);
    assert.match(stdout, /portable core rules/);
    assert.match(stdout, /\.agents installed/);
});

test('eval-harness runs benchmark evaluation and outputs HCI score', async () => {
    const evalScript = path.join(root, 'scripts', 'eval-harness.mjs');
    const { stdout } = await execFileAsync(process.execPath, [evalScript, '--json'], { cwd: root });
    const result = JSON.parse(stdout);
    assert.equal(result.overallScore, 100);
    assert.equal(result.totalPassed, result.totalTests);
    assert.ok(result.totalTests >= 16);
});
