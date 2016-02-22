var som = require('./som').create({iterationCount: 500});
som.init({});
var parser = require('./parser');

function train (tweet, callback) {
	var tweetWordsObject = parser.parseTweet(tweet.text);
	som.train(tweet.action, tweetWordsObject);

	callback(200, 'OK');
}

function map (tweets, callback) {
	// For each tweet, determine a relevance.
	var response = [];
	tweets.forEach(function (tweet) {
		var tweetWordsObject = parser.parseTweet(tweet.text);
		var result = som.classify(tweetWordsObject);
		response.push({'id': tweet.id, 'result': result});
	});

	callback(200, JSON.stringify(response));
}

exports.train = train;
exports.map = map;