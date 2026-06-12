<#
.SYNOPSIS
    PostgreSQL veritabanı için pg_dump tabanlı yedek alma scripti (Windows / PowerShell).

.DESCRIPTION
    DATABASE_URL env'inden bağlantıyı okur ve yerel `backups/` klasörüne tarih damgalı
    `.dump` (custom format) yedek dosyası oluşturur. Custom format `pg_restore` ile
    geri yüklenebilir, hızlı ve sıkıştırılmıştır.

    KULLANIM:
        # 1) Yerel Docker postgres yedeği:
        ./scripts/db-backup.ps1

        # 2) Belirli bir DATABASE_URL ile (üretim):
        $env:DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
        ./scripts/db-backup.ps1

    GERİ YÜKLEME:
        pg_restore --clean --if-exists --no-owner --no-privileges \
            --dbname "$env:DATABASE_URL" backups/otodetailing-2026-04-29.dump

.NOTES
    pg_dump 16+ önerilir. Yerelde Docker container'ı kullanılarak da çalıştırılabilir.
#>

[CmdletBinding()]
param(
    [string]$OutputDir = "backups",
    [string]$DatabaseUrl = $env:DATABASE_URL
)

$ErrorActionPreference = "Stop"

if (-not $DatabaseUrl) {
    Write-Error "DATABASE_URL tanımlı değil. Önce env'i yükleyin (örn. dotenv) veya parametre olarak verin."
    exit 1
}

if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

$timestamp = Get-Date -Format "yyyy-MM-dd-HHmmss"
$file = Join-Path $OutputDir "otodetailing-$timestamp.dump"

# pg_dump var mı?
$hasPgDump = $null -ne (Get-Command pg_dump -ErrorAction SilentlyContinue)

if ($hasPgDump) {
    Write-Host "[backup] Yerel pg_dump bulundu, doğrudan kullanılıyor..."
    & pg_dump --format=custom --no-owner --no-privileges --file $file $DatabaseUrl
}
else {
    Write-Host "[backup] Yerel pg_dump yok; postgres:16-alpine container'ı kullanılıyor..."
    $absFile = Resolve-Path $OutputDir
    docker run --rm `
        -e PGPASSWORD `
        -v "${absFile}:/backup" `
        postgres:16-alpine `
        pg_dump --format=custom --no-owner --no-privileges `
                --file "/backup/otodetailing-$timestamp.dump" `
                $DatabaseUrl
}

if (Test-Path $file) {
    $sizeMb = [Math]::Round((Get-Item $file).Length / 1MB, 2)
    Write-Host ""
    Write-Host "[backup] OK: $file (${sizeMb} MB)"
    Write-Host ""
    Write-Host "Geri yükleme örneği:"
    Write-Host "  pg_restore --clean --if-exists --no-owner --no-privileges --dbname `"`$env:DATABASE_URL`" $file"
}
else {
    Write-Error "[backup] Dump dosyası oluşturulamadı."
    exit 1
}
