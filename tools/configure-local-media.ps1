param([Parameter(Mandatory=$true)][string]$SiteId)
# Only this checkout's LocalWP site; preserve originals and validate before reload.
$ErrorActionPreference = 'Stop'
$publicRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '../../../..')).Path
$siteRoot = Split-Path -Parent (Split-Path -Parent $publicRoot)
$runtime = Join-Path $env:APPDATA "Local/run/$SiteId"
$config = Join-Path $runtime 'conf/nginx/nginx.conf'
$siteConfig = Join-Path $runtime 'conf/nginx/site.conf'
$live = Get-Content -LiteralPath $siteConfig -Raw
if (!$live.Contains($publicRoot.Replace('\','/')) -and !$live.Contains($publicRoot)) { throw 'Runtime site does not match this checkout.' }
$process = Get-CimInstance Win32_Process -Filter "name='nginx.exe'" | Where-Object { $_.ExecutablePath -and $_.CommandLine.Contains($config) } | Select-Object -First 1
if (!$process) { throw 'Matching Local site Nginx is not running.' }
$mimeFiles = @((Join-Path $siteRoot 'conf/nginx/includes/mime-types.conf.hbs'),(Join-Path $runtime 'conf/nginx/includes/mime-types.conf'))
$cacheFiles = @((Join-Path $siteRoot 'conf/nginx/site.conf.hbs'),$siteConfig)
foreach ($file in $mimeFiles + $cacheFiles) {
 if (!(Test-Path -LiteralPath ($file+'.oxen-media-backup'))) { Copy-Item -LiteralPath $file -Destination ($file+'.oxen-media-backup') }
 $text = Get-Content -LiteralPath $file -Raw
 if ($mimeFiles -contains $file) {
  foreach ($type in @(@('image/avif','avif'),@('image/webp','webp'),@('font/woff2','woff2'))) {
   if ($text -notmatch ('(?m)^\s*\S+\s+'+[regex]::Escape($type[1])+';')) {
    $text = [regex]::Replace($text,'types\s*\{',"types {`n    $($type[0]) $($type[1]);",1)
   }
  }
 } else { $text = $text.Replace('jpg|jpeg|gif|png|ico|xml','jpg|jpeg|gif|png|ico|xml|avif|webp') }
 Set-Content -LiteralPath $file -Value $text -NoNewline
}
& $process.ExecutablePath -t -c $config -p (Join-Path $runtime 'nginx')
if ($LASTEXITCODE -ne 0) {
 foreach ($file in $mimeFiles + $cacheFiles) { Copy-Item -LiteralPath ($file+'.oxen-media-backup') -Destination $file -Force }
 throw 'Nginx validation failed; configuration restored.'
}
& $process.ExecutablePath -s reload -c $config -p (Join-Path $runtime 'nginx')
if ($LASTEXITCODE -ne 0) { throw 'Site configuration validated but reload failed.' }
Write-Output 'This LocalWP site now serves AVIF/WebP/WOFF2 MIME types; modern images use its existing five-minute local cache policy.'
