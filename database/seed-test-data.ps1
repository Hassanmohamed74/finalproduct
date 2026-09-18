param(
    [string]$ContainerName = "speakup-postgres",
    [string]$DbUser = "postgres",
    [string]$DbName = "speakup_tms"
)

$ErrorActionPreference = "Stop"

$SeedSql = Join-Path $PSScriptRoot "seed-test-data.sql"

Write-Host ""
Write-Host "=== SpeakUp TMS COMPLETE TEST SEED v2 ===" -ForegroundColor Cyan
Write-Host "SQL:       $SeedSql"
Write-Host "Container: $ContainerName"
Write-Host "Database:  $DbName"
Write-Host ""

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw "Docker is not available in PATH."
}

if (-not (Test-Path $SeedSql)) {
    throw "Seed SQL file not found: $SeedSql"
}

$running = docker ps --format "{{.Names}}" | Select-String -SimpleMatch $ContainerName
if (-not $running) {
    throw "PostgreSQL container '$ContainerName' is not running. Start Docker/SpeakUp first."
}

Write-Host "Running PostgreSQL seed..." -ForegroundColor Yellow

Get-Content -Path $SeedSql -Raw |
    docker exec -i $ContainerName psql -U $DbUser -d $DbName -v ON_ERROR_STOP=1

if ($LASTEXITCODE -ne 0) {
    throw "Seed failed. PostgreSQL returned exit code $LASTEXITCODE."
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host " TEST DATA SEED COMPLETED SUCCESSFULLY" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host "Test accounts: TEST_USERS_AND_PASSWORDS.txt"
Write-Host ""
