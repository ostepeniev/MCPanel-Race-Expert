module.exports = {
  apps: [{
    name: 'mcpanel',
    script: 'node_modules/.bin/next',
    args: 'start -p 3100',
    cwd: '/var/www/mcpanel',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3100,
    },
    max_memory_restart: '512M',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    merge_logs: true,
    // Restart policy
    max_restarts: 10,
    min_uptime: '10s',
    restart_delay: 5000,
  }],
};
