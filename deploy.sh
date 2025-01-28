#!/bin/bash

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "PM2 is not installed. Please follow the Initial Setup steps in DEPLOY.md"
    exit 1
fi

# Check if serve is installed
if ! command -v serve &> /dev/null; then
    echo "serve is not installed. Please follow the Initial Setup steps in DEPLOY.md"
    exit 1
fi

# Check if IP address is provided
if [ -z "$1" ]; then
    echo "Please provide server IP address"
    echo "Usage: ./deploy.sh <server-ip>"
    exit 1
fi

SERVER_IP=$1

# Create production env file with server IP
echo "Creating production environment file..."
echo "REACT_APP_API_URL=http://$SERVER_IP:3007" > frontend/.env.production

# Install dependencies
echo "Installing backend dependencies..."
cd backend
npm install --production
cd ..

echo "Installing frontend dependencies..."
cd frontend
npm install

# Build frontend with production environment
echo "Building frontend..."
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
unset NODE_OPTIONS
cd ..

# Start PM2 processes
echo "Starting PM2 processes..."
pm2 start ecosystem.config.js --env production

# Save PM2 process list and setup startup script
echo "Setting up PM2 startup..."
pm2 save
pm2 startup

echo "Deployment complete!"
echo "Frontend URL: http://$SERVER_IP:3000"
echo "Backend URL: http://$SERVER_IP:3007"
