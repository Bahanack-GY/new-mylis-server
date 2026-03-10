module.exports = {
  apps: [
    {
      name: 'mylisapp-api',
      script: './dist/main.js',
      cwd: '/var/www/api.mylisapp.online',
      instances: 'max', // Will use all 8 CPU cores
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3085,
        DB_HOST: 'localhost',
        DB_PORT: 5432,
        DB_USERNAME: 'postgres',
        DB_PASSWORD: 'postgres',
        DB_DATABASE: 'mylisapp_db',
        JWT_SECRET: 'mylisapp_secured_app_secret',
      },
      // Advanced PM2 settings for production
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      error_file: '/home/ubuntu/.pm2/logs/mylisapp-api-error.log',
      out_file: '/home/ubuntu/.pm2/logs/mylisapp-api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // Cluster mode specific settings
      instance_var: 'INSTANCE_ID',
      // Graceful reload/restart
      kill_timeout: 5000,
      listen_timeout: 3000,
      // Health check settings
      min_uptime: '10s',
      max_restarts: 50,
    },
  ],
};
