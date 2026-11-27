#!/bin/sh
set -eu

if [ ! -s /run/jwt/privateKey.pem ] || [ ! -s /run/jwt/publicKey.pem ]; then
    openssl genrsa -out /run/jwt/privateKey.pem 2048
    openssl rsa -in /run/jwt/privateKey.pem -pubout -out /run/jwt/publicKey.pem
    chmod 600 /run/jwt/privateKey.pem
fi

exec java -Dquarkus.http.host=0.0.0.0 -jar /app/quarkus-run.jar
