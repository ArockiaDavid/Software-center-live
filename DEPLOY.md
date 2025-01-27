# Deployment Guide

This guide explains how to deploy the Software Center application on an Ubuntu server using PM2.

## Prerequisites

1. Node.js and npm installed on Ubuntu server
2. PM2 installed globally (`npm install -g pm2`)
3. Serve installed globally (`npm install -g serve`)
4. MongoDB instance set up and accessible
5. Git installed on Ubuntu server

## Deployment Steps

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd software-center
   ```

2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd backend
   npm install --production
   cd ..

   # Install frontend dependencies and build
   cd frontend
   npm install
   npm run build
   cd ..
   ```

3. Configure environment variables:
   - Update `ecosystem.config.js` with your MongoDB URI and JWT secret
   - Update `frontend/.env.production` with your server's IP or domain

4. Start the application with PM2:
   ```bash
   pm2 start ecosystem.config.js --env production
   ```

5. Save PM2 process list and set up startup script:
   ```bash
   pm2 save
   pm2 startup
   ```

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
