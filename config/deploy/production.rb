role :web, %w{deploy@beta.prx.org}
set :deploy_to, '/var/www/domains/prx.org/m'
set :branch, :master
set :default_env, { path: '/opt/node/current/bin:/opt/python/current/bin:$PATH' }

set :slack_webhook, 'https://hooks.slack.com/services/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'
set :slack_username, -> { 'capistrano' }
