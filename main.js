const tweet = require('./tweet');

// Default index 0.
const index = parseInt(process.argv[2], 10) || 0;

// Default interval 77 minutes.
const interval = parseInt(process.argv[3], 10) || 1000 * 60 * 77;

console.log(`Initiating tweets, index ${index}, interval ${interval}...`);
tweet(index, interval);
