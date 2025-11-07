# View Migration SQL
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  HMS SaaS - Database Migration SQL" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Copy ALL the content below and run in Supabase SQL Editor:" -ForegroundColor Yellow
Write-Host "https://supabase.com/dashboard/project/uoxyyqbwuzjraxhaypko/sql/new" -ForegroundColor Green
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Get-Content init-migration.sql

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "After running in Supabase, execute:" -ForegroundColor Yellow
Write-Host "  npx prisma generate" -ForegroundColor Green
Write-Host "  npm run dev" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
