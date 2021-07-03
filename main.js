// Get named parameter from storage.
async function getParam (param = {}) {
    try {
        const ssm = new (require('aws-sdk/clients/ssm'))();
        const awsParam = {
            Name: `/${work}/${param.name}`,
        };
        const result = await ssm.getParameter(awsParam).promise();
        return result;
    } catch (error) {
        throw error;
    }
}

// Set named parameter in storage.
async function setParam (param = {}) {
    const ssm = new (require('aws-sdk/clients/ssm'))();
    const awsParam = {
          Name: `/${work}/${param.name}`,
          Overwrite: true,
          Type: 'String',
          Value: param.value,
    };
    const result = await ssm.putParameter(awsParam).promise();
    return result;
}

// Increment provided index. Reset to zero if needed. Save to storage.
function incrementAndSaveIndex (index) {
    index += 1;
    if (index >= lines.length) {
        index = 0;
    }
    console.log(`Index incremented to ${index}. Saving to storage.`);
    setParam({
        name: 'index',
        value: `${index}`,
    }).then(function (success) {
        console.log('Save to storage success:', success);
    }).catch(function (error) {
        console.error('Save to storage failure:', error);
    });
}

// Confirm Twitter config is valid.
function confirmTwitterConfig () {
    console.log('Confirming Twitter config.');
    twitClient.get('account/verify_credentials', {
        skip_status: true,

    // On success, increment and save index, and program ends.
    }).then(function (success) {
        console.log('Twitter config is valid:', success.data);

    // On error, send it to console, and program ends.
    }).catch(function (error) {
        console.error('Twitter config is invalid:', error.stack);
    });
}

// Get index from storage.
// Either confirm Twitter config or post indexed line to Twitter.
function handler () {

    // Get index from AWS Parameter Store.
    console.log('Getting index from storage.');
    getParam({
        name: 'index',

    // On success, proceed.
    }).then(function (success) {
        console.log('Get from storage success:', success);

        // Save stored index to local scope.
        let index = parseInt(success.Parameter.Value, 10);
        console.log('Index from storage is:', index);
        let line = lines[index];
        console.log('Line to tweet is:', line);

        // If not in production, confirm Twitter config is valid.
        if (process.env.NODE_ENV !== 'production') {
            confirmTwitterConfig();

        // Else tweet.
        } else {
            twitClient.post('statuses/update', {
                status: line,
            }, function (error, success) {

                // If tweet fails, print error to the console.
                if (error) {
                    console.error('Post to Twitter failure:', error);

                    // If tweet fails as "status is duplicate", increment index.
                    if (error.code === 187) {
                        incrementAndSaveIndex(index);
                    }

                // Else tweet succeeded, increment index.
                } else {
                    console.log('Post to Twitter success:', success);
                    incrementAndSaveIndex(index);
                }
            });
        }

    // On failure, print error to console.
    }).catch(function (error) {
        console.error('Get from storage failure:', error);
    });
}

// Get work name from environment (production/AWS) or argument (dev/CLI).
const work = process.env.WORK || process.argv[2];
if (
    work !== 'bttf' &&
    work !== 'hobbit' &&
    work !== 'starwars' &&
    work !== 'willows'
    ) {
    throw new Error(`Unrecognized work: ${work}`);
}
const lines = require(`./lines/${work}`);

// Configure AWS.
const Aws = require('aws-sdk');
const awsConfig = require(`./config/aws/${work}`);
Aws.config.update({ region: awsConfig.region });

// Configure Twit.
const Twit = require('twit');
const twitterConfig = require(`./config/twitter/${work}`);
const twitClient = new Twit(twitterConfig);

// Export handler for invocation.
exports.handler = handler;

// Uncomment for CLI. Invoke with work name as argument.
handler(process.argv[2]);
