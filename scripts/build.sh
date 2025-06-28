#!/bin/bash

set -e

echo "🚀 Building Coffee Counter Microservices..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

print_status "Docker is running ✓"

# Check if Docker Compose is available
if ! command -v docker-compose > /dev/null 2>&1; then
    print_error "Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

print_status "Docker Compose is available ✓"

# Clean up existing containers
print_status "Cleaning up existing containers..."
docker-compose down --remove-orphans --volumes 2>/dev/null || true

# Build services
print_status "Building services..."

# Build Frontend
print_status "Building React Frontend..."
cd frontend
if [ -f "package.json" ]; then
    print_status "Installing Frontend dependencies..."
    npm install
    print_success "Frontend dependencies installed"
else
    print_error "package.json not found in frontend directory"
    exit 1
fi
cd ..

# Build Auth & API Service
print_status "Building Node.js Auth & API Service..."
cd auth-service
if [ -f "package.json" ]; then
    print_status "Installing Node.js dependencies..."
    npm install
    print_success "Auth & API service dependencies installed"
else
    print_error "package.json not found in auth-service directory"
    exit 1
fi
cd ..

# Build Docker images
print_status "Building Docker images..."
docker-compose build --parallel

if [ $? -eq 0 ]; then
    print_success "All Docker images built successfully"
else
    print_error "Failed to build Docker images"
    exit 1
fi

# Start services
print_status "Starting services..."
docker-compose up -d

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 10

# Check service health
print_status "Checking service health..."

# Check PostgreSQL
print_status "Checking PostgreSQL..."
if docker-compose exec -T postgres pg_isready -U coffee_user -d coffee_counter > /dev/null 2>&1; then
    print_success "PostgreSQL is ready"
else
    print_warning "PostgreSQL is not ready yet"
fi

# Check Redis
print_status "Checking Redis..."
if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    print_success "Redis is ready"
else
    print_warning "Redis is not ready yet"
fi

# Check Frontend
print_status "Checking Frontend..."
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    print_success "Frontend is ready"
else
    print_warning "Frontend is not ready yet"
fi

# Check Auth & API Service
print_status "Checking Auth & API Service..."
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    print_success "Auth & API Service is ready"
else
    print_warning "Auth & API Service is not ready yet"
fi

# Show running containers
print_status "Running containers:"
docker-compose ps

print_success "🎉 Build completed successfully!"
print_status "Services are available at:"
echo "  - Frontend: http://localhost:3000"
echo "  - Auth & API Service: http://localhost:3001"
echo "  - PostgreSQL: localhost:5432"
echo "  - Redis: localhost:6379"
echo ""
echo "Note: Rust API Service will be added in future updates for high-performance data processing"
echo ""
print_status "To view logs: docker-compose logs -f [service-name]"
print_status "To stop services: docker-compose down"
