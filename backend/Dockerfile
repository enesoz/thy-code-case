# Stage 1: Build
# Use Maven image with Temurin 21 to match pom.xml Java version
FROM maven:3.9-eclipse-temurin-21-alpine AS build

WORKDIR /app

# Copy only pom first to leverage Docker layer caching for dependencies
COPY pom.xml ./

# Pre-download dependencies (cached layer). Use non-interactive batch mode.
RUN mvn -B -q -e dependency:go-offline || true

# Copy source code
COPY src ./src

# Build the application (skip tests for faster builds)
RUN mvn -B -q clean package -DskipTests

# Stage 2: Runtime (Java 21)
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Install wget for healthcheck, then create non-root user
RUN apk add --no-cache wget \
    && addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy jar from build stage
COPY --from=build /app/target/*.jar app.jar

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
