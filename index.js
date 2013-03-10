#! /usr/bin/env node

var cli = require('commander');
var https = require('https');
var Twitty = require('./twitty').Twitty;
var fs = require('fs');

var twitty = new Twitty();

cli
    .version('0.0.1');

cli
    .command('auth')
    .description('Oauth with Twitter')
    .action(twitterAuth);

cli
    .command('update-status')
    .description('Updates Twitter status')
    .action(updateStatus);

cli
    .command('search <query> [filter]')
    .description('Query Twitter')
    .action(function(query, filter) {
        twitterSearch(query, filter);
    });

cli
    .option('--silent')
    .command('settings')
    .description('Command settings')
    .action(settings);

cli.parse(process.argv);

function settings() {
    cli.prompt('tweet: ', function(name) {
        console.log('hi %s', name);
        process.stdin.destroy();
    })
}

function deploy() {
    console.log('da');
    var get = {
        host : 'graph.facebook.com',
        port : 443,
        path : '/variu.sergiu',
        method : 'GET'
    };

    var request = https.request(get, function(res) {
        console.log('statusCode: ' + res.statusCode);

        res.on('data', function(data) {
            console.log('data:' + data);
        })
    });

    request.end();

    request.on('error', function(e) {
        console.log(e);
    });
}

function updateStatus() {
    cli.prompt('tweet: ', function(tweet) {
        twitty.updateStatus(tweet, function(err, data) {
            if (err) {
                console.log(err);
                process.exit(1);
            } else {
                console.log('Status updated');
                process.exit(1);
            }
        });
    });
}

function twitterAuth() {
    twitty.auth();
}

function twitterSearch(query, filter) {
    twitty.search(query, filter, function(err, data) {
        if (err) console.log(err);
        else {
            for (var i = 0; i < data.results.length; i++) {
                console.log(data.results[i].text);
            }
        }
    });
}
