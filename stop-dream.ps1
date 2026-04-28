Write-Host "Parando DREAM..." -ForegroundColor Cyan

$ports = @(4200, 8080)

foreach ($port in $ports) {
    Write-Host "Buscando proceso en puerto $port..." -ForegroundColor Yellow

    $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue

    if (-not $connections) {
        Write-Host "No hay ningún proceso escuchando en el puerto $port." -ForegroundColor DarkGray
        continue
    }

    foreach ($connection in $connections) {
        $processId = $connection.OwningProcess

        try {
            $process = Get-Process -Id $processId -ErrorAction Stop

            Write-Host "Parando $($process.ProcessName) con PID $processId en puerto $port..." -ForegroundColor Red

            Stop-Process -Id $processId -Force

            Write-Host "Proceso parado correctamente." -ForegroundColor Green
        }
        catch {
            Write-Host "No se pudo parar el proceso con PID $processId." -ForegroundColor Red
        }
    }
}

Write-Host "DREAM detenido." -ForegroundColor Green