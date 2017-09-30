var express = require('express');
var router = express.Router();
var tweets1=[];
var tweets2=[];
var twit=require('twitter'),
twitter=new twit({
	consumer_key:'J2QEWaSIzO438KGBS2CMNxF6U',
	consumer_secret:'mZ4IIWgWzvZUO06nJANWrW4Dpz2C7oFzYQ80kxvuyqZ97zeokQ',
	access_token_key:'845245489-qD66Z2zyo9LkUe7MHJ8SoTLfRXOk6bED0ynry78f',
	access_token_secret:'sYL0rGRMnSFy8dgDZAuOLA0IH5rGKrNQabnqDH00btGde'
});
var PersonalityInsightsV3 = require('watson-developer-cloud/personality-insights/v3');

var personality_insights = new PersonalityInsightsV3({
  username: "83e99eed-f755-443a-a298-0773602e8db9",
  password: "KD4O5dDyeQKd",
  version_date: '2016-10-20'
});
var toContentItem = function(tweet){
  return {
    id: tweet.id_str,
    language: tweet.lang,
    contenttype: 'text/plain',
    content: tweet.text.replace('[^(\\x20-\\x7F)]*',''),
    created: Date.parse(tweet.created_at),
    reply: tweet.in_reply_to_screen_name != null
  };
};
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/getTweets/:handle', function (req, res) {
var names=req.params.handle.split('~');
var params1 = {screen_name: names[0],count:200};
var params2 = {screen_name: names[1],count:200};

twitter.get('statuses/user_timeline', params1, function(error1, tweetz1, response) {
  	tweets1=tweetz1;
    // res.render('tweets',{tweets:tweets});
    twitter.get('statuses/user_timeline', params2, function(error2, tweetz2, response) {
    		tweets2=tweetz2;
   			 var params1 = {
			  // Get the content items from the JSON file.
			  content_items: tweets1.map(toContentItem),
			  consumption_preferences: true,
			  raw_scores: true,
			  headers: {
			    'accept-language': 'en',
			    'accept': 'application/json'
			  }
			}
			  var params2 = {
			  // Get the content items from the JSON file.
			  content_items: tweets2.map(toContentItem),
			  consumption_preferences: true,
			  raw_scores: true,
			  headers: {
			    'accept-language': 'en',
			    'accept': 'application/json'
			  }
			}
    		//res.render('tweets',{setone:tweets1,settwo:tweets2});
    		personality_insights.profile(params1, function(error, response1) {
			    
	    		personality_insights.profile(params2, function(error, response2) {
				   var personalitytwo=JSON.stringify(response2, null, 2);
	    		   var personalityone=JSON.stringify(response1, null, 2);
    				res.send(personalityone);
			  });
			  });
			});
    		
    });
  });




module.exports = router;
