const lines = require('./lines');
const config = require('./config');
const Twit = require('twit');
const twitClient = new Twit(config);
let index = 0;

function twitCallback (error, data, response) {
    if (error) {
        console.error(error);
    } else {
        console.log(data);
    }
}

function tweetLineAtIndex (input) {
    try {
        if (typeof input === 'object' && typeof input.index === 'number') {
            // console.log('Received new index:', input.index);
            index = input.index;
        } else {
            // console.log('Received no new index.');
        }
        if (index >= lines.length) {
            // console.log('Index exceeds lines length. Resetting to zero.');
            index = 0;
        }
        // console.log('Would tweet:', index, lines[index]);
        twitClient.post('statuses/update', { status: lines[index] }, twitCallback);
        index += 1;
    } catch (error) {
        console.error(error);
    }
}

exports.handler = tweetLineAtIndex;
