'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TweetsSchema = new Schema({
    account: String,
    date: {
        type: Date,
        default: Date.now
    },
    rule: { type: mongoose.Schema.Types.ObjectId, ref: 'TwitterRules' },
    text: String,
    lang: String,
    screen_name: String,
    retweet_count: String,
    favorite_count: String,
    hashtags: Schema.Types.Mixed,
    urls: Schema.Types.Mixed,
    user_mentions: Schema.Types.Mixed,
    symbols: Schema.Types.Mixed,
    media: Schema.Types.Mixed
});

module.exports = mongoose.model('Tweets', TweetsSchema);
