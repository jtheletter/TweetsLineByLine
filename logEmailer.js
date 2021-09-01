// For usage as an AWS Lambda function.
// Set Triggers to CloudWatch Log groups.
// Set Filter pattern to `ERROR` (or as desired).
// Set Filter name to desired email subject.

const zlib = require('zlib');
const aws = require('aws-sdk');
const ses = new aws.SES({ region: 'us-east-1' });

exports.handler = async function (event) {
    const payload = Buffer.from(event.awslogs.data, 'base64');
    const parsed = JSON.parse(zlib.gunzipSync(payload).toString('utf8'));

    const bodyText = JSON.stringify(parsed, null, 2).replace(/\\n/g, ' \\\n         ').replace(/\\t/g, '\\\n         ');
    console.log('bodyText:', bodyText);

    var params = {
        Source: 'j@jtheletter.com',
        Destination: {
            ToAddresses: ['j@jtheletter.com'],
        },
        Message: {
            Subject: { Data: parsed.subscriptionFilters[0] },
            Body: {
                Text: { Data: bodyText },
            },
        },
    };
    return ses.sendEmail(params).promise();
};
