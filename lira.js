var Twitter = require("twitter");
var Spotify = require("node-spotify-api");
var request = require("request");
var inquirer = require("inquirer");
var keys = require("./keys.js");
var fs = require("fs");

// First step prompt
inquirer
  .prompt([
    {
      type: "list",
      message: "What is it you'd like to do today?",
      choices: ["Show me tweets", "I want to know more about a song", "I want to know more about a movie", "Just do something, ANYTHING!"],
      name: "firstStep"
    }
  ])
  .then(function(inquirerResponse) {

    var firstChoice = inquirerResponse.firstStep;

    switch (firstChoice) {
      case "Show me tweets":
        console.log("tweets");
        bringTweets();
        break;
      case "I want to know more about a song":
        inquirer
          .prompt([
            {
              type: "input",
              message: "What song would you like to lookup?",
              name: "song"
            }
          ])
          .then(function(inquirerResponse) {
            var search = inquirerResponse.song
            song(search);
          });
        break;
      case "I want to know more about a movie":
        console.log("movie");
        break;
      case "Just do something, ANYTHING!":
        console.log("random");
        break;
    };
  });

function bringTweets() {
  var client = new Twitter({
    consumer_key: keys.twitterKeys.consumer_key,
    consumer_secret: keys.twitterKeys.consumer_secret,
    access_token_key: keys.twitterKeys.access_token_key,
    access_token_secret: keys.twitterKeys.access_token_secret
  });

  var params = {screen_name: "@JimbobAlbob"};
  client.get('statues/user_timeline', params, function(error, tweets, response) {
     if (!error) {
       console.log(tweets);
     } else {
       console.log(error);
     };
 });
}

function song(q) {
  var spotify = new Spotify({
    id: keys.spotifyKeys.clientID,
    secret: keys.spotifyKeys.clientSecret
  });

  spotify.search({ type: 'track,artist', query: q, limit: '1' }, function(err, data) {
    if (err) {
      return console.log('Error occurred: ' + err);
    }
    var spot = data.tracks.items[0];

    console.log("Artist: " + spot.album.artists[0].name);
    console.log("Song: " + spot.name);
    console.log("On Spotify: " + spot.external_urls.spotify);
    console.log("Album: " + spot.album.name);
  });
}
