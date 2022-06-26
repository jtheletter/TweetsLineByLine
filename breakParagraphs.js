// WARNING: This functions overwrites the work's "lines" file.

function breakParagraphs () {
    if (!Array.isArray(lines) || lines.length < 1) {
        console.error('Invalid lines. Expected an array of strings. Received:', lines);
        return;
    }

    let breakerInd, capInd, exceptionInd, fragInd, frags, lineInd;

    const caps = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const exceptions = [
        '!” I ',
        '0. ',
        '1. ',
        '2. ',
        '3. ',
        '4. ',
        '5. ',
        '6. ',
        '7. ',
        '8. ',
        '9. ',
        '?” I ',
        'Adm. ',
        'ADM. ',
        'Capt. ',
        'CAPT. ',
        'Cmdr. ',
        'CMDR. ',
        'Col. ',
        'COL. ',
        'Dr. ',
        'DR. ',
        'Gen. ',
        'GEN. ',
        'JR. ',
        'Jr. ',
        'Lt. ',
        'LT. ',
        'Maj. ',
        'MAJ. ',
        'Mr. ',
        'MR. ',
        'Mrs. ',
        'MRS. ',
        'Ms. ',
        'MS. ',
        'No. ',
        'NO. ',
        'Prof. ',
        'PROF. ',
        'Rev. ',
        'REV. ',
        'Sgt. ',
        'SGT. ',
        'St. ',
        'ST. ',
    ];
    const rawBreakers = [
        '! ',
        '! (',
        '! ‘',
        '! ’',
        '! “',
        '! “‘',
        '! “’',
        '!’ ',
        '!’ ‘',
        '!’ “',
        '!’” ',
        '!” ',
        '!” ‘',
        '!” ’',
        '!” “',
        '. ',
        '. (',
        '. ‘',
        '. ’',
        '. “',
        '. “‘',
        '. “’',
        '.’ ',
        '.’ ‘',
        '.’ “',
        '.’” ',
        '.” ',
        '.” ‘',
        '.” ’',
        '.” “',
        '? ',
        '? (',
        '? ‘',
        '? ’',
        '? “',
        '? “‘',
        '? “’',
        '?’ ',
        '?’ ‘',
        '?’ “',
        '?’” ',
        '?” ',
        '?” ‘',
        '?” ’',
        '?” “',
    ];
    const breakers = [];

    // Add spaced double capital initials (eg: `A. A.`) to exceptions array.
    for (let i = 0; i < caps.length; i++) {
        for (let j = 0; j < caps.length; j++) {
            exceptions.push(`${caps[i]}. ${caps[j]}.`);
        }
    }

    // Build `breakers` array containing every raw breaker suffixed by every capital letter.
    for (breakerInd = 0; breakerInd < rawBreakers.length; breakerInd++) {
        for (capInd = 0; capInd < caps.length; capInd++) {
            breakers.push(rawBreakers[breakerInd].concat(caps[capInd]));
        }
    }

    // Search all lines.
    for (lineInd = 0; lineInd < lines.length; lineInd++) {

        // Search each line for exceptions. If found, replace space in exception with non-breaking space, to prevent later break.
        for (exceptionInd = 0; exceptionInd < exceptions.length; exceptionInd++) {
            if (lines[lineInd].includes(exceptions[exceptionInd])) {
                lines[lineInd] = lines[lineInd].replaceAll(exceptions[exceptionInd], exceptions[exceptionInd].replace(' ', ' '));
            }
        }

        // Search each line for breakers. If found, create array of fragments split by breaker.
        for (breakerInd = 0; breakerInd < breakers.length; breakerInd++) {
            if (lines[lineInd].includes(breakers[breakerInd])) {
                frags = lines[lineInd].split(breakers[breakerInd]);

                // Split removes breaker. Re-add it to fragments.
                for (fragInd = 0; fragInd < frags.length - 1; fragInd++) { // For every fragment but last...
                    frags[fragInd] += breakers[breakerInd].split(' ')[0]; // Concat first half of breaker back onto end of fragment.
                    frags[fragInd + 1] = breakers[breakerInd].split(' ')[1] + frags[fragInd + 1]; // Concat second half of breaker onto start of next fragment.
                }

                // Splice fragments back into lines.
                lines.splice(...[lineInd, 1].concat(frags));
            }
        }
    }
    return lines;
}

console.log('process.argv:', process.argv);

const worksObject = require('./works');
const works = Object.keys(worksObject);
const work = process.argv[2];
const fs = require('fs');

if (!works.includes(work)) {
    throw new Error(`Invalid work: ${work}`);
}

let lines = require(`./lines/${work}`);
lines = breakParagraphs();

lines.forEach(function (line, ind) {
    lines[ind] = line.replace(/\n/g, '\\n'); // Preserve in-string newlines.
});

let data = `module.exports = [\n\'${lines.join('\',\n\'')}\',\n];\n`; // Create data string to write file.

fs.writeFile(`./lines/${work}.js`, data, function (error) {
    if (error) {
        throw error;
    }
    console.log('File saved.');
});
