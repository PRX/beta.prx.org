require 'json'
role :web, %w{deploy@alpha.prx.org}
set :deploy_to, '/var/www/domains/prx.org/m.staging'
set :branch, :master

set :default_env, -> {
  filename = File.expand_path('../../flags.staging.json' , __FILE__)
  json = JSON.parse(File.read(filename))
  Hash[json.map{|(k,v)| [k.downcase.intern, v]}].merge( {
    path: '/opt/node/current/bin:/opt/python/current/bin:$PATH'
  })
}


set :slack_webhook, -> {
  webhook = nil
  on roles(:web) do
    cmd = "cat #{fetch(:deploy_to)}/shared/config/slack_webhook.txt"
    webhook = capture cmd
  end
  webhook
}
set :slack_username, -> { 'capistrano' }
