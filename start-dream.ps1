Write-Host "Iniciando DREAM..." -ForegroundColor Cyan

$rootPath = $PSScriptRoot

$backendPath = Join-Path $rootPath "backend_dream"
$frontendPath = Join-Path $rootPath "frontend_dream"

if (-not (Test-Path -LiteralPath $backendPath -PathType Container)) {
    Write-Host "No se encuentra la carpeta del backend: $backendPath" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path -LiteralPath $frontendPath -PathType Container)) {
    Write-Host "No se encuentra la carpeta del frontend: $frontendPath" -ForegroundColor Red
    exit 1
}

Write-Host "Arrancando backend Spring Boot..." -ForegroundColor Yellow

Start-Process powershell.exe -WorkingDirectory $backendPath -ArgumentList @(
    "-NoExit",
    "-Command",
    ".\mvnw.cmd spring-boot:run"
)

Start-Sleep -Seconds 3

Write-Host "Arrancando frontend Angular..." -ForegroundColor Yellow

Start-Process powershell.exe -WorkingDirectory $frontendPath -ArgumentList @(
    "-NoExit",
    "-Command",
    "ng serve"
)

Write-Host "DREAM iniciado. Backend y frontend arrancando en ventanas separadas." -ForegroundColor Green
