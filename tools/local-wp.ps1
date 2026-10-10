# Site-specific CLI launcher: LocalWP PHP 8.2.29 and this site's MySQL port.
$oxenPhp = "$env:APPDATA/Local/lightning-services/php-8.2.29+0/bin/win64/php.exe"
$oxenCli = "$env:LOCALAPPDATA/Programs/Local/resources/extraResources/bin/wp-cli/wp-cli.phar"
$oxenPublic = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '../../../..')).Path
$oxenExt = Split-Path -Parent $oxenPhp
& $oxenPhp -n -d "extension_dir=$oxenExt/ext" -d extension=mysqli -d extension=mbstring -d mysqli.default_port=10017 $oxenCli "--path=$oxenPublic" @args
exit $LASTEXITCODE
