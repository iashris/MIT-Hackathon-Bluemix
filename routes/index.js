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
var proceed=function(pero){
	var perz=pero;
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
	var months=['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
	var moviescreative=["Mulholland Dr. ","Adaptation. ","Enter the Void","The Holy Mountain","The Grand Budapest Hotel ","Birdman or (The Unexpected Virtue of Ignorance)","The Artist","Playtime","Being John Malkovich","Who Framed Roger Rabbit","Russian Ark","Synecdoche, New York","Eraserhead","The Lobster","Memento","Decasia","Dogville","Brazil","Only Lovers Left Alive ","eXistenZ","2001: A Space Odyssey","Sin City","Blue","Pleasantville","The Cook, the Thief, His Wife & Her Lover","Cannibal Holocaust ","Pulp Fiction","Zelig","The Discreet Charm of the Bourgeoisie","Paprika","Pan's Labyrinth","Evil Dead II","Waltz with Bashir","Suspiria","Exit Through the Gift Shop","Weekend","The Fall","My Dinner with Andre","Dogtooth","Last Year at Marienbad"];
	var moviesserious=["127 Hours","American Beauty","American History X","Argo","Babel","Dallas Buyers Club","The Departed","Fight Club","Filth","Gangs of New York","Gone Girl","Gran Torino","The Green Mile","Heat","Insomnia","Jackie Brown","The King's Speech","The Last King of Scotland","Layer Cake","Léon: The Professional","Lucky Number Slevin","Memento","Natural Born Killers","No Country for Old Men","One Flew Over the Cuckoo's Nest","Point Break","The Raid 2","Rain Man","Saving Private Ryan","Se7en","The Shawshank Redemption","Shutter Island","Slumdog Millionaire","Snatch","Stand by Me","Taken","The Talented Mr. Ripley","The Usual Suspects","The Wolf of Wall Street","127 Hours","American Beauty"];
	var monthdata=[];
	if(you.personality[0].percentile-perz[0].personality[0].percentile<0.2){
		//target is more open
		var muvis;
		months.forEach(function(v,i){
			muvis=moviescreative[parseInt(Math.random()*moviescreative.length)];
			monthdata[i]={month:months[i],movie:muvis}
		});

	}
		else
		{

			months.forEach(function(v,i){
			muvis=moviesserious[parseInt(Math.random()*moviesserious.length)];
			monthdata[i]={month:months[i],movie:muvis}
		});

	}
	resi.render('output',{imgsource:you.img,msg:msg,yourname:you.name,mo:monthdata});

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
					img:node.profile_image_url.replace('_normal',''),
					personality:prsnlty
				};
				console.log(q);
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
