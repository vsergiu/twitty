var OAuth = require('oauth').OAuth;
var Twitter = require('ntwitter');
var config = require('./config');
var fs = require('fs');

Twitty = function() {}

Twitty.prototype.auth = function() {
    var oa = new OAuth(config.twitter.requestTokenUrl, config.twitter.accessTokenUrl,
        config.twitter.key, config.twitter.secret, config.twitter.oauthVersion , null, config.twitter.hashVersion);

    this._getAuthRequestToken(oa);
}

Twitty.prototype._getAuthAccessToken = function(oa, oauth_token, oauth_token_secret, pin) {
    oa.getOAuthAccessToken(oauth_token, oauth_token_secret, pin,
        function(error, oauth_access_token, oauth_access_token_secret) {
            if (error) {
                if (parseInt(error.statusCode) == 401) {
                    throw new Error('The pin number you have entered is incorrect');
                }
            }
            console.log('Your OAuth Access Token: ' + oauth_access_token);
            console.log('Your OAuth Token Secret: ' + oauth_access_token_secret);

            var data = {
                oauthAccessToken : oauth_access_token,
                oauthAccessTokenSecret : oauth_access_token_secret
            };
            fs.writeFile('token.txt', JSON.stringify(data), function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('Data saved to file');
                    process.exit(1);
                }
            });
        });
}

Twitty.prototype._getAuthRequestToken = function(oa) {
    var self = this;
    oa.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret){
        if(error) {
            throw new Error(([error.statusCode, error.data].join(': ')));
        } else {
            console.log('In your browser, log in to your twitter account.  Then visit:')
            console.log(('https://twitter.com/oauth/authorize?oauth_token=' + oauth_token))
            console.log('After logged in, you will be promoted with a pin number')
            console.log('Enter the pin number here:');
            var stdin = process.openStdin();
            stdin.on('data', function(chunk) {
                var pin = chunk.toString().trim();
                self._getAuthAccessToken(oa, oauth_token, oauth_token_secret, pin);
            });
        }
    });
}

Twitty.prototype.updateStatus = function(tweet, callback) {
    fs.readFile('token.txt', 'utf8', function(err, data) {
        if (err) console.log(err);
        else {
            json = JSON.parse(data);

            var twit = new Twitter({
                consumer_key : config.twitter.key,
                consumer_secret : config.twitter.secret,
                access_token_key : json.oauthAccessToken,
                access_token_secret : json.oauthAccessTokenSecret
            });

            twit.updateStatus(tweet, function(err, data) {
                if (err) callback(err, null);
                else callback(null, data);

            });
        }
    });
}

Twitty.prototype.stream = function(filter, param) {
    fs.readFile('token.txt', 'utf8', function(err, data) {
        if (err) {
            console.log(err);
        } else {
            json = JSON.parse(data);

            var twit = new Twitter({
                consumer_key : config.twitter.key,
                consumer_secret : config.twitter.secret,
                access_token_key : json.oauthAccessToken,
                access_token_secret : json.oauthAccessTokenSecret
            });


            twit.stream(filter, param, function(stream) {
                stream.on('data', function (data) {
                    console.log(data.text);
                });
             });
        }
    });
}

Twitty.prototype.search = function(criteria, filter, callback) {
    fs.readFile('token.txt', 'utf8', function(err, data) {
        if (err) {
            console.log(err);
        } else {
            json = JSON.parse(data);

            var twit = new Twitter({
                consumer_key : config.twitter.key,
                consumer_secret : config.twitter.secret,
                access_token_key : json.oauthAccessToken,
                access_token_secret : json.oauthAccessTokenSecret
            });

            if (filter === undefined) {
                filter = {};
            }

            twit.search(criteria, filter, function(err, data) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, data);
                }
            });
        }
    });
}

exports.Twitty = Twitty;