var Twitter = require("twitter");
var Spotify = require("node-spotify-api");
var request = require("request");
var inquirer = require("inquirer");
var keys = require("./keys.js");
var fs = require("fs");

// Twitter works
// Spotify default works
// Spotify search works
// Movies default works
// Movies search works
// Random works
// Gui is broken


var cmd = process.argv[2];
var desc = "";
var input = "";

function conCat() {
  if (process.argv[3] !== undefined) {
    for (var i = 3; i < process.argv.length; i++) {
      desc = desc + "+" + process.argv[i];
    };
  } else {
    desc = "default"
  };
}

conCat();
switchCase(cmd, desc);

// This performs all the actions of the command line things
function switchCase(query, txt) {

  switch (query) {
    case "my-tweets":
      bringTweets();
      console.log("");
      console.log(`Did you know... there's a GUI! Just enter "node liri.js" into the command line :^)`)
      break;

    case "spotify-this-song":
      if (txt === "default") {
        input = "The+Sign+Ace+of+Base";
      } else {
        input = txt;
      };
      song(input);
      console.log("");
      console.log(`Did you know... there's a GUI! Just enter "node liri.js" into the command line :^)`)
      break;

    case "movie-this":
      if (txt === "default") {
        input = "Mr.Nobody";
      } else {
        input = txt;
      };
      findMovie(input);
      console.log("");
      console.log(`Did you know... there's a GUI! Just enter "node liri.js" into the command line :^)`);
      break;

    case "do-what-it-says":
      fs.readFile("./random.txt", "utf8", function(err, data) {
        if (err) {
          console.log(err);
        } else {
          var random = data.split(",");
          switchCase(random[0], random[1]);
        };
      });
      break;

    default:
      console.log("invalid command");
      gui();
      break;
  };
}

function gui() {
  // if command  isn't inputed, use the GUI
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
              if (inquirerResponse.song) {
                input = inquirerResponse.song;
              } else {
                input = "The+Sign+Ace+of+Base";
              };
              song(input);
            });
          break;

        case "I want to know more about a movie":
          inquirer
            .prompt([
              {
                type: "input",
                message: "What movie would you like to search today?",
                name: "movie"
              }
            ])
            .then(function(inquirerResponse) {
              if (inquirerResponse.movie) {
                input = inquirerResponse.movie;
              } else {
                input = "Mr.Nobody";
              };
              findMovie(input);
            });
          break;

        case "Just do something, ANYTHING!":
          switchCase("do-what-it-says", desc);
          break;
      };
    });
}

function bringTweets() {
  var client = new Twitter({
    consumer_key: keys.twitterKeys.consumer_key,
    consumer_secret: keys.twitterKeys.consumer_secret,
    access_token_key: keys.twitterKeys.access_token_key,
    access_token_secret: keys.twitterKeys.access_token_secret
  });

  var params = {screen_name: "@JimbobAlbob", limit: "20"};
  client.get('statuses/user_timeline', params, function(error, tweets, response) {
     if (!error) {
       for (var i = 0; i < tweets.length; i++) {
         console.log("");
         console.log(tweets[i].created_at);
         console.log(tweets[i].text);
       };
       // console.log(tweets);
     } else {
       console.log(error);
     };
 });
}

// Spotify stuff
function song(q) {
  var spotify = new Spotify({
    id: keys.spotifyKeys.clientID,
    secret: keys.spotifyKeys.clientSecret
  });
  spotify.search({ type: 'track,artist', query: q, limit: '1' }, function(err, data) {
    if (err) {
      return console.log('Error occurred: ' + err);
    };
    var spot = data.tracks.items[0];
    console.log("");
    console.log("Artist: " + spot.album.artists[0].name);
    console.log("Song: " + spot.name);
    console.log("On Spotify: " + spot.external_urls.spotify);
    console.log("Album: " + spot.album.name);
  });
}

// Movie stuff
function findMovie(mov) {
  var queryUrl = 'http://www.omdbapi.com/?apikey=40e9cece&t=' + mov;
  // console.log(queryUrl);
  request.get(queryUrl, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var bod = JSON.parse(body);
      console.log("");
      console.log("Title: " + bod.Title);
      console.log("Release Year: " + bod.Year);
      // I've noticed that the ratings can sometimes not exist, so this checks to see if we get a response
      if (bod.Ratings[0] !== undefined) {
        console.log(bod.Ratings[0].Source + ": " + bod.Ratings[0].Value);
      };
      if (bod.Ratings[1] !== undefined) {
        console.log(bod.Ratings[1].Source + ": " + bod.Ratings[1].Value);
      };
      console.log("Country: " + bod.Country);
      console.log("Language(s): " + bod.Language);
      console.log("Plot Summary: " + bod.Plot);
      console.log("Main Cast: " + bod.Actors);
    };
  });
}
