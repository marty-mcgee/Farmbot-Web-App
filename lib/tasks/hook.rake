BASE_URL_API = "https://api.github.com/repos/Farmbot/Farmbot-Web-App/"
COMPARE_URL_API = "#{BASE_URL_API}compare/"
DEPLOYS_URL_API = "#{BASE_URL_API}deployments"
COMMITS_URL_API = "#{BASE_URL_API}commits"
COMPARE_URL_WEB = "https://github.com/Farmbot/Farmbot-Web-App/compare/"
COMMIT_SHA = ENV["HEROKU_BUILD_COMMIT"]
DESCRIPTION = ENV["HEROKU_BUILD_DESCRIPTION"]
WEBHOOK_URL = ENV["RELEASE_WEBHOOK_URL"]
ENVIRONMENT = ENV["HEROKU_APP_NAME"]
LAST_DEPLOY_COMMIT_OVERRIDE = ENV["LAST_DEPLOY_COMMIT_OVERRIDE"]

def open_json(url)
  begin
    JSON.parse(URI.parse(url).open.read)
  rescue *[OpenURI::HTTPError, SocketError] => exception
    puts exception.message + ": #{url}"
    return {}
  end
end

def last_deploy_commit
  if LAST_DEPLOY_COMMIT_OVERRIDE
    return LAST_DEPLOY_COMMIT_OVERRIDE
  end
  data = open_json(DEPLOYS_URL_API)
  environment = ENVIRONMENT.include?("production") ? "production" : ENVIRONMENT
  data = data.select { |deploy| deploy["environment"] == environment }
  deploy_index = 1 # 0 is the latest in-progress deploy
  (data[deploy_index] || {}).fetch("sha", nil)
end

def commits_since_last_deploy
  last_sha_deployed = last_deploy_commit()
  deploy_commit_found = false
  commits = []
  open_json(COMMITS_URL_API + "?per_page=100").map do |commit|
    if commit.fetch("sha") == last_sha_deployed
      deploy_commit_found = true
      break
    end
    commits.push([commit["commit"]["message"].gsub("\n", " "), commit["sha"]])
  end
  if !deploy_commit_found
    commits = [commits.first]
    commits.push(["[Last deploy commit not found. Most recent commit below.]", "0000000"])
  end
  commits
end

def intro_block(start_text, environment)
  output = start_text
  output += "\n\n"
  if !DESCRIPTION.nil?
    output += "#{DESCRIPTION}\n\n"
  end
  web_compare_url = "#{COMPARE_URL_WEB}#{last_deploy_commit}...#{COMMIT_SHA}"
  output += "<#{web_compare_url}|compare>"
  output
end

def commits_block(environment)
  output = ""
  messages = commits_since_last_deploy.reverse.map do |commit|
    output += "\n + #{commit[0]} | ##{commit[1][0..5]}"
  end
  output
end

def links_block(environment)
  output = ""
  pre = environment == "production" ? "my" : environment
  base = "#{pre}.farm.bot"
  [
    "",
    "promo",
    "promo?config=true&otherPreset=Minimal",
    "os",
    "try_farmbot",
  ].map do |path|
    url = "#{base}/#{path}"
    output += "\n<https://#{url}|#{url}>"
  end
  output
end

namespace :hook do
  desc "Post release info."
  task release_info: :environment do
    if WEBHOOK_URL
      environment = ENVIRONMENT.include?("staging") ? "staging" : "production"
      notification_text = "A new release has been deployed to #{environment}."
      payload = {
        "mrkdwn": true,
        "text": notification_text,
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": intro_block(notification_text, environment),
            }
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": commits_block(environment),
            }
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": links_block(environment),
            }
          },
        ],
        "channel": "#software",
      }.to_json
      response = Faraday.post(WEBHOOK_URL,
                   payload,
                   "Content-Type" => "application/json")
      puts "Status: #{response.status} #{response.body}"
    end
  end
end
