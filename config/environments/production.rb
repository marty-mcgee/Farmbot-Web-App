require "active_support/core_ext/integer/time"

Rails.application.configure do

  config
    .action_mailer
    .default_url_options = { host: ENV.fetch("API_HOST", "threed.bot") 
  }
  config.active_support.report_deprecations = false
  config.enable_reloading            = false
  config.eager_load                  = true
  config.force_ssl                   = true if ENV["FORCE_SSL"]
  config.i18n.fallbacks              = true
  config.log_formatter               = ::Logger::Formatter.new
  config.log_level                   = :info
  config.action_controller.perform_caching = false
  config.active_record.dump_schema_after_migration = false
  # [MM] custom config settings
  config.consider_all_requests_local = true # [MM] default: false
  config.public_file_server.enabled  = true # [MM] default: false
  config.assets.compile              = true # [MM] default: false
  config.assets.debug                = true
  config.assets.raise_runtime_errors = true
  config.serve_static_assets         = true # [MM] custom (for Render)
  config.assets.digest               = true # [MM] custom (for Render)

  config.active_record.migration_error        = :page_load
  config.active_record.verbose_query_logs     = true
  config.active_record.query_log_tags_enabled = true
  config.active_job.verbose_enqueue_logs      = true
  config.action_controller.raise_on_missing_callback_actions = true

  # HACK AHEAD! Here's why:
  # 1. FarmBot Inc. Uses Sendgrid for email.
  # 2. FarmBot is an open source project that must be vendor neutral.
  # 3. Heroku uses non-neutral ENV names like "SENDGRID_PASSWORD"
  # SOLUTION: Support neutral names like "SMTP_HOST",
  #           but fallback to non-neutral var names like "SENDGRID_USERNAME" if
  #           required.
  pw    = ENV['SMTP_PASSWORD'] || ENV['SENDGRID_PASSWORD']
  uname = ENV['SMTP_USERNAME'] || ENV['SENDGRID_USERNAME']

  config.action_mailer.smtp_settings = { port:      ENV.fetch("SMTP_PORT", 587),
                                         address:   ENV['SMTP_HOST'],
                                         user_name: uname,
                                         password:  pw }
end
