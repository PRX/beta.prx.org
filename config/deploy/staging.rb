role :web, %w{deploy@staging.m.prx.org}
set :deploy_to, '/var/www/domains/prx.org/m.staging'
ask :branch_name, proc { `git rev-parse --abbrev-ref HEAD`.chomp }
set :branch, proc { fetch(:branch_name); `git rev-parse #{fetch(:branch_name)}`.chomp }
