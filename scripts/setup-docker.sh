#!/bin/bash

# Script to set up Docker infrastructure for CodeAlong

set -e

echo "🐳 Setting up Docker infrastructure for CodeAlong..."

# Check if Docker is installed and running
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop first."
    echo "   Visit: https://www.docker.com/products/docker-desktop"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

echo "✓ Docker is installed and running"

# Build the Docker image
echo ""
echo "📦 Building Docker image for code execution..."
# Navigate to project root (parent of scripts directory)
cd "$(dirname "$0")/.."
docker build -t codealong-python-runner ./docker

echo ""
echo "✓ Docker image built successfully!"
echo ""
echo "🎉 Setup complete! You can now run the development server:"
echo "   npm run dev"
echo ""
echo "The application will use Docker to safely execute user code."
