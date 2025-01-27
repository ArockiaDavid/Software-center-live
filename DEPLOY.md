# Deployment Guide

This guide explains how to deploy the Software Center application on an Ubuntu server using PM2.

## Prerequisites

1. Node.js and npm installed on Ubuntu server
2. MongoDB instance set up and accessible
3. Git installed on Ubuntu server

## Initial Setup

1. Install PM2 and serve globally with proper permissions:
   ```bash
   # Install PM2
   sudo npm install -g pm2 --unsafe-perm=true --allow-root
   sudo chown -R $USER:$(id -gn $USER) /usr/local/lib/node_modules/pm2

   # Install serve
   sudo npm install -g serve --unsafe-perm=true --allow-root
   sudo chown -R $USER:$(id -gn $USER) /usr/local/lib/node_modules/serve
   ```

## Deployment Steps

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd software-center
   ```

2. Make the deployment script executable:
   ```bash
   chmod +x deploy.sh
   ```

3. Update MongoDB URI and JWT secret in ecosystem.config.js:
   ```javascript
   env_production: {
     MONGODB_URI: 'your-mongodb-uri',
     JWT_SECRET: 'your-jwt-secret'
   }
   ```

4. Run the deployment script with your server's IP:
   ```bash
   ./deploy.sh <server-ip>
   ```

   This script will:
   - Configure the production environment with your server IP
   - Install all dependencies
   - Build the frontend
   - Start PM2 processes
   - Set up PM2 startup script

## Monitoring

- View logs:
  ```bash
  pm2 logs
  ```

- Monitor processes:
  ```bash
  pm2 monit
  ```

- View status:
  ```bash
  pm2 status
  ```

## Updating the Application

1. Pull latest changes:
   ```bash
   git pull origin main
   ```

2. Rebuild frontend:
   ```bash
   cd frontend
   npm install
   npm run build
   cd ..
   ```

3. Restart PM2 processes:
   ```bash
   pm2 restart all
   ```

## Troubleshooting

1. If the frontend is not accessible, check:
   - Firewall settings (ports 3000 and 3007 should be open)
   - NGINX configuration if using a reverse proxy
   - PM2 process status (`pm2 status`)

2. If the backend is not connecting to MongoDB:
   - Verify MongoDB URI in ecosystem.config.js
   - Check MongoDB instance status
   - Check network connectivity

3. For any other issues:
   - Check PM2 logs: `pm2 logs`
   - Check application logs in `~/.pm2/logs/`
