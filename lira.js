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
        inquirer
          .prompt([
            {
              type: "input",
              message: "What movie would you like to search today?",
              name: "movie"
            }
          ])
          .then(function(inquirerResponse) {
            var movie;
            if (inquirerResponse.movie) {
              movie = inquirerResponse.movie;
            } else {
              movie = "Mr.Nobody";
            }

            findMovie(movie.trim());
          });
        break;
      case "Just do something, ANYTHING!":
        console.log("random");
        break;
    };
  });

// Twitter needs a lot of work
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
    console.log("");
    console.log("");
    console.log("Artist: " + spot.album.artists[0].name);
    console.log("Song: " + spot.name);
    console.log("On Spotify: " + spot.external_urls.spotify);
    console.log("Album: " + spot.album.name);
  });
}

function findMovie(mov) {
  var base_url = 'http://www.omdbapi.com/?apikey=40e9cece&t=';

  var queryUrl = base_url + mov;

  request.get(queryUrl, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var bod = JSON.parse(body);
      console.log("");
      console.log("");
      console.log("Title: " + bod.Title);
      console.log("Release Year: " + bod.Year);
      if (bod.Ratings[0] !== undefined) {
        console.log("IMDB: " + bod.Ratings[0].Value);
      };
      if (bod.Ratings[1] !== undefined) {
        console.log("Rotten Tomatoes: " + bod.Ratings[1].Value);
      };
      console.log("Country: " + bod.Country);
      console.log("Language(s): " + bod.Language);
      console.log("Plot Summary: " + bod.Plot);
      console.log("Main Cast: " + bod.Actors);
    };
  });
}
