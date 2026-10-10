$ErrorActionPreference = 'SilentlyContinue'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$url = 'http://127.0.0.1:5173/'

function Test-KumoServer {
    try {
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 1
        return $response.StatusCode -ge 200 -and $response.StatusCode -lt 400
    } catch {
        return $false
    }
}

if (-not (Test-KumoServer)) {
    $npm = Get-Command npm.cmd -ErrorAction SilentlyContinue
    if (-not $npm) { $npm = Get-Command npm -ErrorAction SilentlyContinue }
    if (-not $npm) {
        Write-Error 'Khong tim thay npm. Hay cai Node.js de mo Kumo Japanese.'
        exit 1
    }

    Start-Process -FilePath $npm.Source -ArgumentList @('run', 'dev', '--', '--host', '127.0.0.1') -WorkingDirectory $root -WindowStyle Hidden

    for ($attempt = 0; $attempt -lt 30; $attempt++) {
        Start-Sleep -Milliseconds 400
        if (Test-KumoServer) { break }
    }
}

if (Test-KumoServer) {
    Start-Process $url
    exit 0
}

Write-Error 'Khong the khoi dong Kumo Japanese tai http://127.0.0.1:5173/.'
exit 1
