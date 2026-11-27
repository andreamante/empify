FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace

COPY pom.xml ./
COPY src src
RUN mvn -B package -DskipTests

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system --gid 10001 quarkus \
    && useradd --system --uid 10001 --gid quarkus quarkus \
    && install -d --owner=quarkus --group=quarkus /run/jwt
COPY --from=build --chown=quarkus:quarkus /workspace/target/quarkus-app/ /app/
COPY --chown=quarkus:quarkus docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod 755 /app/docker-entrypoint.sh

USER quarkus
EXPOSE 8080
ENTRYPOINT ["/app/docker-entrypoint.sh"]
