# config valid only for Capistrano 3.1
lock '3.1.0'

set :application, 'prx.org-frontend'
set :repo_url, 'git://github.com/PRX/PRX.org-frontend.git'
set :linked_dirs, %w{node_modules}
set :default_env, { path: "/opt/node/current/bin:$PATH" }

namespace :deploy do
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
