role :web, %w{deploy@beta.prx.org}
set :deploy_to, '/var/www/domains/prx.org/m'
set :branch, :master
set :default_env, { path: '/opt/node/current/bin:/opt/python/current/bin:$PATH' }

set :slack_webhook, -> {
  webhook = nil
  on roles(:web) do
    cmd = 'cat /var/www/domains/prx.org/hal/shared/config/slack_webhook.txt'
    webhook = capture cmd
  end
  webhook
}
set :slack_username, -> { 'capistrano' }
