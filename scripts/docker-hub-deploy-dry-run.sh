#!/bin/bash

# Coffee Counter Microservices - Docker Hub Deployment Dry Run
# This script shows what would be deployed without actually pushing

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
DOCKER_HUB_USERNAME="${DOCKER_HUB_USERNAME}"
PROJECT_NAME="${PROJECT_NAME:-coffee-counter}"
VERSION="${VERSION:-latest}"

echo -e "${BLUE}🐳 Coffee Counter Microservices - Docker Hub Deployment (DRY RUN)${NC}"
echo -e "${BLUE}========================================================================${NC}"

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
echo ""

# Check Docker status
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker is running${NC}"

# Check Docker Hub login status
if ! docker info | grep -q "Username:"; then
    echo -e "${YELLOW}⚠️  You are not logged in to Docker Hub${NC}"
    echo -e "${BLUE}💡 You would need to login: docker login${NC}"
else
    echo -e "${GREEN}✓ Docker Hub authentication verified${NC}"
fi
echo ""

# Check current images
echo -e "${BLUE}📦 Current local images:${NC}"
if docker images | grep -E "(coffee-counter|${PROJECT_NAME})" > /dev/null 2>&1; then
    docker images | grep -E "(coffee-counter|${PROJECT_NAME})" | head -10
else
    echo -e "${YELLOW}⚠️  No coffee-counter images found${NC}"
    echo -e "${BLUE}💡 Run ./scripts/build.sh first to build images${NC}"
fi
echo ""

# Show what would be tagged and pushed
echo -e "${BLUE}🏷️  Images that would be tagged and pushed:${NC}"
echo ""

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
VERSION_TAG="v1.0.0-${TIMESTAMP}"

# Function to check and display service info
check_service() {
    local service_name=$1
    local local_image="coffee-counter-microservices-${service_name}"
    local hub_image="${DOCKER_HUB_USERNAME}/${PROJECT_NAME}-${service_name}:${VERSION}"
    local versioned_image="${DOCKER_HUB_USERNAME}/${PROJECT_NAME}-${service_name}:${VERSION_TAG}"
    
    echo -e "${YELLOW}Service: ${service_name}${NC}"
    echo -e "  Local Image:     ${local_image}"
    echo -e "  Hub Image:       ${hub_image}"
    echo -e "  Versioned:       ${versioned_image}"
    
    if docker image inspect "${local_image}" > /dev/null 2>&1; then
        local size=$(docker image inspect "${local_image}" --format='{{.Size}}' | awk '{printf "%.1f MB", $1/1024/1024}')
        echo -e "  Status:          ${GREEN}✅ Ready to deploy (${size})${NC}"
        echo -e "  Commands:"
        echo -e "    ${BLUE}docker tag ${local_image} ${hub_image}${NC}"
        echo -e "    ${BLUE}docker push ${hub_image}${NC}"
        echo -e "    ${BLUE}docker tag ${local_image} ${versioned_image}${NC}"
        echo -e "    ${BLUE}docker push ${versioned_image}${NC}"
    else
        echo -e "  Status:          ${RED}❌ Local image not found${NC}"
        echo -e "  Action Required: ${YELLOW}Build image first with ./scripts/build.sh${NC}"
    fi
    echo ""
}

# Check all services
check_service "frontend"
check_service "auth-service"
check_service "api-service"

echo -e "${BLUE}📋 Deployment Summary:${NC}"
echo -e "  Docker Hub Username: ${DOCKER_HUB_USERNAME}"
echo -e "  Project Name: ${PROJECT_NAME}"
echo -e "  Version: ${VERSION}"
echo -e "  Timestamp Version: ${VERSION_TAG}"
echo -e "  Total Services: 3"

# Count ready images
READY_COUNT=0
for service in "frontend" "auth-service" "api-service"; do
    if docker image inspect "coffee-counter-microservices-${service}" > /dev/null 2>&1; then
        READY_COUNT=$((READY_COUNT + 1))
    fi
done

echo -e "  Ready Images: ${READY_COUNT}/3"

if [ $READY_COUNT -eq 3 ]; then
    echo -e "  Status: ${GREEN}✅ All images ready for deployment${NC}"
else
    echo -e "  Status: ${YELLOW}⚠️  Some images need to be built first${NC}"
fi

echo ""
echo -e "${BLUE}🚀 Next Steps:${NC}"
if [ $READY_COUNT -lt 3 ]; then
    echo -e "  1. Build missing images: ${BLUE}./scripts/build.sh${NC}"
fi
echo -e "  2. Login to Docker Hub: ${BLUE}docker login${NC}"
echo -e "  3. Run actual deployment: ${BLUE}./scripts/docker-hub-deploy.sh${NC}"
echo -e "  4. Test deployment: ${BLUE}./scripts/test-docker-hub.sh${NC}"

echo ""
echo -e "${BLUE}💡 Environment Variables:${NC}"
echo -e "  You can also set variables directly:"
echo -e "  ${BLUE}DOCKER_HUB_USERNAME=your-username ./scripts/docker-hub-deploy.sh${NC}"
echo -e "  ${BLUE}VERSION=v2.0.0 ./scripts/docker-hub-deploy.sh${NC}"

echo ""
echo -e "${GREEN}✨ Dry run completed!${NC}"
