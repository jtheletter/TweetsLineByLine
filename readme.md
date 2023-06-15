# Tweets Line by Line

Written works in tweets line by line.

## Code Dependencies:

- [NPM Twit](https://www.npmjs.com/package/twit) for Twitter authentication and posting.
- [NPM AWS-SDK](https://www.npmjs.com/package/aws-sdk) for index storage and retrieval.
- [AWS CLI](https://docs.aws.amazon.com/cli/index.html) for CLI deployment. Installed globally and directly from Amazon. Version 2 (latest) used.

## Platform Dependencies:

- [Twitter](https://twitter.com/).
- [Twitter Developer Platform](https://developer.twitter.com/en/docs/basics/apps/overview).
- [AWS IAM](https://aws.amazon.com/iam/) for lambda access.
- [AWS Systems Manager (SSM)](https://aws.amazon.com/systems-manager/) for index storage.
- [AWS Lambda](https://aws.amazon.com/lambda/) for code storage and execution.
- [AWS CloudWatch](https://aws.amazon.com/cloudwatch/) for scheduling and logs.
- Optional: [AWS Simple Notification Service (SNS)](https://aws.amazon.com/sns/) for emailed errors.

## History:

- This bot initially served only one written work.
- It was first written for [Heroku](https://www.heroku.com/). Heroku reboots worker dynos every 24 hours, which reset the index to zero and prevented the sequence of tweets from continuing in order.
- It was next adjusted to run on [AWS EC2](https://aws.amazon.com/ec2/). This proved more expensive than desired.
- It was then configured to run on AWS Lambda, with its index saved in AWS Systems Manager (SSM)’s Parameter Store.
- Finally, the bot can now serve multiple works.

## Instructions:

### For all written works:

- Install AWS CLI. Access keys are stored in `~/.aws/credentials`.
- Create a Twitter dev app.
- Create an AWS account.
- Create an AWS IAM role.
  - Set type to AWS service.
  - Set use case to lambda.
  - Set permissions to Lambda Full Access and SSM Full Access.
- Optional: Create an AWS Lambda function to email logged errors automatically (see `logEmailer.js`).

### For each written work:

- Save the work’s lines to the `lines` directory, and add its name and handle to the `works.js` list.
- Create a Twitter account.
- Generate tokens/keys to authorize the Twitter app to post to the Twitter account:
  - Visit this URL on the dev account’s browser to get new temporary/one-use tokens:
    - `https://twitter.com/oauth/request_token?oauth_consumer_key=API_KEY_FROM_TWITTER_DEVELOPER_PORTAL&oauth_callback=oob`
  - Visit this URL on the bot account’s browser, with the `oauth_token` from DOM output of the previous step, and click “Authorize app”:
    - `https://twitter.com/oauth/authenticate?oauth_token=OAUTH_TOKEN_FROM_PREVIOUS_STEP`
  - Run this curl POST in Terminal, with the `oauth_token` and `oauth_verifier` PIN from the DOM outputs of the previous steps:
    - `curl --request POST --url 'https://twitter.com/oauth/access_token?oauth_token=OAUTH_TOKEN_FROM_PREVIOUS_STEP&oauth_verifier=PIN_FROM_PREVIOUS_STEP' && print ;`
  - Save the output `oauth_token` for the `access_token`, and the `oauth_token_secret` for the `access_token_secret` in the Twitter config:
    - `oauth_token=ACCESS_TOKEN&oauth_token_secret=ACCESS_TOKEN_SECRET&user_id=USER_ID&screen_name=SCREEN_NAME`
- Save tokens/keys to `config/twitter/<work>/dev.js`.
- Create an AWS SSM Parameter Store named `/<work>/index` with string/text value `0`. Save its region in `config/aws/<work>/`.
- Create an AWS lambda function.
  - Author from scratch.
  - Set the function name to the work’s name.
  - Change the default execution role to the IAM role.
  - Configure general timeout to six seconds (each execution gets an index from AWS, posts text to Twitter, and saves a new index to AWS; together this averages three seconds in CloudWatch).
  - Configure environmental variables:
    - Add `NODE_ENV` as `production`.
    - Add `WORK` as the work’s name.
    - Add per Twitter config:
      - `ACCESS_TOKEN` (work bot’s oauth_token).
      - `ACCESS_TOKEN_SECRET` (work bot’s oauth_token_secret).
      - `CONSUMER_KEY` (dev app’s API Key).
      - `CONSUMER_SECRET` (dev app’s API Secret Key).
- Create an AWS CloudWatch event rule.
  - Schedule a fixed rate to the desired minutes.
  - Add the corresponding lambda as its target.
  - Name it the same as the work.
  - Toggle its state to enabled when ready to begin automated executions.
  - NB: AWS will not execute upon enablement during creation, but it will execute upon enablement after creation or upon saving edits to the rule.
- View Log groups in AWS CloudWatch. Reduce retention settings from the “never expire” default.
- Optional: Add Log group as a trigger to `logEmailer.js` Lambda function, filter pattern `ERROR`, for automated error emails (filter name is email subject).
- Command-line scripts:
  - Break paragraphs into sentences (overwrites the work’s “lines” file):
    - `WORK=<work> npm run break-paragraphs`
  - Check lines meet Twitter limits:
    - `WORK=<work> npm run check-lines`
  - Break lines to meet Twitter limits (overwrites the work’s “lines” file):
    - `WORK=<work> npm run break-long-lines "<breaker>"`
  - Confirm Twitter credentials:
    - `WORK=<work> npm run confirm-twitter`
  - Get index from AWS storage:
    - `WORK=<work> npm run get-index`
  - Set index in AWS storage (use `--` before index if `-1`):
    - `WORK=<work> npm run set-index <index>`
  - Zip code for deploy:
    - `npm run zip`
  - Deploy the zip (increase timeout in script if needed):
    - `WORK=<work> npm run deploy`
  - Execute handler manually:
    - `WORK=<work> npm run execute`
  - Tweet a special announcement without iterating index:
    - `WORK=<work> npm run psa <announcement>`
