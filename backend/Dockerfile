####
# This Dockerfile is used to build a Docker image for the LabSeq Backend (Quarkus)
# Build the image with: docker build -f Dockerfile -t labseq-backend .
# Run the container with: docker run -i --rm -p 8080:8080 labseq-backend
####

## Stage 1: Build
FROM maven:3.9.5-eclipse-temurin-17 AS build

WORKDIR /app

# Copy pom.xml and download dependencies (cached layer)
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy source code
COPY src ./src

# Build application
RUN mvn clean package -DskipTests

## Stage 2: Runtime
FROM registry.access.redhat.com/ubi8/openjdk-17:1.18

ENV LANGUAGE='en_US:en'

# Copy the built artifact from the build stage
COPY --from=build --chown=185 /app/target/quarkus-app/lib/ /deployments/lib/
COPY --from=build --chown=185 /app/target/quarkus-app/*.jar /deployments/
COPY --from=build --chown=185 /app/target/quarkus-app/app/ /deployments/app/
COPY --from=build --chown=185 /app/target/quarkus-app/quarkus/ /deployments/quarkus/

# Expose port
EXPOSE 8080

USER 185

ENV JAVA_OPTS="-Dquarkus.http.host=0.0.0.0 -Djava.util.logging.manager=org.jboss.logmanager.LogManager"
ENV JAVA_APP_JAR="/deployments/quarkus-run.jar"

ENTRYPOINT [ "java", "-jar", "/deployments/quarkus-run.jar" ]