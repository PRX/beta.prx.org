role :web, %w{deploy@beta.prx.org}
set :deploy_to, '/var/www/domains/prx.org/m'
set :branch, :master
set :default_env, { path: '/opt/node/current/bin:/opt/python/current/bin:$PATH' }

set :slack_webhook, -> { _hook = ''; on(roles(:web)) { _hook = capture('cat /var/www/domains/prx.org/hal/shared/config/slack_webhook.txt') }; _hook }
set :slack_username, -> { 'capistrano' }
