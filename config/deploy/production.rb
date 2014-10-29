role :web, %w{deploy@m.prx.org}
set :deploy_to, '/var/www/domains/prx.org/m'
set :branch, :master
set :default_env, { path: "/opt/node/current/bin:/opt/python/current/bin:$PATH" }
