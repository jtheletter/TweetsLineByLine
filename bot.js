const config = require('./config');
const twit = require('twit');
const T = new twit(config);
const lines = require('./lines');

const interval = 1000 * 60; // One minute.
// const interval = 1000 * 60 * 77; // 77 minutes.
let index = 0;

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
