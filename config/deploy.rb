lock '~> 3.1'

set :application, 'prx.org-frontend'
set :repo_url, 'git://github.com/PRX/PRX.org-frontend.git'
set :linked_dirs, %w{node_modules tmp .cache}
set :default_env, { path: "/opt/node/current/bin:/opt/python/current/bin:$PATH" }
set :revision_timestamp, (proc do
   rev = fetch(:current_revision)
   out = `git rev-list --format=format:'%ct' --max-count=1 #{rev}|tail -1`
   Time.at(out.chomp.to_i).strftime('%Y%m%d%H%M.%S')
 end)

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
          execute :ln, '-s lib/server.js app.js'
          execute :find, ".cache/ -exec touch -t '#{fetch(:revision_timestamp)}' {} \\; ; true"
        end
      end
    end
  end

  desc 'Restart prerender process'
  task :restart do
    on roles(:web) do
      within release_path do
        execute :touch, 'tmp/restart.txt'
      end
    end
  end

  after :updated, :compile_assets
  after :publishing, :restart
end
