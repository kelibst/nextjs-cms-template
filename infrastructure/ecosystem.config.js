module.exports = {
  apps: [
    {
      name: 'gaphto',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/var/www/gaphto',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      // Restart on crash, not on memory limit (Next.js manages its own memory)
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
      // Log rotation
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: '/var/log/gaphto/error.log',
      out_file: '/var/log/gaphto/out.log',
      merge_logs: true,
    },
  ],
}
