$ErrorActionPreference = 'Stop'

$backendDirectory = $PSScriptRoot
$keyDirectory = Join-Path $backendDirectory 'jwt'
$generator = Join-Path $backendDirectory 'scripts\GenerateJwtKeys.java'

if (-not $env:JAVA_HOME) {
    throw 'Set JAVA_HOME to a JDK 21 or newer before running this script.'
}

$java = Join-Path $env:JAVA_HOME 'bin\java.exe'
if (-not (Test-Path -LiteralPath $java)) {
    throw "JAVA_HOME does not point to a JDK: $env:JAVA_HOME"
}

& $java $generator $keyDirectory
if ($LASTEXITCODE -ne 0) {
    throw 'Could not create the local JWT signing keys.'
}

$env:JWT_PRIVATE_KEY_LOCATION = ([Uri](Join-Path $keyDirectory 'privateKey.pem')).AbsoluteUri
$env:JWT_PUBLIC_KEY_LOCATION = ([Uri](Join-Path $keyDirectory 'publicKey.pem')).AbsoluteUri

Push-Location $backendDirectory
try {
    & .\mvnw.cmd quarkus:dev
    exit $LASTEXITCODE
}
finally {
    Pop-Location
}
