Write-Host "Iniciando DREAM..." -ForegroundColor Cyan

$rootPath = Split-Path -Parent $MyInvocation.MyCommand.Path

$backendPath = Join-Path $rootPath "backend_dream"
$frontendPath = Join-Path $rootPath "frontend_dream"

Write-Host "Arrancando backend Spring Boot..." -ForegroundColor Yellow

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd `"$backendPath`"; .\mvnw.cmd spring-boot:run"
)

Start-Sleep -Seconds 3

Write-Host "Arrancando frontend Angular..." -ForegroundColor Yellow

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd `"$frontendPath`"; ng serve"
)

Write-Host "DREAM iniciado. Backend y frontend arrancando en ventanas separadas." -ForegroundColor Green