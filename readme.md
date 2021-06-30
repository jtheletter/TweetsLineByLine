# Star Wars Dialog

*A bot to tweet opening crawls and spoken lines from George Lucas’s saga, as originally released, in episodic order.*

*One exception to original release format is to include the addition of “Episode IV – A NEW HOPE” to the opening crawl of the original 1977 movie. Otherwise, these lines do not follow the late-1990s Special Editions nor subsequent edits. Lines are sourced from the movies’ subtitles, with the addition of some non-subtitled words sourced from [Wookieepedia G-Canon](https://starwars.fandom.com/wiki/Star_Wars_Legends#Official_levels_of_canon), [Wermo’s Guide](http://www.completewermosguide.com/), and by ear.*

This bot relies on [NPM Twit](https://www.npmjs.com/package/twit) to handle Twitter authentication and post handling.

The bot was first configured to run on [Heroku](https://www.heroku.com/). Unfortunately Heroku reboots worker dynos every 24 hours, which reset the index to zero and prevented the sequence of tweets from continuing in order. It was then configured to run on [AWS EC2](https://aws.amazon.com/ec2/). Unfortunately this proved more expensive than desired.

It is now configured to run on [AWS Lambda](https://aws.amazon.com/lambda/), with its index saved in [AWS Systems Manager (SSM)](https://aws.amazon.com/systems-manager/)’s [Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html).

Instructions:

- Create a Twitter account and a [Twitter Dev App](https://developer.twitter.com/en/docs/basics/apps/overview).
- Create an AWS account and a dedicated [IAM](https://aws.amazon.com/iam/) [role](https://aws.amazon.com/iam/features/manage-roles/) with [permissions](https://aws.amazon.com/iam/features/manage-permissions/) for Lambda and SSM full access.
- Create an index value in AWS SSM Parameter Store.
- Create an AWS [EC2](https://aws.amazon.com/ec2/) [key pair](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-key-pairs.html) with PEM format.
- Create an AWS Lambda function. Set handler to `main.handler`. Set environmental variables `ACCESS_TOKEN`, `ACCESS_TOKEN_SECRET`, `CONSUMER_KEY`, `CONSUMER_SECRET` per Twitter config. Set `NODE_ENV` to `production`. Set timeout to six seconds (each execution gets index from AWS, then posts text to Twitter, then saves new index to AWS; together this averages three seconds in [CloudWatch](https://aws.amazon.com/cloudwatch/)).
- Create a scheduled (fixed rate) [event rule](https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/Create-CloudWatch-Events-Scheduled-Rule.html) with the lambda function as its target, with the default version, and any input (not used).
- Zip and deploy code using NPM scripts: `npm run zip` and `npm run deploy`.
- View [logs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/WhatIsCloudWatchLogs.html).
