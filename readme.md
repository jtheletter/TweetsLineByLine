# Twitter Dialog Bot

Twitter bot that posts written works line by line in order.

## Dependencies:
- [NPM Twit](https://www.npmjs.com/package/twit) for Twitter authentication and post handling.
- [AWS](https://www.npmjs.com/package/aws) and [AWS SDK](https://www.npmjs.com/package/aws-sdk) for storage and execution.

## History:
- Initially served only one written work.
- First written for [Heroku](https://www.heroku.com/). Unfortunately Heroku reboots worker dynos every 24 hours, which reset the index to zero and prevented the sequence of tweets from continuing in order.
- Next adjusted to run on [AWS EC2](https://aws.amazon.com/ec2/). Unfortunately this proved more expensive than desired.
- Then configured to run on [AWS Lambda](https://aws.amazon.com/lambda/), with its index saved in [AWS Systems Manager (SSM)](https://aws.amazon.com/systems-manager/)’s [Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html).
- Finally, the bot can now serve multiple works.

## Instructions:
- Create a central [Twitter Dev App](https://developer.twitter.com/en/docs/basics/apps/overview).
- For each work, create a new Twitter account.
- Create a central AWS account.
- Create a dedicated [IAM](https://aws.amazon.com/iam/) [role](https://aws.amazon.com/iam/features/manage-roles/) with [permissions](https://aws.amazon.com/iam/features/manage-permissions/) for Lambda and SSM full access.
- Create an index value for each work in AWS SSM Parameter Store.
- Create an AWS [EC2](https://aws.amazon.com/ec2/) [key pair](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-key-pairs.html) with PEM format.
- Create an AWS Lambda function for each work.
  - Set handler to `main.handler`.
  - Set environmental variable `WORK` to the name of the written work.
  - Set environmental variables `ACCESS_TOKEN`, `ACCESS_TOKEN_SECRET`, `CONSUMER_KEY`, `CONSUMER_SECRET` per Twitter config.
  - Set environmental variable `NODE_ENV` to `production`.
  - Set timeout to six seconds (each execution gets index from AWS, then posts text to Twitter, then saves new index to AWS; together this averages three seconds in [CloudWatch](https://aws.amazon.com/cloudwatch/)).
- Create a scheduled (fixed rate) [event rule](https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/Create-CloudWatch-Events-Scheduled-Rule.html) for each work.
  - Set the corresponding lambda function as its target.
  - Use the default version.
  - Set input an empty object (doesn’t matter, not used).
- Zip and deploy the code using NPM scripts: `npm run zip` and `npm run deploy`.
- View [logs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/WhatIsCloudWatchLogs.html) in CloudWatch.
