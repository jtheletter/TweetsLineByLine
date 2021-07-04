# Twitter Dialog Bot

Twitter bot that posts written works line by line in order.

## Dependencies:
- [NPM Twit](https://www.npmjs.com/package/twit) for Twitter authentication and post handling.

## History:
- Initially served only one written work.
- First written for [Heroku](https://www.heroku.com/). Unfortunately Heroku reboots worker dynos every 24 hours, which reset the index to zero and prevented the sequence of tweets from continuing in order.
- Next adjusted to run on [AWS EC2](https://aws.amazon.com/ec2/). Unfortunately this proved more expensive than desired.
- Then configured to run on [AWS Lambda](https://aws.amazon.com/lambda/), with its index saved in [AWS Systems Manager (SSM)](https://aws.amazon.com/systems-manager/)’s [Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html).
- Finally, the bot can now serve multiple works.

## Instructions:
- Create a central [Twitter Dev App](https://developer.twitter.com/en/docs/basics/apps/overview).
- For each work, create an individual Twitter account.
- Create a central AWS account.
- Create a central AWS [IAM](https://aws.amazon.com/iam/) [role](https://aws.amazon.com/iam/features/manage-roles/).
  - Set type to AWS service.
  - Set use case to lambda.
  - Set [permissions](https://aws.amazon.com/iam/features/manage-permissions/) to Lambda Full Access and SSM Full Access.
- Create an index value (initialized to zero) for each work in AWS SSM Parameter Store.
- Create an AWS lambda function for each work.
  - Create from scratch.
  - Set function name to the name of the work.
  - Set execution role to the central IAM role.
  - Configure timeout to six seconds (each execution gets index from AWS, then posts text to Twitter, then saves new index to AWS; together this averages three seconds in [CloudWatch](https://aws.amazon.com/cloudwatch/)).
  - Configure environmental variables:
      - Add `NODE_ENV` as `production`.
      - Add `WORK` as the name of the written work.
      - Add `ACCESS_TOKEN`, `ACCESS_TOKEN_SECRET`, `CONSUMER_KEY`, `CONSUMER_SECRET` per Twitter config.
- Create an AWS [event rule](https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/Create-CloudWatch-Events-Scheduled-Rule.html) for each work.
  - Schedule a fixed rate to the desired minutes.
  - Add the corresponding lambda as its target.
  - Toggle state to enabled when ready to begin.
- Zip the code via `npm run zip`. Deploy to each bot via `npm run deploy -- ` followed by the work name.
- View [logs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/WhatIsCloudWatchLogs.html) in AWS CloudWatch.
