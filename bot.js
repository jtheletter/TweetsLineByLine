// const config = require('./config'); // For local machine testing.
const config = process.env; // For Heroku.

const twit = require('twit');
const T = new twit(config);
const lines = require('./lines');
let index = 0;

// const interval = 1000 * 60; // One minute, for testing.
const interval = 1000 * 60 * 77; // 77 minutes.

// Tweet upon app launch.
T.post('statuses/update', {
    status: 'From the First Saga, Journal of the Whills'
}, function (err, data, response) {
  console.log(data);
});

// Tweet dialog lines at intervals.
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
