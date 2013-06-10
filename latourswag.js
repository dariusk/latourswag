var Twit = require('twit');
var ent = require('ent');

// We set up a web server on port 3000 using express.js because we're hosting on Nodejitsu. If you're
// just running this on a server, or perhaps some non-Nodejitsu service, you can omit
// all the code from here up to "-- End express"
var app = require('express').createServer();
app.get('/', function (req, res) {
  res.send('Hi.');
});
app.listen(3000);
// -- End express

// Our twitter developer API info is in a file called 'config.js'
var T = new Twit(require('./config.js'));

function makeSwag() {

  // set up our two data sources (you can paste these in your browser to see the results, in JSON format)
  // URI for all recent #swag tweets with 'and' in them
  var swag = {q: "#swag and", count: 100, result_type: "recent"}; 
  // URI for all recent @latourbot tweets
  var latour = {q: "from:latourbot", count: 100, result_type: "recent"};
  var swags = [];
  var latours = [];
  var latoursShort = [];
  var pre = "";
  var post = "";
  var tweet = "";

  // get the swag tweets 
  T.get('search/tweets', swag, function(err, data) {
    // Stop if we receive an error instead of search results
    if (err) throw err
    // jettison the metadata, we just care about the results of the search
    var results = data.statuses;
    // look at each result and push it to an array called 'swags' if it is not an RT and ' and ' appears
    // more than 20 characters into the tweet
    for (var i = 0; i < results.length; i++) {
      var text = results[i].text;
      if (text.indexOf(' and ') !== -1 && text.indexOf('RT') == -1 && text.indexOf(' and ') > 20) {
        swags.push(text);
      }
    }
    console.log(swags.length);
    // get the latour tweets
    T.get('search/tweets', latour, function(err, data) {
      if(err) throw err;
      var results = data.statuses;

      // for each latour tweet, find the ones with ' and ' or a comma, and then only if the and or the comma
      // appear somewhat in the middle (30-90 characters). push those to the latours array.
      // OR if the whole latour tweet is less than 50 chars, we can prepend 'and' to it and push it to latoursShort
      for (var i = 0; i < results.length; i++) {
        var text = results[i].text;
        //console.log(text);

        if (text.indexOf(' and ') !== -1 || text.indexOf(', ') !== -1) {
          if ((text.indexOf(' and ') < 90 && text.indexOf(' and ') > 30) || (text.indexOf(', ') < 90 && text.indexOf(', ') > 30)) {
            latours.push(text);
          }
        }
        else if (text.length < 50) {
          //console.log(text);
          latoursShort.push(' and ' + text.toLowerCase());
        }
      }

      // OKAY now we have 'swags', an array containing a subset of swag tweets with 'and' in them,
      // and 'latours', an array containing a subset of @latourbot tweets with 'and' or ','

      console.log(latours.length);


      // now we randomize whether tweet takes the form "@latourbot and #swag" or "#swag and @latourbot"
      var latourfirst = true;
      var text = "";
      if (Math.random() < 0.5) {
        latourfirst = false;
      }

      // here we either pick a random latour or a random swag to start the tweet with
      if (latourfirst) {
        text = latours[Math.floor(Math.random() * latours.length)];
      }
      else {
        text = swags[Math.floor(Math.random() * swags.length)];
      }

      // by definition this will either have 'and' or a comma, so we grab all the text up to but not including
      // the conjunction. 'and' takes precedence because it allows for more natural sounding results
      // we call it 'pre' because it's the prefix

      if (text.indexOf(' and ') !== -1) {
        pre = text.substr(0, text.indexOf(' and '));
      }
      else if (text.indexOf(', ') !== -1) {
        pre = text.substr(0, text.indexOf(', '));
      }

      // now we pick a random latour or a random swag for end of our tweet

      if (latourfirst) {
        text = swags[Math.floor(Math.random() * swags.length)];
      }
      else {
        // this is just adding on those < 50 char latour quips since it only matters in the postfix context, not the prefix
        latours = latours.concat(latoursShort);
        text = latours[Math.floor(Math.random() * latours.length)];
      }

      // this time we extract the second half of the source tweet and put it in 'post'
      if (text.indexOf(' and ') !== -1) {
        post = text.substr(text.indexOf(' and ') + 5, 140);
      }
      else if (text.indexOf(', ') !== -1) {
        post = text.substr(text.indexOf(', ') + 2, 140);
      }

      // our tweet is joined on an " and " -- every @latourswag tweet has the word "and" in it!
      tweet = pre + " and " + post;
      // strip out URLs and usernames
      tweet = tweet.replace(/(https?:\/\/[^\s]+)/g, '');
      tweet = tweet.replace(/@[a-zA-Z0-9_]+/g, '');
      // decode any escaped characters so that '&lt;' will show as '<', etc
      tweet = ent.decode(tweet);
      // truncate to 140 chars so twitter doesn't reject it (most tweets are < 140 but some aren't)
      tweet = tweet.substr(0, 140);
      console.log(tweet);
      console.log(tweet.length);

      // tweet it!	

      T.post('statuses/update', {
        status: tweet
      }, function (err, reply) {});


    });
  });
}

// Tweet once when we start up the bot
makeSwag();

// Tweet every 15 minutes
setInterval(function () {
  try {
    makeSwag();
  }
  catch (e) {
    console.log(e);
  }
}, 1000 * 60 * 15);
