$ErrorActionPreference = "Stop"

$goBin = "C:\Program Files\Go\bin"
if (-not (Test-Path "$goBin\go.exe")) {
    throw "Go nao encontrado em '$goBin'."
}

$env:Path = "$goBin;$env:Path"

docker compose up -d postgres redis | Out-Host

if (-not (Test-Path ".env")) {
    throw "Arquivo .env nao encontrado. Crie a partir de .env.example."
}

Get-Content .env | ForEach-Object {
    if ($_ -match "^\s*#" -or $_ -match "^\s*$") { return }
    $name, $value = $_ -split "=", 2
    [Environment]::SetEnvironmentVariable($name, $value, "Process")
}

go run ./cmd/api
