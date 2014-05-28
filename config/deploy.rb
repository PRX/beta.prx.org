lock '~> 3.1'

set :application, 'prx.org-frontend'
set :repo_url, 'git://github.com/PRX/PRX.org-frontend.git'
set :linked_dirs, %w{node_modules}
set :default_env, { path: "/opt/node/current/bin:/opt/python/current/bin:$PATH" }

namespace :deploy do
  desc 'Compile assets'
  task :compile_assets do
    on roles(:web) do
      within release_path do
        execute :npm, 'install'
        with application_version: fetch(:current_revision) do
          execute :npm, 'run-script compile'
          execute :rm, '-rf public'
          execute :ln, '-s bin/ public'
        end
      end
    end
  end

  after :updated, :compile_assets
end
