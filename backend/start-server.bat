@echo off
echo Starting server...
cd %~dp0
set PORT=5004
set USE_MEMORY_DB=true
set NODE_ENV=development
npx ts-node src/server-robust.ts