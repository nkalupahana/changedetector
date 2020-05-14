# ChangeDetector

Are you waiting for a URL to come online? Or waiting for a website to update its information? Well, instead of just refereshing forever, this script can be installed in `cron` to text you when the URL changes!

## Requirements
* AWS IAM account with SNS write policy
* `node` (tested on > v8) and `npm`
* `curl` and `md5` for the actual script
* `cron` for scheduling the script run

## Setup
* `npm install` to get necessary packages
* Create `env.js` file with all the necessary data (based on `env.sample.js` file)
* Install the script into crontab with a line like this (checks every 5 minutes):

`*/5 * * * * /absolute/path/to/node /absolute/path/to/detect.js 2>&1 | tee -a  /tmp/changedetector.log`
