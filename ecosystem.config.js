module.exports = {
  apps: [
    {
      name: 'software-center-backend',
      script: './backend/server.js',
      node_args: '--max-old-space-size=4096', // Increase Node.js memory limit to 4GB
      env_production: {
        NODE_ENV: 'production',
        PORT: 3007,
        MONGODB_URI: 'mongodb+srv://admin:admin@cluster0.m4gvu.mongodb.net/software-center',
        JWT_SECRET: 'your-secret-key',
        RESET_SECRET:'reset-secret-key',
        SESSION_TIMEOUT: '24h'
      }
    },
    {
      name: 'software-center-frontend',
      script: 'serve',
      node_args: '--max-old-space-size=4096', // Increase Node.js memory limit to 4GB
      env_production: {
        PM2_SERVE_PATH: './frontend/build',
        PM2_SERVE_PORT: 3000,
        PM2_SERVE_SPA: 'true',
        PM2_SERVE_HOMEPAGE: '/index.html'
      }
    }
  ]
};
