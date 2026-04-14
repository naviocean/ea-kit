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

const AGENT_FOLDER = '.agents';

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
    ║        REDWAVE LABS KIT CLI          ║
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
 * Copy .agent folder from temp to destination
 * @param {string} sourceDir - Source directory from local npx download
 * @param {string} destDir - Destination directory
 */
const copyAgentFolder = (sourceDir, destDir) => {
    if (!fs.existsSync(sourceDir)) {
        throw new Error(`Could not find ${AGENT_FOLDER} folder in package!`);
    }

    fs.cpSync(sourceDir, destDir, { recursive: true, force: true });
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

    // Dry run mode - show what would be done
    if (dryRun) {
        console.log(chalk.blueBright('\n[Dry Run] No changes will be made\n'));
        console.log(chalk.white('Would perform the following actions:'));
        console.log(chalk.gray('────────────────────────────────────────'));
        console.log(`  1. Copy from: ${chalk.cyan(sourcePath)}`);
        console.log(`  2. Install to: ${chalk.cyan(agentDir)}`);
        if (fs.existsSync(agentDir)) {
            console.log(`  3. ${chalk.yellow(`Overwrite existing ${AGENT_FOLDER} folder`)}`);
        }
        console.log(chalk.gray('────────────────────────────────────────\n'));
        return;
    }

    // Check if .agents already exists
    if (fs.existsSync(agentDir)) {
        if (!options.force) {
            log(chalk.yellow(`Warning: Folder ${AGENT_FOLDER} already exists at: ${agentDir}`), quiet);
            const shouldOverwrite = await confirm('Do you want to overwrite it?');

            if (!shouldOverwrite) {
                log(chalk.gray('Operation cancelled.'), quiet);
                process.exit(0);
            }
        }
        log(chalk.gray(`Overwriting ${AGENT_FOLDER} folder...`), quiet);
    }

    const spinner = quiet ? null : ora({
        text: 'Initializing...',
        color: 'cyan',
    }).start();

    try {
        if (spinner) spinner.text = 'Copying files...';

        // Copy .agents folder natively from npx cache
        copyAgentFolder(sourcePath, agentDir);

        if (spinner) {
            spinner.succeed(chalk.green('Initialization successful!'));
        }

        // Success message
        if (!quiet) {
            console.log(chalk.gray('\n────────────────────────────────────────'));
            console.log(chalk.white('Result:'));
            console.log(`   ${chalk.cyan(AGENT_FOLDER)} → ${chalk.gray(agentDir)}`);
            console.log(chalk.gray('────────────────────────────────────────'));
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
        console.log(chalk.yellow(`Tip: Run ${chalk.cyan('npx ea-kit init')} to install first.`));
        process.exit(1);
    }

    if (!options.force && !quiet) {
        log(chalk.yellow(`Warning: Update will overwrite the entire ${AGENT_FOLDER} folder`), quiet);
        const shouldUpdate = await confirm('Are you sure you want to continue?');

        if (!shouldUpdate) {
            log(chalk.gray('Operation cancelled.'), quiet);
            process.exit(0);
        }
    }

    // Call init with force option
    await initCommand({ ...options, force: true, quiet });
};

/**
 * Show status of .agents folder
 */
const statusCommand = (options) => {
    const targetDir = path.resolve(options.path || process.cwd());
    const agentDir = path.join(targetDir, AGENT_FOLDER);

    console.log(chalk.blueBright('\nRedWave Labs Kit Status\n'));

    if (fs.existsSync(agentDir)) {
        const stats = fs.statSync(agentDir);
        
        // Count files recursively
        let filesCount = 0;
        const countFiles = (dir) => {
            const items = fs.readdirSync(dir);
            for (const item of items) {
                const fullPath = path.join(dir, item);
                if (fs.statSync(fullPath).isDirectory()) {
                    countFiles(fullPath);
                } else {
                    filesCount++;
                }
            }
        };
        countFiles(agentDir);

        console.log(chalk.green('[OK] Installed'));
        console.log(chalk.gray('────────────────────────────────────────'));
        console.log(`Path:     ${chalk.cyan(agentDir)}`);
        console.log(`Modified: ${chalk.gray(stats.mtime.toLocaleString('en-US'))}`);
        console.log(`Files:    ${chalk.yellow(filesCount)} items`);
        console.log(chalk.gray('────────────────────────────────────────\n'));
    } else {
        console.log(chalk.red('[X] Not installed'));
        console.log(chalk.yellow(`Run ${chalk.cyan('npx ea-kit init')} to install.\n`));
    }
};

// ============================================================================
// CLI DEFINITION
// ============================================================================

const program = new Command();

program
    .name('ea-kit')
    .description('CLI tool to install and manage RedWave Labs Agent Kit')
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
    .description('Update .agents folder to the latest version')
    .option('-f, --force', 'Skip confirmation prompt', false)
    .option('-p, --path <dir>', 'Path to the project directory', process.cwd())
    .option('-q, --quiet', 'Suppress output (for CI/CD)', false)
    .option('--dry-run', 'Show what would be done without executing', false)
    .action(updateCommand);

// Command: status
program
    .command('status')
    .description('Check installation status')
    .option('-p, --path <dir>', 'Path to the project directory', process.cwd())
    .action(statusCommand);

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
