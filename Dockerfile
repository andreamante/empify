FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace

COPY pom.xml ./
COPY src src
RUN mvn -B package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
RUN groupadd --system quarkus && useradd --system --gid quarkus quarkus
COPY --from=build --chown=quarkus:quarkus /workspace/target/quarkus-app/ /app/

USER quarkus
EXPOSE 8080
ENTRYPOINT ["java", "-Dquarkus.http.host=0.0.0.0", "-jar", "/app/quarkus-run.jar"]
