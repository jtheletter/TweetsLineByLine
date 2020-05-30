// const config = require('./config'); // For local machine testing.
const config = process.env; // For Heroku.

const twit = require('twit');
const T = new twit(config);
const lines = require('./lines');
let index = 1;

// const interval = 1000 * 60; // One minute, for testing.
const interval = 1000 * 60 * 77; // 77 minutes.

// Tweet first line upon app launch.
T.post('statuses/update', {
    status: lines[0]
}, function (err, data, response) {
    console.log(data);
});

// Tweet remaining lines at intervals.
setInterval(tweet, interval);

function tweet () {

    T.post('statuses/update', {
        status: lines[index]
    }, function (err, data, response) {
        console.log(data);
    });

    index += 1;
    if (index >= lines.length) {
        index = 0;
    }

}
