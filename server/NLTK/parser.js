var fs = require('fs');
var stemmer = require('./stemmer');
var STOPWORDS = JSON.parse(fs.readFileSync('./server/NLTK/stopwords.json', 'ascii'));

// Pre-process a given tweet input.
function parseMessage(message) {
    // Initialize the message word object.
    var unigrams = [];

    // -- Convert to lowercase.
    message = message.toLowerCase();

    // -- Delete the hashtags and @-reply HTML tags.
    message = message.replace(/<[sb]>([^<]*)<\/[sb]>/g, '$1')

    // -- Add hashtags and AT-users to the array of what to keep; they'll be deleted.
    // Use RegExp option to return captured groups.
    // TODO: Support more than one in one message string.
    /*    var pattern = /[#@]([_a-z0-9]+)/g
    var matches = pattern.exec(message);

    if (matches) {
        // Remove the first match (which is the entire match) and add the rest.
        matches.splice(0, 1);
        matches.forEach(function(match) {
            // Assign the match a score of one (for now).
            unigrams[match] = 1;
        });
    }*/

    // Extract the domains of sites that appear; we want to keep those for added metadata.
    // TODO: Use data-expanded-url.

    // -- Remove miscellaneous types of tags.
    message = message.replace(/<.*>/g, '');

    // -- Eliminate 'RT' or remessage.
    message = message.replace(/RT/g, '');

    // -- Replace periods with spaces so that sentences still hold.
    message = message.replace(/\./g, ' ');

    // -- Remove additional whitespace and other punctuation.
    message = message.replace(/[\s]+/g, ' ');
    message = message.replace(/(:?[!"?,:\+\*\(\)]|&[a-z]+;)/g, '');


    message = message.replace(/[^a-z0-9]|\s+|\r?\n|\r/gmi, " ");


    // -- Split what remains into an array.
    message = message.split(' ');
    //console.log('message', message);
    // -- Eliminate stop words.
    for (var i = 0; i < message.length; i++) {
        if (STOPWORDS.indexOf(message[i]) < 0 && message[i].length > 0) {
            // -- Stem them.
            var stemmed = stemmer.stem(message[i]);
            // -- Assign them a score of one (for now).
            if (stemmed !== undefined && stemmed.length > 2) {
                unigrams.push({
                    stem: stemmed,
                    word: message[i]
                });
            }
        }
    }
    //console.log('unigrams', unigrams);
    return unigrams;
}

exports.parseMessage = parseMessage