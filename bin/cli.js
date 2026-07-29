#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import fs from 'fs';
import readline from 'readline';
import { fileURLToPath } from 'url';

// Get package.json for version
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8'));

// ============================================================================
// CONSTANTS
// ============================================================================

const CLI_NAME = 'ea-kit';
const AGENT_FOLDER = '.agents';
/** Written into .agents after install so `status` can report kit identity */
const VERSION_FILE = 'ea-kit-version.json';

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Display ASCII banner
 * @param {boolean} quiet - Skip banner if true
 */
const showBanner = (quiet = false) => {
    if (quiet) return;
    console.log(chalk.redBright(`
    ╔══════════════════════════════════════╗
    ║              EA-KIT CLI              ║
    ║         RedWave Labs EA Kit          ║
    ╚══════════════════════════════════════╝
    `));
};

/**
 * Log message if not in quiet mode
 * @param {string} message - Message to log
 * @param {boolean} quiet - Skip logging if true
 */
const log = (message, quiet = false) => {
    if (!quiet) console.log(message);
};

/**
 * Ask user for confirmation
 * @param {string} question - Question to ask
 * @returns {Promise<boolean>}
 */
const confirm = (question) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        rl.question(chalk.yellow(`${question} (y/N): `), (answer) => {
            rl.close();
            resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
        });
    });
};

/**
 * Copy .agents folder from package into destination
 * @param {string} sourceDir - Source directory from package / npx cache
 * @param {string} destDir - Destination directory
 */
const copyAgentFolder = (sourceDir, destDir) => {
    if (!fs.existsSync(sourceDir)) {
        throw new Error(`Could not find ${AGENT_FOLDER} folder in package!`);
    }

    fs.cpSync(sourceDir, destDir, { recursive: true, force: true });
};

/**
 * Write install metadata so projects know which ea-kit version is installed
 * @param {string} agentDir - .agents directory
 */
const writeVersionManifest = (agentDir) => {
    const manifestPath = path.join(agentDir, VERSION_FILE);
    const manifest = {
        name: CLI_NAME,
        package: pkg.name,
        version: pkg.version,
        installedAt: new Date().toISOString(),
    };
    fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf-8');
};

/**
 * Read install metadata if present
 * @param {string} agentDir
 * @returns {object|null}
 */
const readVersionManifest = (agentDir) => {
    const manifestPath = path.join(agentDir, VERSION_FILE);
    if (!fs.existsSync(manifestPath)) return null;
    try {
        return JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    } catch {
        return null;
    }
};

/**
 * Move existing .agents into a sibling backup directory. Moving, rather than
 * copying, lets the following install be an actual replacement with no stale files.
 * @param {string} agentDir
 * @param {boolean} quiet
 * @returns {string|null} backup path
 */
const backupAgentsFolder = (agentDir, quiet = false) => {
    if (!fs.existsSync(agentDir)) return null;

    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = `${agentDir}.bak-${stamp}`;
    fs.renameSync(agentDir, backupDir);
    log(chalk.gray(`Backup: ${backupDir}`), quiet);
    return backupDir;
};

const assertInstallTarget = (targetDir, agentDir) => {
    if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) {
        throw new Error(`Target path must be an existing directory: ${targetDir}`);
    }
    if (fs.existsSync(agentDir) && fs.lstatSync(agentDir).isSymbolicLink()) {
        throw new Error(`Refusing to replace symbolic link: ${agentDir}`);
    }
};

const createStagedAgentsFolder = (targetDir, sourcePath) => {
    const stageRoot = fs.mkdtempSync(path.join(targetDir, '.ea-kit-stage-'));
    const stagedAgents = path.join(stageRoot, AGENT_FOLDER);
    copyAgentFolder(sourcePath, stagedAgents);
    writeVersionManifest(stagedAgents);
    return { stageRoot, stagedAgents };
};

// ============================================================================
// COMMANDS
// ============================================================================

/**
 * Initialize .agents folder in project
 */
const initCommand = async (options) => {
    const quiet = options.quiet || false;
    const dryRun = options.dryRun || false;

    showBanner(quiet);

    const targetDir = path.resolve(options.path || process.cwd());
    const agentDir = path.join(targetDir, AGENT_FOLDER);
    const sourcePath = path.join(__dirname, '..', AGENT_FOLDER);
    const exists = fs.existsSync(agentDir);

    // Dry run mode - show what would be done
    if (dryRun) {
        console.log(chalk.blueBright('\n[Dry Run] No changes will be made\n'));
        console.log(chalk.white('Would perform the following actions:'));
        console.log(chalk.gray('────────────────────────────────────────'));
        console.log(`  1. Copy from: ${chalk.cyan(sourcePath)}`);
        console.log(`  2. Install to: ${chalk.cyan(agentDir)}`);
        if (exists) {
            console.log(`  3. ${chalk.yellow(`Backup existing ${AGENT_FOLDER} then overwrite`)}`);
        }
        console.log(`  4. Write ${chalk.cyan(path.join(AGENT_FOLDER, VERSION_FILE))} (v${pkg.version})`);
        console.log(chalk.gray('────────────────────────────────────────\n'));
        return;
    }

    const spinner = quiet ? null : ora({
        text: 'Initializing...',
        color: 'cyan',
    }).start();

    try {
        assertInstallTarget(targetDir, agentDir);

        if (exists && !options.force) {
            if (quiet || !process.stdin.isTTY) {
                throw new Error(`Refusing to overwrite ${AGENT_FOLDER} non-interactively. Re-run with --force.`);
            }
            log(chalk.yellow(`Warning: Folder ${AGENT_FOLDER} already exists at: ${agentDir}`), quiet);
            const shouldOverwrite = await confirm('Do you want to backup and overwrite it?');
            if (!shouldOverwrite) {
                log(chalk.gray('Operation cancelled.'), quiet);
                return;
            }
        }

        if (exists) log(chalk.gray(`Backing up and replacing ${AGENT_FOLDER}...`), quiet);

        if (spinner) spinner.text = 'Staging files...';
        const { stageRoot, stagedAgents } = createStagedAgentsFolder(targetDir, sourcePath);
        let backupDir = null;
        try {
            if (exists) {
                if (spinner) spinner.text = 'Backing up existing .agents...';
                backupDir = backupAgentsFolder(agentDir, true);
            }
            if (spinner) spinner.text = 'Installing files...';
            fs.renameSync(stagedAgents, agentDir);
        } catch (error) {
            if (!fs.existsSync(agentDir) && backupDir && fs.existsSync(backupDir)) {
                fs.renameSync(backupDir, agentDir);
            }
            throw error;
        } finally {
            fs.rmSync(stageRoot, { recursive: true, force: true });
        }

        if (spinner) {
            spinner.succeed(chalk.green(`ea-kit v${pkg.version} installed successfully!`));
        }

        // Success message
        if (!quiet) {
            console.log(chalk.gray('\n────────────────────────────────────────'));
            console.log(chalk.white('Result:'));
            console.log(`   ${chalk.cyan(CLI_NAME)}  v${pkg.version}`);
            console.log(`   ${chalk.cyan(AGENT_FOLDER)} → ${chalk.gray(agentDir)}`);
            console.log(`   ${chalk.cyan(VERSION_FILE)}`);
            console.log(chalk.gray('────────────────────────────────────────'));
            console.log(chalk.white('\nNext steps:'));
            console.log(`   1. Append ${chalk.cyan('.agents/rules/GEMINI.md')} to your AI always-on rules`);
            console.log(`   2. Optionally enable MCP from ${chalk.cyan('.agents/mcp_config.json')}`);
            console.log(`   3. Use workflows: ${chalk.cyan('/brainstorm /plan /orchestrate /test')}`);
            console.log(chalk.green('\nHappy coding!\n'));
        }
    } catch (error) {
        if (spinner) {
            spinner.fail(chalk.red(`Error: ${error.message}`));
        } else {
            console.error(chalk.red(`Error: ${error.message}`));
        }
        process.exit(1);
    }
};

/**
 * Update existing .agents folder
 */
const updateCommand = async (options) => {
    const quiet = options.quiet || false;

    showBanner(quiet);

    const targetDir = path.resolve(options.path || process.cwd());
    const agentDir = path.join(targetDir, AGENT_FOLDER);

    // Check if .agents exists
    if (!fs.existsSync(agentDir)) {
        console.log(chalk.red(`Error: Could not find ${AGENT_FOLDER} folder at: ${targetDir}`));
        console.log(chalk.yellow(`Tip: Run ${chalk.cyan(`npx ${CLI_NAME} init`)} to install first.`));
        process.exit(1);
    }

    if (options.dryRun) {
        await initCommand({ ...options, force: true, quiet });
        return;
    }

    if (!options.force) {
        if (quiet || !process.stdin.isTTY) {
            console.error(chalk.red(`Error: Refusing to overwrite ${AGENT_FOLDER} non-interactively. Re-run with --force.`));
            process.exit(1);
        }
        log(chalk.yellow(`Warning: Update will backup then overwrite the entire ${AGENT_FOLDER} folder`), quiet);
        const shouldUpdate = await confirm('Are you sure you want to continue?');

        if (!shouldUpdate) {
            log(chalk.gray('Operation cancelled.'), quiet);
            process.exit(0);
        }
    }

    // Call init with force option (init always backs up when folder exists)
    await initCommand({ ...options, force: true, quiet });
};

/**
 * Show status of .agents folder
 */
const statusCommand = (options) => {
    const targetDir = path.resolve(options.path || process.cwd());
    const agentDir = path.join(targetDir, AGENT_FOLDER);
    const manifest = readVersionManifest(agentDir);

    console.log(chalk.blueBright(`\n${CLI_NAME} status\n`));

    if (fs.existsSync(agentDir)) {
        const stats = fs.lstatSync(agentDir);

        // Count files recursively
        let filesCount = 0;
        const countFiles = (dir) => {
            const items = fs.readdirSync(dir);
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const itemStats = fs.lstatSync(fullPath);
                if (itemStats.isDirectory()) {
                    countFiles(fullPath);
                } else {
                    filesCount++;
                }
            }
        };
        countFiles(agentDir);

        console.log(chalk.green('[OK] Installed'));
        console.log(chalk.gray('────────────────────────────────────────'));
        console.log(`CLI:      ${chalk.cyan(CLI_NAME)}`);
        console.log(`Package:  ${chalk.cyan(pkg.name)}@${chalk.yellow(pkg.version)} (this binary)`);
        if (manifest?.version) {
            console.log(`Project:  ${chalk.cyan(manifest.name || CLI_NAME)}@${chalk.yellow(manifest.version)} (in ${AGENT_FOLDER})`);
            if (manifest.installedAt) {
                console.log(`Installed:${chalk.gray(` ${manifest.installedAt}`)}`);
            }
            if (manifest.version !== pkg.version) {
                console.log(chalk.yellow(`Note:     Project kit version differs from this CLI. Run: npx ${CLI_NAME} update`));
            }
        } else {
            console.log(chalk.yellow(`Project:  (no ${VERSION_FILE} — run npx ${CLI_NAME} update to stamp version)`));
        }
        console.log(`Path:     ${chalk.cyan(agentDir)}`);
        console.log(`Modified: ${chalk.gray(stats.mtime.toLocaleString('en-US'))}`);
        console.log(`Files:    ${chalk.yellow(filesCount)} items`);
        console.log(chalk.gray('────────────────────────────────────────\n'));
    } else {
        console.log(chalk.red('[X] Not installed'));
        console.log(chalk.yellow(`Run ${chalk.cyan(`npx ${CLI_NAME} init`)} to install.\n`));
    }
};

// ============================================================================
// CLI DEFINITION
// ============================================================================

const program = new Command();

program
    .name(CLI_NAME)
    .description('Install and manage the RedWave Labs EA Agent Kit (.agents)')
    .version(pkg.version, '-v, --version', 'Display version number');

// Command: init
program
    .command('init')
    .description('Install .agents folder into your project')
    .option('-f, --force', 'Overwrite if folder already exists', false)
    .option('-p, --path <dir>', 'Path to the project directory', process.cwd())
    .option('-q, --quiet', 'Suppress output (for CI/CD)', false)
    .option('--dry-run', 'Show what would be done without executing', false)
    .action(initCommand);

// Command: update
program
    .command('update')
    .description('Backup and update .agents folder to this CLI version')
    .option('-f, --force', 'Skip confirmation prompt', false)
    .option('-p, --path <dir>', 'Path to the project directory', process.cwd())
    .option('-q, --quiet', 'Suppress output (for CI/CD)', false)
    .option('--dry-run', 'Show what would be done without executing', false)
    .action(updateCommand);

// Command: status
program
    .command('status')
    .description('Check ea-kit installation status')
    .option('-p, --path <dir>', 'Path to the project directory', process.cwd())
    .action(statusCommand);

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
