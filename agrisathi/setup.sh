#!/usr/bin/env bash
# Run this on the Linux machine that will actually serve/test the app.
set -e
cd "$(dirname "$0")"

echo "== Removing any stale/platform-mismatched install artifacts =="
rm -rf node_modules package-lock.json

echo "== Installing dependencies fresh for this platform =="
npm install

echo "== Sanity check: native bindings resolve correctly =="
node -e "require('lightningcss'); console.log('lightningcss OK')"

echo "== Starting dev server on http://localhost:5173 =="
npm run dev
