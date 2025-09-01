module.exports = {
  apps: [{
    name: 'web-notification-server',
    script: './server/dist/index.js',
    cwd: '/data/web-notification',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 10901
    },
    error_file: '/data/web-notification/logs/err.log',
    out_file: '/data/web-notification/logs/out.log',
    log_file: '/data/web-notification/logs/combined.log',
    time: true,
    watch: false,
    max_memory_restart: '1G',
    node_args: '--max_old_space_size=1024'
  }]
};