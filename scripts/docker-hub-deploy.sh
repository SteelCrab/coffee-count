#!/bin/bash

# Coffee Counter Microservices - Docker Hub Deployment Script
# This script tags and pushes all service images to Docker Hub

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

# Configuration
DOCKER_HUB_USERNAME="${DOCKER_HUB_USERNAME}"  # Change this to your Docker Hub username
PROJECT_NAME="${PROJECT_NAME:-coffee-counter}"
VERSION="${VERSION:-latest}"

echo -e "${BLUE}🐳 Coffee Counter Microservices - Docker Hub Deployment${NC}"
echo -e "${BLUE}================================================================${NC}"

# Validate required environment variables
if [ -z "$DOCKER_HUB_USERNAME" ]; then
    echo -e "${RED}❌ DOCKER_HUB_USERNAME is not set${NC}"
    echo -e "${YELLOW}Please set DOCKER_HUB_USERNAME in .env file or export it:${NC}"
    echo -e "${BLUE}export DOCKER_HUB_USERNAME=your-username${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Using Docker Hub username: ${DOCKER_HUB_USERNAME}${NC}"
echo -e "${GREEN}✓ Using project name: ${PROJECT_NAME}${NC}"
echo -e "${GREEN}✓ Using version: ${VERSION}${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker is running${NC}"

# Check if user is logged in to Docker Hub
if ! docker info | grep -q "Username:"; then
    echo -e "${YELLOW}⚠️  You are not logged in to Docker Hub${NC}"
    echo -e "${BLUE}Please login to Docker Hub:${NC}"
    docker login
fi

echo -e "${GREEN}✓ Docker Hub authentication verified${NC}"

# Function to tag and push image
tag_and_push() {
    local service_name=$1
    local local_image=$2
    local hub_image="${DOCKER_HUB_USERNAME}/${PROJECT_NAME}-${service_name}:${VERSION}"
    
    echo -e "${BLUE}📦 Processing ${service_name}...${NC}"
    
    # Check if local image exists
    if ! docker image inspect "${local_image}" > /dev/null 2>&1; then
        echo -e "${RED}❌ Local image ${local_image} not found${NC}"
        echo -e "${YELLOW}💡 Please run ./scripts/build.sh first${NC}"
        return 1
    fi
    
    # Get image size for info
    local size=$(docker image inspect "${local_image}" --format='{{.Size}}' | awk '{printf "%.1f MB", $1/1024/1024}')
    echo -e "${GREEN}✓ Found local image ${local_image} (${size})${NC}"
    
    # Tag the image
    echo -e "${BLUE}🏷️  Tagging: ${local_image} -> ${hub_image}${NC}"
    docker tag "${local_image}" "${hub_image}"
    
    # Push to Docker Hub
    echo -e "${BLUE}⬆️  Pushing: ${hub_image}${NC}"
    if docker push "${hub_image}"; then
        echo -e "${GREEN}✅ Successfully pushed ${hub_image}${NC}"
    else
        echo -e "${RED}❌ Failed to push ${hub_image}${NC}"
        return 1
    fi
    echo ""
    return 0
}

# Tag and push all services
echo -e "${BLUE}🚀 Starting deployment process...${NC}"
echo ""

FAILED_SERVICES=()

# Frontend
if ! tag_and_push "frontend" "coffee-counter-microservices-frontend"; then
    FAILED_SERVICES+=("frontend")
fi

# Auth Service
if ! tag_and_push "auth-service" "coffee-counter-microservices-auth-service"; then
    FAILED_SERVICES+=("auth-service")
fi

# API Service
if ! tag_and_push "api-service" "coffee-counter-microservices-api-service"; then
    FAILED_SERVICES+=("api-service")
fi

# Check if any services failed
if [ ${#FAILED_SERVICES[@]} -gt 0 ]; then
    echo -e "${RED}❌ Failed to deploy the following services: ${FAILED_SERVICES[*]}${NC}"
    echo -e "${YELLOW}💡 Please run ./scripts/build.sh first to build missing images${NC}"
    exit 1
fi

# Also create and push versioned tags
if [ "$VERSION" = "latest" ]; then
    TIMESTAMP=$(date +%Y%m%d-%H%M%S)
    VERSION_TAG="v1.0.0-${TIMESTAMP}"
    
    echo -e "${BLUE}🏷️  Creating versioned tags (${VERSION_TAG})...${NC}"
    
    # Function to create versioned tag
    create_versioned_tag() {
        local service_name=$1
        local local_image="coffee-counter-microservices-${service_name}"
        local versioned_image="${DOCKER_HUB_USERNAME}/${PROJECT_NAME}-${service_name}:${VERSION_TAG}"
        
        echo -e "${BLUE}🏷️  Tagging: ${local_image} -> ${versioned_image}${NC}"
        docker tag "${local_image}" "${versioned_image}"
        echo -e "${BLUE}⬆️  Pushing: ${versioned_image}${NC}"
        docker push "${versioned_image}"
        echo -e "${GREEN}✅ Successfully pushed ${versioned_image}${NC}"
    }
    
    # Create versioned tags for all services
    create_versioned_tag "frontend"
    create_versioned_tag "auth-service"
    create_versioned_tag "api-service"
fi

echo -e "${GREEN}🎉 All images successfully deployed to Docker Hub!${NC}"
echo ""
echo -e "${BLUE}📋 Deployed Images:${NC}"
echo -e "   • ${DOCKER_HUB_USERNAME}/${PROJECT_NAME}-frontend:${VERSION}"
echo -e "   • ${DOCKER_HUB_USERNAME}/${PROJECT_NAME}-auth-service:${VERSION}"
echo -e "   • ${DOCKER_HUB_USERNAME}/${PROJECT_NAME}-api-service:${VERSION}"
if [ "$VERSION" = "latest" ]; then
    echo -e "   • ${DOCKER_HUB_USERNAME}/${PROJECT_NAME}-frontend:${VERSION_TAG}"
    echo -e "   • ${DOCKER_HUB_USERNAME}/${PROJECT_NAME}-auth-service:${VERSION_TAG}"
    echo -e "   • ${DOCKER_HUB_USERNAME}/${PROJECT_NAME}-api-service:${VERSION_TAG}"
fi

echo ""
echo -e "${BLUE}🚀 Usage Instructions:${NC}"
echo -e "${BLUE}================================================================${NC}"
echo -e "To pull and run these images on any machine:"
echo ""
echo -e "${YELLOW}# Pull images${NC}"
echo "docker pull ${DOCKER_HUB_USERNAME}/${PROJECT_NAME}-frontend:${VERSION}"
echo "docker pull ${DOCKER_HUB_USERNAME}/${PROJECT_NAME}-auth-service:${VERSION}"
echo "docker pull ${DOCKER_HUB_USERNAME}/${PROJECT_NAME}-api-service:${VERSION}"

echo ""
echo -e "${YELLOW}# Or use the provided docker-compose-hub.yml${NC}"
echo "docker-compose -f docker-compose-hub.yml up -d"

echo ""
echo -e "${BLUE}📝 Next Steps:${NC}"
echo "1. Test deployment with docker-compose-hub.yml"
echo "2. Update README.md with Docker Hub instructions"
echo "3. Set up CI/CD pipeline for automatic deployments"

echo ""
echo -e "${GREEN}✨ Deployment completed successfully!${NC}"
