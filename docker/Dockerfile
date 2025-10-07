# Python runtime for executing user code
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install any additional dependencies needed for the Redis project
# Keep the image minimal for security
RUN pip install --no-cache-dir pytest==7.4.3

# Create a non-root user for running code
RUN useradd -m -u 1000 coderunner && \
    chown -R coderunner:coderunner /app

# Switch to non-root user
USER coderunner

# Default command (will be overridden)
CMD ["python", "--version"]
