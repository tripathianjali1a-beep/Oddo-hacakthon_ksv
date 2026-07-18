#!/usr/bin/env node
/**
 * Cross-platform launcher for Rentora.
 *
 * Handles the boring setup steps (Node version check, `npm install`,
 * `.env.local` scaffolding) and then boots the app, so contributors on
 * Windows, macOS, or Linux can all just run one script.
 *
 * Usage:
 *   node scripts/dev.mjs            → install (if needed) + start dev server
 *   node scripts/dev.mjs build      → install (if needed) + production build + start
 *   node scripts/dev.mjs --no-open  → skip auto-opening the browser
 */

import { spawn } from 'node:child_process';
import { existsSync, copyFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import os from 'node:os';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const args = process.argv.slice(2);
const mode = args.includes('build') || args.includes('prod') ? 'prod' : 'dev';
const shouldOpen = !args.includes('--no-open');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

const color = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};
const log = (msg, c = color.cyan) => console.log(`${c}${msg}${color.reset}`);
const step = (msg) => log(`\n▶ ${msg}`, color.bold + color.cyan);

function run(cmd, cmdArgs, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, cmdArgs, {
      cwd: ROOT,
      stdio: 'inherit',
      shell: isWindows, // Windows needs shell:true to resolve .cmd shims reliably
      ...opts,
    });
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited with code ${code}`))));
    child.on('error', reject);
  });
}

function checkNodeVersion() {
  const [major] = process.versions.node.split('.').map(Number);
  if (major < 18) {
    log(
      `Node.js ${process.versions.node} detected — Rentora needs Node 18.18+ (20 LTS recommended).\n` +
        `Download the latest LTS from https://nodejs.org and re-run this script.`,
      color.red
    );
    process.exit(1);
  }
}

function ensureEnvFile() {
  const envPath = path.join(ROOT, '.env.local');
  const examplePath = path.join(ROOT, '.env.local.example');
  if (!existsSync(envPath) && existsSync(examplePath)) {
    copyFileSync(examplePath, envPath);
    log('Created .env.local from .env.local.example (checkout runs in demo-payment mode until you add real Razorpay keys).', color.yellow);
  }
}

function ensureDataDir() {
  const dataDir = path.join(ROOT, '.data');
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
}

async function ensureDependencies() {
  const nodeModules = path.join(ROOT, 'node_modules');
  if (!existsSync(nodeModules)) {
    step('Installing dependencies (first run only) — this can take a minute…');
    await run(npmCmd, ['install']);
  } else {
    log('Dependencies already installed, skipping npm install (delete node_modules to force a reinstall).', color.green);
  }
}

function openBrowser(url) {
  const commands = {
    darwin: ['open', [url]],
    win32: ['cmd', ['/c', 'start', '""', url]],
    linux: ['xdg-open', [url]],
  };
  const [cmd, cmdArgs] = commands[os.platform()] ?? [];
  if (!cmd) return;
  spawn(cmd, cmdArgs, { stdio: 'ignore', detached: true }).unref();
}

async function startDev() {
  step('Starting the development server…');
  let opened = false;
  await new Promise((resolve, reject) => {
    const child = spawn(npmCmd, ['run', 'dev'], { cwd: ROOT, shell: isWindows });
    const forward = (buf) => process.stdout.write(buf);
    child.stdout.on('data', (buf) => {
      forward(buf);
      const match = buf.toString().match(/Local:\s+(http:\/\/localhost:\d+)/);
      if (match && shouldOpen && !opened) {
        opened = true;
        setTimeout(() => openBrowser(match[1]), 400);
      }
    });
    child.stderr.on('data', forward);
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`dev server exited with code ${code}`))));
    child.on('error', reject);
    process.on('SIGINT', () => child.kill('SIGINT'));
    process.on('SIGTERM', () => child.kill('SIGTERM'));
  });
}

async function startProd() {
  step('Building for production…');
  await run(npmCmd, ['run', 'build']);
  step('Starting the production server…');
  if (shouldOpen) setTimeout(() => openBrowser('http://localhost:3000'), 1500);
  await run(npmCmd, ['run', 'start']);
}

async function main() {
  log(`${color.bold}Rentora — cross-platform launcher${color.reset}`, color.cyan);
  log(`Platform: ${os.platform()} · Node: ${process.versions.node} · Mode: ${mode}\n`);

  checkNodeVersion();
  ensureEnvFile();
  ensureDataDir();
  await ensureDependencies();

  if (mode === 'prod') {
    await startProd();
  } else {
    await startDev();
  }
}

main().catch((err) => {
  log(`\n✖ ${err.message}`, color.red);
  process.exit(1);
});
