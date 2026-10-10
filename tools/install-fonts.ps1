param([string]$ThemeRoot = (Split-Path $PSScriptRoot -Parent))
# Satoshi is licensed for self-hosting, but not redistribution in this repository.
# Run this on each reviewer's own copy; files remain unchanged and local.
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path -LiteralPath $ThemeRoot).Path
$fonts = Join-Path $root 'assets\fonts'
New-Item -ItemType Directory -Path $fonts -Force | Out-Null
$sources = @('satoshi-source.css')
$installedFaces = 0
foreach ($source in $sources) {
    $css = Get-Content -LiteralPath (Join-Path $PSScriptRoot $source) -Raw
    foreach ($match in [regex]::Matches($css, '@font-face\s*\{([^}]+)\}')) {
        $block = $match.Groups[1].Value
        $family = [regex]::Match($block, "font-family:\s*'([^']+)'" ).Groups[1].Value
        $weight = [regex]::Match($block, 'font-weight:\s*(\d+)').Groups[1].Value
        $style = [regex]::Match($block, 'font-style:\s*(\w+)').Groups[1].Value
        $url = [regex]::Match($block, "url\(['\"" ]?([^)'\"" ]+)" ).Groups[1].Value
        if ($url.StartsWith('//')) { $url = "https:$url" }
        $extension = [IO.Path]::GetExtension(([uri]$url).AbsolutePath)
        $file = ($family.ToLower().Replace(' ', '-') + '-' + $weight + '-' + $style + $extension)
        $destination = Join-Path $fonts $file
        if (!(Test-Path -LiteralPath $destination)) {
            Invoke-WebRequest -Uri $url -OutFile $destination -TimeoutSec 45
        }
        if ((Get-Item -LiteralPath $destination).Length -eq 0) { throw "Empty font file: $file" }
        $installedFaces++
    }
}
# The checked-in CSS already references Satoshi and the OFL WOFF2 subsets.
# Installation must never replace the verified stylesheet or download public TTFs.
Write-Output "Installed $installedFaces official Satoshi font faces locally; existing font CSS preserved."
