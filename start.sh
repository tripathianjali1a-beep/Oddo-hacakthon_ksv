#!/usr/bin/env bash
# Rentora launcher for Linux & macOS.
# Double-click support: some file managers run scripts with cwd unset, so
# resolve our own directory first.
set -e
cd "$(dirname "${BASH_SOURCE[0]}")"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js was not found on your PATH."
  echo "Install Node 18.18+ (20 LTS recommended) from https://nodejs.org and try again."
  exit 1
fi

node scripts/dev.mjs "$@"
