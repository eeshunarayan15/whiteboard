# ========================================================
# FINAL PRODUCTION DOCKERFILE — Java 25 + Render Free Tier
# Image size: ~180-220 MB | RAM usage: 250-380 MB (safe on 512 MB)
# ========================================================

# ====================== BUILD STAGE ======================
FROM eclipse-temurin:25-jdk-alpine AS builder

WORKDIR /app

COPY gradlew .
COPY gradle gradle
COPY build.gradle settings.gradle* ./

RUN chmod +x gradlew && \
    ./gradlew dependencies --no-daemon || true

COPY src src

RUN ./gradlew bootJar -x test --no-daemon

# ====================== RUNTIME STAGE ======================
FROM eclipse-temurin:25-jre-alpine

RUN addgroup -S spring && adduser -S spring -G spring

WORKDIR /app

COPY --from=builder /app/build/libs/app.jar app.jar

RUN chown -R spring:spring /app

USER spring

EXPOSE 8080

# Render Free Tier (512 MB) optimized JVM flags
ENV JAVA_OPTS="\
  -XX:+UseSerialGC \
  -XX:MaxRAMPercentage=65.0 \
  -Xss512k \
  -XX:+UseContainerSupport \
  -Djava.security.egd=file:/dev/./urandom"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]