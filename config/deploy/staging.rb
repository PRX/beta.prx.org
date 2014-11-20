role :web, %w{deploy@alpha.prx.org}
set :deploy_to, '/var/www/domains/prx.org/m.staging'
ask :branch_name, proc { `git rev-parse --abbrev-ref HEAD`.chomp }
set :branch, proc { fetch(:branch_name); `git rev-parse #{fetch(:branch_name)}`.chomp }

set :default_env, { welcome_mat: true, tcf_demo: true, path: "/opt/node/current/bin:/opt/python/current/bin:$PATH" }
