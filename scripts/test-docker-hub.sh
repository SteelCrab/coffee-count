#!/bin/bash

# Test Docker Hub deployment by pulling and running images
# This script tests the Docker Hub images without building locally

set -e

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

DOCKER_HUB_USERNAME="${DOCKER_HUB_USERNAME:-yongcoffee}"
PROJECT_NAME="${PROJECT_NAME:-coffee-counter}"

echo -e "${BLUE}🧪 Testing Coffee Counter Docker Hub Images${NC}"
echo -e "${BLUE}============================================${NC}"
echo -e "${GREEN}✓ Using Docker Hub username: ${DOCKER_HUB_USERNAME}${NC}"
echo -e "${GREEN}✓ Using project name: ${PROJECT_NAME}${NC}"

# Function to check if image exists on Docker Hub
check_image_exists() {
    local image_name=$1
    echo -e "${BLUE}🔍 Checking if ${image_name} exists...${NC}"
    if docker manifest inspect "${image_name}" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Image ${image_name} found${NC}"
        return 0
    else
        echo -e "${RED}❌ Image ${image_name} not found${NC}"
        return 1
    fi
}

# Stop existing services
echo -e "${BLUE}🛑 Stopping existing services...${NC}"
docker-compose down 2>/dev/null || true
docker-compose -f docker-compose-hub.yml down 2>/dev/null || true

# Check if images exist before pulling
echo -e "${BLUE}📋 Checking Docker Hub images...${NC}"
FRONTEND_IMAGE="${DOCKER_HUB_USERNAME}/${PROJECT_NAME}-frontend:latest"
AUTH_IMAGE="${DOCKER_HUB_USERNAME}/${PROJECT_NAME}-auth-service:latest"
API_IMAGE="${DOCKER_HUB_USERNAME}/${PROJECT_NAME}-api-service:latest"

IMAGES_EXIST=true
check_image_exists "$FRONTEND_IMAGE" || IMAGES_EXIST=false
check_image_exists "$AUTH_IMAGE" || IMAGES_EXIST=false
check_image_exists "$API_IMAGE" || IMAGES_EXIST=false

if [ "$IMAGES_EXIST" = false ]; then
    echo -e "${RED}❌ Some images are missing from Docker Hub${NC}"
    echo -e "${YELLOW}💡 Please run ./scripts/docker-hub-deploy.sh first${NC}"
    exit 1
fi

# Pull latest images from Docker Hub
echo -e "${BLUE}📥 Pulling images from Docker Hub...${NC}"
docker pull "$FRONTEND_IMAGE"
docker pull "$AUTH_IMAGE"
docker pull "$API_IMAGE"

# Start services using Docker Hub images
echo -e "${BLUE}🚀 Starting services from Docker Hub...${NC}"
if [ -f "docker-compose-hub.yml" ]; then
    docker-compose -f docker-compose-hub.yml up -d
    
    echo -e "${BLUE}⏳ Waiting for services to be ready...${NC}"
    
    # Wait for services with timeout
    TIMEOUT=120
    ELAPSED=0
    while [ $ELAPSED -lt $TIMEOUT ]; do
        if docker-compose -f docker-compose-hub.yml ps | grep -q "Up"; then
            echo -e "${GREEN}✅ Services are starting up...${NC}"
            break
        fi
        sleep 5
        ELAPSED=$((ELAPSED + 5))
        echo -e "${YELLOW}⏳ Waiting... (${ELAPSED}s/${TIMEOUT}s)${NC}"
    done
    
    # Additional wait for services to be fully ready
    sleep 30
    
    # Test services
    echo -e "${BLUE}🧪 Testing services...${NC}"
    
    TESTS_PASSED=0
    TOTAL_TESTS=3
    
    # Test frontend
    echo -e "${BLUE}🌐 Testing frontend...${NC}"
    if curl -f -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend is accessible${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}❌ Frontend is not accessible${NC}"
    fi
    
    # Test auth service
    echo -e "${BLUE}🔐 Testing auth service...${NC}"
    if curl -f -s http://localhost:3001/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Auth service is healthy${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}❌ Auth service health check failed${NC}"
    fi
    
    # Test API service
    echo -e "${BLUE}🦀 Testing API service...${NC}"
    if curl -f -s http://localhost:8080/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ API service is healthy${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}❌ API service health check failed${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}📊 Service Status:${NC}"
    docker-compose -f docker-compose-hub.yml ps
    
    echo ""
    echo -e "${BLUE}📈 Test Results: ${TESTS_PASSED}/${TOTAL_TESTS} passed${NC}"
    
    if [ $TESTS_PASSED -eq $TOTAL_TESTS ]; then
        echo -e "${GREEN}🎉 All tests passed! Docker Hub deployment is working correctly.${NC}"
        echo -e "${BLUE}🌐 Access the application at: http://localhost:3000${NC}"
        echo -e "${BLUE}🔐 Auth service: http://localhost:3001${NC}"
        echo -e "${BLUE}🦀 API service: http://localhost:8080${NC}"
        
        echo ""
        echo -e "${BLUE}🧹 Cleanup:${NC}"
        echo -e "${YELLOW}To stop the test services, run:${NC}"
        echo -e "${BLUE}docker-compose -f docker-compose-hub.yml down${NC}"
        
    else
        echo -e "${RED}❌ Some tests failed. Please check the logs:${NC}"
        echo -e "${BLUE}docker-compose -f docker-compose-hub.yml logs${NC}"
        exit 1
    fi
    
else
    echo -e "${RED}❌ docker-compose-hub.yml not found${NC}"
    exit 1
fi
