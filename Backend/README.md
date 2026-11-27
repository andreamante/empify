# empify

## Backend (Quarkus + PostgreSQL)

Run the backend and database from the repository root:

```powershell
docker compose -f Backend\docker-compose.yml up --build
```

Compose initializes a new PostgreSQL volume using `Database/empifyDB.sql`, listens
on port `5433` on the host, and keeps database data and development JWT keys in
named Docker volumes. Schema initialization only runs when the database volume
is first created. Do not remove that volume if you need to preserve its data.

The local Compose defaults are for development only. Set `DB_USER` and
`DB_PASSWORD` in `Backend/.env` before starting Compose to override them. The
backend listens on `http://localhost:8080`; OpenAPI is available at
`/q/openapi` and Swagger UI at `/q/swagger-ui`.

The Compose container generates an RSA key pair in its persistent JWT volume on
first start. For production, provide managed signing and verification keys and
do not use development database credentials or development-generated keys.

Authentication payloads use JSON fields `username`, `email`, `password` for
registration and `email`, `password` for login. Login and registration return
`accessToken`, `refreshToken`, and `user`. Refresh requires a JSON body containing
`refreshToken`; logout uses the authenticated access token and revokes that
user's refresh sessions. Access tokens expire after 15 minutes; refresh tokens
are rotated and expire after 30 days.

Track uploads accept multipart fields `file`, `title`, `artist`, and `album`.
Uploads are limited to 100 MB. Track list queries return metadata only; media
bytes remain in PostgreSQL and are fetched only by the stream and cover routes.
Audio streaming supports single HTTP byte ranges for seeking.

## Tests

With JDK 21 installed, run the unit tests from `Backend`:

```powershell
.\mvnw.cmd test
```

The byte-range parser tests do not require a running database.

This project uses Quarkus, the Supersonic Subatomic Java Framework.

If you want to learn more about Quarkus, please visit its website: <https://quarkus.io/>.

## Running the application in dev mode

You can run your application in dev mode that enables live coding using:

```shell script
./mvnw quarkus:dev
```

> **_NOTE:_**  Quarkus now ships with a Dev UI, which is available in dev mode only at <http://localhost:8080/q/dev/>.

## Packaging and running the application

The application can be packaged using:

```shell script
./mvnw package
```

It produces the `quarkus-run.jar` file in the `target/quarkus-app/` directory.
Be aware that it’s not an _über-jar_ as the dependencies are copied into the `target/quarkus-app/lib/` directory.

The application is now runnable using `java -jar target/quarkus-app/quarkus-run.jar`.

If you want to build an _über-jar_, execute the following command:

```shell script
./mvnw package -Dquarkus.package.jar.type=uber-jar
```

The application, packaged as an _über-jar_, is now runnable using `java -jar target/*-runner.jar`.

## Creating a native executable

You can create a native executable using:

```shell script
./mvnw package -Dnative
```

Or, if you don't have GraalVM installed, you can run the native executable build in a container using:

```shell script
./mvnw package -Dnative -Dquarkus.native.container-build=true
```

You can then execute your native executable with: `./target/empify-1.0-SNAPSHOT-runner`

If you want to learn more about building native executables, please consult <https://quarkus.io/guides/maven-tooling>.

## Related Guides

- REST Jackson ([guide](https://quarkus.io/guides/rest#json-serialisation)): Jackson serialization support for Quarkus
  REST. This extension is not compatible with the quarkus-resteasy extension, or any of the extensions that depend on it
- Elytron Security JDBC ([guide](https://quarkus.io/guides/security-jdbc)): Secure your applications with
  username/password stored in a database
- Hibernate ORM with Panache ([guide](https://quarkus.io/guides/hibernate-orm-panache)): Simplified JPA/Hibernate data
  access layer with active record and repository patterns
- Agroal - DB connection pool ([guide](https://quarkus.io/guides/datasource)): JDBC Datasources and connection pooling
- JDBC Driver - PostgreSQL ([guide](https://quarkus.io/guides/datasource)): Connect to the PostgreSQL database via JDBC

## Provided Code

### Hibernate ORM

Create your first JPA entity

[Related guide section...](https://quarkus.io/guides/hibernate-orm)

[Related Hibernate with Panache section...](https://quarkus.io/guides/hibernate-orm-panache)

### REST

Easily start your REST Web Services

[Related guide section...](https://quarkus.io/guides/getting-started-reactive#reactive-jax-rs-resources)
