const lines = require('./lines');
const config = require('./config');
const twit = require('twit');
const twitClient = new twit(config);

function post (index) {
    try {
        if (typeof lines[index] !== 'string') {
            throw `Line at index ${index} is type ${typeof lines[index]}.`;
        }
        twitClient.post('statuses/update', {
            status: lines[index]
        }, function (error, data, response) {
            console.log(data);
        });
    } catch (error) {
        console.error(error);
    }
}

// Default interval 77 minutes.
module.exports = function (index = 0, interval = 1000 * 60 * 77) {
    function postAgain () {
        index += 1;
        if (index >= lines.length) {
            index = 0;
        }
        post(index);

    }
    post(index);
    setInterval(postAgain, interval);
};
