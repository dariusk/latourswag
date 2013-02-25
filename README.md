#LatourSwag

This bot mixes quotes from renowned sociologist Bruno Latour with [the last 100 results for the Twitter search "#swag and"](http://search.twitter.com/search.json?callback=?&rpp=100&q='%23swag+and').

The code in `latourswag.js` is pretty extensively commented, so hopefully it answers all your questions about how it oworks.

NOTE: this is the source code to an earlier version of @latourswag than what lives at the [official @LatourSwag twitter account](http://twitter.com/latourswag). I hope to update this soon with the newer version, but I had this one sitting around with the code already commented all nice and pretty.

##Instructions

Requires [node](http://nodejs.org/) and [npm](http://npmjs.org/) (installing node installs npm too). You also need a Twitter App access token, consumer key, and associated secrets. [You can get those here](https://dev.twitter.com/apps/new). You'll probably also want a fresh twitter account for your bot, though you could have it post to one you already own, too!

Clone the repo, then in your project directory, install the dependencies:

`$ npm install`

Next, edit `config.js` to include your Twitter App access token, consumer key, and associated secrets. This is important! Without this you'll be unable to tweet.

`$ node latourswag.js`

This will give you some output, including, after a bit, a bunch of text that is the tweet that's just been tweeted. You can check the twitter account to see if it's updated to verify that it actually works.
