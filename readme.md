# Star Wars Dialog

A bot to tweet opening crawls and spoken lines from George Lucas’ saga (as originally released) in episodic order.

*(One exception to original release format is to include the addition of “Episode IV – A NEW HOPE” to the opening crawl of the original 1977 movie. Otherwise, these lines do not follow the late-1990s Special Editions nor subsequent edits. Lines are sourced from the movies’ subtitles, with the addition of some non-subtitled Huttese and Ewokese in “Episode VI – RETURN OF THE JEDI” sourced from [Wookieepedia G-Canon](//starwars.fandom.com/wiki/Star_Wars_Legends#Official_levels_of_canon) and [Wermo’s Guide](//www.completewermosguide.com/)).*

Bot relies on [npm twit](//www.npmjs.com/package/twit) to handle Twitter authentication and post handling.

Bot was first configured to run on [Heroku](//www.heroku.com/). Unfortunately Heroku reboots worker dynos every 24 hours, which reset the index to zero and prevented the sequence of tweets from continuing in order.

Bot was then configured to run on [AWS EC2](//aws.amazon.com/ec2/). Unfortunately this proved more expensive than desired.

Bot is now configured to run on [AWS Lambda](//aws.amazon.com/lambda/), with its index saved in [AWS Systems Manager](//aws.amazon.com/systems-manager/)’s [Parameter Store](//docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html).
