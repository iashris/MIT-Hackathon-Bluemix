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


router.get('/getTweets/:handle', function (req, resi) {
	var names=req.params.handle.split('~');
//lets assume that names[0] is you and names[1] is all people.
var persons=[];
var proceed=function(perz){
	var you=perz.shift();
	var msg="";var perpo=0;
	for(var i=0;i<5;i++){
		var diff=you.personality[i].percentile-perz[0].personality[i].percentile;
		perpo+=Math.abs(diff);
		console.log('diff is '+diff);
		msg+=you.personality[i].trait_id+" : "+diff+'\n';
		//console.log(msg);
	}
	msg+="\nPercentile points to go : "+perpo;
	resi.send(msg);
}


for(var i=0;i<names.length;i++){
	var naam=names[i];
	twitter.get('users/search',{q:naam,page:1,count:1},function(err,users){
		var node=users[0];
		var paramsfortweets={screen_name:node.screen_name,count:250};
		twitter.get('statuses/user_timeline',paramsfortweets,function(err,tweetz,response){
			var paramsforpersonality = {
				content_items: tweetz.map(toContentItem),
				consumption_preferences: true,
				raw_scores: true,
				headers: {
					'accept-language': 'en',
					'accept': 'application/json'
				}
			}
			personality_insights.profile(paramsforpersonality, function(err, res) {
				console.log('resssult : '+res)
				var prsnlty=res.personality;
				var q={
					name:node.name,
					screen_name:node.screen_name,
					img:node.profile_image_url,
					personality:prsnlty
				};
				if(q!=null)persons.push(q);
				if(persons.length==names.length){
					proceed(persons);
				}
			});
		});
	});

	
}
//Persons are loaded


});


module.exports = router;
