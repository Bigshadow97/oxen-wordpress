param([string]$ThemeRoot = (Split-Path $PSScriptRoot -Parent))
$ErrorActionPreference = 'Stop'
$resolvedRoot = (Resolve-Path -LiteralPath $ThemeRoot).Path
$manifest = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'assets.json') -Raw | ConvertFrom-Json
$assetDirectory = Join-Path $resolvedRoot 'assets\images'
New-Item -ItemType Directory -Path $assetDirectory -Force | Out-Null
$results = $manifest | ForEach-Object -Parallel {
    $asset = $_
    $destination = Join-Path $using:assetDirectory $asset.file
    try {
        Invoke-WebRequest -Uri $asset.url -Method Get -OutFile $destination -TimeoutSec 45
        $file = Get-Item -LiteralPath $destination
        if ($file.Length -eq 0) { throw 'Empty asset' }
        [pscustomobject]@{ name = $asset.name; file = $asset.file; bytes = $file.Length; sha256 = (Get-FileHash -LiteralPath $destination -Algorithm SHA256).Hash }
    } catch { [pscustomobject]@{ name = $asset.name; file = $asset.file; error = $_.Exception.Message } }
} -ThrottleLimit 6
$results | Sort-Object name | ConvertTo-Json -Depth 3 | Set-Content -LiteralPath (Join-Path $PSScriptRoot 'asset-provenance.json') -Encoding utf8
Write-Output "Checked $($results.Count) original Figma assets."
$failures = $results | Where-Object error
$failures | Format-Table name,error -AutoSize
if ($failures.Count -gt 0) { exit 1 }
