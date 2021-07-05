// Get named parameter from storage.
async function getAwsParam (input = {}) {
    try {
        const { SSMClient, GetParameterCommand } = require('@aws-sdk/client-ssm');
        const region = require(`./config/aws/${work}`).region;
        const client = new SSMClient({ region });
        const param = {
            Name: `/${work}/${input.name}`
        };
        const command = new GetParameterCommand(param);
        const result = await client.send(command);
        return result;
    } catch (error) {
        throw error;
    }
}

// Set named parameter in storage.
async function setAwsParam (input = {}) {
    try {
        const { SSMClient, PutParameterCommand } = require('@aws-sdk/client-ssm');
        const region = require(`./config/aws/${work}`).region;
        const client = new SSMClient({ region });
        const param = {
            Name: `/${work}/${input.name}`,
            Overwrite: true,
            Type: 'String',
            Value: input.value,
        };
        const command = new PutParameterCommand(param);
        const result = await client.send(command);
        return result;
    } catch (error) {
        throw error;
    }
}

// Increment provided index. Reset to zero if needed. Save to storage.
function incrementAndSaveIndex (index) {
    index += 1;
    if (index >= lines.length) {
        index = 0;
    }
    console.log(`Index incremented to ${index}. Saving to storage.`);
    setAwsParam({
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
    twitClient.get('account/verify_credentials', {
        skip_status: true,
    }).then(function (success) {
        console.log('Twitter config is valid:', success.data);
    }).catch(function (error) {
        console.error('Twitter config is invalid:', error.stack);
    });
}

// Get index from storage. Post indexed line to Twitter.
function handler () {

    // Get index from AWS Parameter Store.
    console.log('Getting index from storage.');
    getAwsParam({
        name: 'index',
    }).then(function (success) {
        console.log('Get from AWS storage success:', success);

        // Save stored index to local scope.
        let index = parseInt(success.Parameter.Value, 10);
        let line = lines[index];
        console.log(`Index from storage is ${index}. Line to tweet is:`, line);

        // Tweet.
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
    }).catch(function (error) {
        console.error('Get from AWS storage failure:', error);
    });
}

// Get work name from environment (prod) or argument (dev).
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

// Configure Twit.
const Twit = require('twit');
const twitterConfig = require(`./config/twitter/${work}`);
const twitClient = new Twit(twitterConfig);

// In dev, confirm Twitter and AWS configs (or tweet if specified).
if (process.env.NODE_ENV !== 'production') {
    if (process.argv[3] === 'tweet') {
        handler(process.argv[2]);
    } else {
        confirmTwitterConfig();
        getAwsParam({
            name: 'index',
        }).then(function (success) {
            console.log('Get from AWS storage success:', success);
        });
    }
}

// Export handler for invocation in prod.
exports.handler = handler;
