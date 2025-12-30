FarmBot::Application.configure do

  config
    .action_mailer
    .default_url_options = { host: ENV.fetch("API_HOST", "threed.bot") }
  config.active_support.deprecation  = :notify
  config.cache_classes               = true
  config.consider_all_requests_local = true # MM false
  config.eager_load                  = true
  config.force_ssl                   = true if ENV["FORCE_SSL"]
  config.i18n.fallbacks              = true
  config.log_formatter               = ::Logger::Formatter.new
  config.log_level                   = :info
  config.perform_caching             = false
  config.public_file_server.enabled  = true # MM false
  config.serve_static_assets         = true
  config.assets.compile              = true # MM false
  # config.assets.digest             = true # MM

  # [FB] HACKS AHEAD: here's why..
  # 1. FarmBot Inc. Uses Sendgrid for email.
  # 2. FarmBot is an open source project that must be vendor neutral.
  # 3. Your host may use non-neutral ENV names like "SENDGRID_PASSWORD".
  # SOLUTION: Support neutral names like "SMTP_HOST" 
  # and non-neutral names like "SENDGRID_USERNAME",
  # with fallback/default to non-neutral name..
  pw    = ENV['SMTP_PASSWORD'] || ENV['SENDGRID_PASSWORD']
  uname = ENV['SMTP_USERNAME'] || ENV['SENDGRID_USERNAME']
  # [FB] HACKS END: now use chosen variables to 
  # SMTP SETTINGS for RAILS ACTION MAILER
  config.action_mailer.smtp_settings = { 
    port:      ENV.fetch("SMTP_PORT", 587),
    address:   ENV['SMTP_HOST'],
    user_name: uname,
    password:  pw
  }


  # # [MM] support GLB|FBX files

  # # config/environments/production.rb
  # # Increase max file size for static files (default is 1MB)
  # # config.public_file_server.max_age = 86_400 ???
  # config.middleware.use Rack::Deflater

  # # If using Action Dispatch static
  # config.middleware.insert_before(
  #   ActionDispatch::Static,
  #   Rack::Static,
  #   urls: [''], 
  #   root: 'public',
  #   index: 'index',
  #   header_rules: [
  #     # Serve GLB files with correct headers
  #     [:all, { 'Cache-Control' => 'public, max-age=86400' }],
  #     [%w[glb fbx obj stl], { 'Content-Type' => 'application/octet-stream' }]
  #   ]
  # )

  # # [MM] END: support GLB|FBX files

end
