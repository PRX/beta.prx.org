# config valid only for Capistrano 3.1
lock '3.1.0'

set :application, 'prx.org-frontend'
set :repo_url, 'git@github.com:PRX/PRX.org-frontend.git'
set :deploy_to, '/var/www/domains/prx.org/m'
set :linked_dirs, %w{node_modules vendor}
set :default_env, { path: "/opt/node/current/bin:$PATH" }

namespace :deploy do

  before :starting, :start_ssh_agent do
    run_locally do
      %x(ssh-add)
    end
  end

  desc 'Compile assets'
  task :compile_assets do
    on roles(:web) do
      within release_path do
        execute :npm, 'install'
        execute :bower, 'install'
        execute :gulp, 'compile'
      end
    end
  end

  after :updated, :compile_assets
end
