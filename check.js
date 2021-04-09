const lines = require('./lines');

// Prevent Twitter rejecting lines as too long or as duplicate tweets.
function checkForTwitter (lines = [], charLimit = 280, dupeLimit = 6) {

    console.log(`Checking for lines longer than ${charLimit} characters, and for duplicate lines within ${dupeLimit} indices of each other.`);

    const longs = [];
    const dupes = [];
    let i, j, k;

    for (i = 0; i < lines.length; i++) {

        if (lines[i].length > charLimit) {
            longs.push({ index: i, line: lines[i] });
        }

        for (j = 1; j <= dupeLimit; j++) {
            k = i + j < lines.length ? i + j : -1 + j;
            if (lines[i] === lines[k]) {
                dupes.push({ index: i, line: lines[i] });
            }
        }
    }

    console.log('Longs:', longs);
    console.log('Dupes:', dupes);
}

checkForTwitter(lines);
