param([string]$ThemeRoot = (Split-Path $PSScriptRoot -Parent))
# Satoshi is licensed for self-hosting, but not redistribution in this repository.
# Run this on each reviewer's own copy; files remain unchanged and local.
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path -LiteralPath $ThemeRoot).Path
$fonts = Join-Path $root 'assets\fonts'
New-Item -ItemType Directory -Path $fonts -Force | Out-Null
$sources = @('satoshi-source.css','google-fonts-source.css')
$rules = [System.Collections.Generic.List[string]]::new()
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
        $format = if ($extension -eq '.woff2') { 'woff2' } else { 'truetype' }
        $rules.Add("@font-face { font-family: '$family'; src: url('../fonts/$file') format('$format'); font-weight: $weight; font-style: $style; font-display: swap; }")
    }
}
$rules | Set-Content -LiteralPath (Join-Path $root 'assets\css\fonts.css') -Encoding utf8
Write-Output "Installed $($rules.Count) official font faces locally."
