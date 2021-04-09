const lines = require('./lines');
const paramStore = process.env.NODE_ENV === 'production' ? '/starwarsdialog' : '/starwarsdialog/staging';
const config = require('./config');
const Twit = require('twit');
const twitClient = new Twit(config);

async function getParam (param = {}) {
    const ssm = new (require('aws-sdk/clients/ssm'))();
    const awsParam = {
        Name: `${paramStore}/${param.name}`,
    };
    const result = await ssm.getParameter(awsParam).promise();
    return result;
}

async function setParam (param = {}) {
    const ssm = new (require('aws-sdk/clients/ssm'))();
    const awsParam = {
          Name: `${paramStore}/${param.name}`,
          Overwrite: true,
          Type: 'String',
          Value: param.value,
    };
    const result = await ssm.putParameter(awsParam).promise();
    return result;
}

function advanceAndSaveIndex (index) {
    // Advance index.
    index += 1;
    console.log(`Index advanced to ${index}. Saving to storage.`);

    // Save index to AWS Parameter Store.
    setParam({
        name: 'index',
        value: `${index}`,
    }).then(function (success) {
        console.log('Save to storage success:', success);
    }).catch(function (error) {
        console.error('Save to storage error:', error);
    });
}

function handler () {

    // Get index from AWS Parameter Store.
    console.log('Getting index from storage.');
    getParam({
        name: 'index',

    // On error, send it to console, and program ends.
    }).catch(function (error) {
        console.error('Get from storage error:', error);

    // On success, proceed.
    }).then(function (success) {
        console.log('Get from storage success:', success);

        // Save index to local scope.
        let index = parseInt(success.Parameter.Value, 10);
        console.log(`Index from storage is ${index}.`);

        // Reset local index to zero if over lines length.
        if (index >= lines.length) {
            console.log('Index exceeds lines. Resetting to 0.');
            index = 0;
        }

        // If not in production...
        if (process.env.NODE_ENV !== 'production') {

            // Log line that would be tweeted in production.
            console.log('Would post to Twitter:', lines[index]);

            // Ping Twitter.
            console.log('Pinging Twitter.');
            twitClient.get('account/verify_credentials', {
                skip_status: true,

            // On error, send it to console, and program ends.
            }).catch(function (error) {
                console.error('Ping Twitter error:', error.stack);

            // On success, advance and save index.
            }).then(function (success) {
                console.log('Ping Twitter success:', success.data);
                advanceAndSaveIndex(index);
            });

        // Else in production...
        } else {

            // Log line before tweet attempt.
            console.log('Posting to Twitter:', lines[index]);

            // Tweet.
            twitClient.post('statuses/update', {
                status: lines[index],
            }, function (error, success) {

                // If error, send it to console, check code for exception.
                if (error) {
                    console.error('Post to Twitter error:', error);

                    // If tweet fails due to "status is duplicate", advance index.
                    if (error.code === 187) {
                        advanceAndSaveIndex(index);
                    }

                // Else, tweet succeeded, advance index.
                } else {
                    console.log('Post to Twitter success:', success);
                    advanceAndSaveIndex(index);
                }
            });
        }
    });
}

exports.handler = handler;
