'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var findOrCreate = require('mongoose-findorcreate');

var TweeteursSchema = new Schema({
    account: String,
    date: Date,
    type: String,
    id_str: String,
    name: String,
    screen_name: String,
    location: String,
    profile_location: String,
    url: String,
    description: String,
    protected: String,
    followers_count: Number,
    friends_count: Number,
    listed_count: Number,
    created_at: Date,
    favourites_count: Number,
    utc_offset: String,
    time_zone: String,
    geo_enabled: Boolean,
    verified: Boolean,
    statuses_count: Number,
    lang: String,
    contributors_enabled: Boolean,
    is_translator: Boolean,
    is_translation_enabled: Boolean,
    profile_background_color: String,
    profile_background_image_url: String,
    profile_background_image_url_https: String,
    profile_background_tile: String,
    profile_image_url: String,
    profile_image_url_https: String,
    profile_link_color: String,
    profile_sidebar_border_color: String,
    profile_sidebar_fill_color: String,
    profile_text_color: String,
    profile_use_background_image: Boolean,
    default_profile: Boolean,
    default_profile_image: Boolean,
    following: Boolean,
    follow_request_sent: Boolean,
    notifications: Boolean,
    muting: Boolean
});

TweeteursSchema.plugin(findOrCreate);

module.exports = mongoose.model('Tweeteurs', TweeteursSchema);
