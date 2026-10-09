FROM eclipse-temurin:21-jdk

WORKDIR /app

# Create an unprivileged user for running submitted Java code.
RUN useradd --system --uid 10001 --no-create-home runner

# Create a writable temporary directory for Java runtime files.
RUN mkdir -p /tmp && chmod 1777 /tmp

USER 10001:10001

CMD ["java", "-version"]