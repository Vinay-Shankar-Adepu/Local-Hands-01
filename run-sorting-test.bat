@echo off
REM Run Sorting & Dispatch Report Test on Windows
REM This script sets the necessary environment variables and runs the test

echo ========================================
echo Sorting ^& Dispatch Verification Test
echo ========================================
echo.

cd /d "%~dp0backend"

echo Setting environment variables...
set NODE_ENV=test
set RUN_SORTING_REPORT=1
set SHOW_RANKED_PREVIEW=1

echo.
echo Running test suite...
echo.

call npm test -- src/tests/sorting_dispatch_report.test.js --runInBand

echo.
echo ========================================
echo Test complete! Check console output above.
echo Report available at: SORTING_DISPATCH_VERIFICATION_REPORT.md
echo ========================================

pause
