const lines = require('./lines');
const config = require('./config');
const twit = require('twit');
const twitClient = new twit(config);

function post (text) {
    twitClient.post('statuses/update', {
        status: text
    }, function (error, data, response) {
        console.log(data);
    });
}

// Default interval 77 minutes.
module.exports = function (index = 0, interval = 1000 * 60 * 77) {
    function postAgain () {
        index += 1;
        if (index >= lines.length) {
            index = 0;
        }
        post(lines[index]);
    }
    post(lines[index]);
    setInterval(postAgain, interval);
};
