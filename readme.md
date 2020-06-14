# Star Wars Dialog

A bot to tweet opening crawls and spoken lines from George Lucas’ saga (as originally released) in episodic order.

*(One exception to original release format is to include the addition of “Episode IV – A NEW HOPE” to the opening crawl of the original 1977 movie. Otherwise, these lines do not follow the late-1990s Special Editions nor subsequent edits. Lines are sourced from the movies’ subtitles, with the addition of some non-subtitled Huttese and Ewokese in “Episode VI – RETURN OF THE JEDI” sourced from [Wookieepedia G-Canon](//starwars.fandom.com/wiki/Star_Wars_Legends#Official_levels_of_canon) and [Wermo’s Guide](//www.completewermosguide.com/)).*

Bot relies on [NPM Twit](//www.npmjs.com/package/twit) to handle Twitter authentication and post handling.

Bot was first configured to run on [Heroku](//www.heroku.com/). Unfortunately Heroku reboots worker dynos every 24 hours, which reset the index to zero and prevented the sequence of tweets from continuing in order.

Bot was then configured to run on [AWS EC2](//aws.amazon.com/ec2/). Unfortunately this proved more expensive than desired.

Bot is now configured to run on [AWS Lambda](//aws.amazon.com/lambda/), with its index saved in [AWS Systems Manager (SSM)](//aws.amazon.com/systems-manager/)’s [Parameter Store](//docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html).

Instructions:

- Create Twitter account and [Twitter Dev App](//developer.twitter.com/en/docs/basics/apps/overview).
- Create AWS account and dedicated [IAM](//aws.amazon.com/iam/) [role](//aws.amazon.com/iam/features/manage-roles/) with [permissions](//aws.amazon.com/iam/features/manage-permissions/) for Lambda and SSM full access.
- Create staging and production index values in SSM Parameter Store.
- Create staging and production Lambda functions, with handler set to `main.handler`, Twitter config and `NODE_ENV` saved as environmental variables, and timeout set to 6 seconds (each execution gets index from AWS, then posts text to Twitter, then saves new index to AWS; together this averages 3 seconds in [CloudWatch](//aws.amazon.com/cloudwatch/)).
- Zip and deploy using NPM scripts: `npm run zip`, `npm run deploy-staging`, and `npm run deploy-production`.
- Create scheduled (fixed rate) [rule](//docs.aws.amazon.com/AmazonCloudWatch/latest/events/Create-CloudWatch-Events-Scheduled-Rule.html) with empty/default event, and enable rule.
- View [logs](//docs.aws.amazon.com/AmazonCloudWatch/latest/logs/WhatIsCloudWatchLogs.html).
