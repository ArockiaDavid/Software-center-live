module.exports = {
  apps: [{
    name: 'software-center-backend',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3007,
      MONGODB_URI: 'mongodb+srv://admin:admin@cluster0.m4gvu.mongodb.net/software-center',
        JWT_SECRET: 'your-secret-key',
        RESET_SECRET:'reset-secret-key',
    }
  }]
};
