@echo off
REM Run sorting dispatch report test
cd /d %~dp0
set NODE_ENV=test
set RUN_SORTING_REPORT=1
set SHOW_RANKED_PREVIEW=1
npm test -- --testPathPattern=sorting_dispatch_report --runInBand --verbose
