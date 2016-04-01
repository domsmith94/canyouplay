var Ask = require('../models/ask');
var User = require('../models/users');
var SMS = require('../models/sms');
var auth = require('../config/auth');
var privateConfig = require('../config/private');
var accountSid = process.env.accountSid || privateConfig.accountSid;
var authToken = process.env.authToken || privateConfig.authToken;
var twilioAPI = require("twilio")
var twilio = twilioAPI(accountSid, authToken);

// This module is used to perform all the SMS functionality of my application. This includes both sending
// and receiving SMS. This is the only part of the application where twilio library is used. When CanYouPlay
// is running on Heroku environment, the relevant tokens are stored as environment variables. When running 
// locally these values are read from /config/private.js. 

module.exports = {

	// This is triggered when a person is Asked to play in a fixture and the player has chosen to receive
	// SMS notifications. The ObjectId of the Ask object in the mongo store is passed as parameter and retrieved.
	// We then check to see if any SMS objects for the players number exist in mongo (Only 1 number = 1 SMS object)
	// This is because the system can only have 1 outstanding SMS request for a player at a time due to the inability
	// to know which SMS request a player is responding to if there is more than 1. Old one is replaced if exists or
	// new one created. Then message is constructed and sent out. 

	sendSMS : function(askId) {
		Ask.findOne({_id: askId}).
			populate('fixture').
			populate('player').
			exec(function(err, ask){
				SMS.findOne({mobile: ask.player.mobile}, function(err, sms){
					if (err) {
						console.log(err)
						console.log('Problem accessing SMS collection for number ' + ask.player.mobile);
					} else if (!sms) {
						console.log('No SMS object found for ' + ask.player.mobile + '. Creating new one.');
						sms = new SMS();
					}

					sms.ask = ask._id;
					sms.mobile = ask.player.mobile;

					console.log('Constructing SMS message to send for Ask object '+ ask._id);
					var message = 'Hi ' + ask.player.firstname + '. You have been asked to play for ' + 
					ask.fixture.side + ' against ' + ask.fixture.opposition + ' on ' +
					ask.fixture.date + '. If you can play reply YES, if you can\'t reply NO. Thanks'

					twilio.messages.create({
						body: message,
						to: ask.player.mobile,
						from: "447481345982"
					}, function(err, message) {
						console.log('Sent SMS with Twilio SID - ' + message.sid);
						sms.save();
					});
				});
			});
	},

	// This is the final destination of what happens when a user replies to the twilio number. twilio
	// has been set up to forward the message (and it's meta data) to the URL 
	// http://canyouplay.herokuapp.com/app/sms-reply/, which then calls receivedSMS function, passing in the
	// message data. SMS object is found by the number that has sent message from mongo. Parse message and then
	// change the values of the Ask object to reflect the users response. Additional work is then done to update
	// a users availability and automatically reject any other Ask requests for the same date. Returns a response
	// 
	// TODO: Most of the code here is taken from api.js router.put('/ask') route (which is also used to reply 
	// to Ask requests). This code needs to be more modular and needs to be re-factored.

	receivedSMS : function(body) {
		SMS.findOne({mobile: body.From}, function(err, sms){
			Ask.findOne({_id: sms.ask})
			.populate('fixture')
			.exec(function(err2, ask){
				if (err || err2) {
					console.log(err);
					console.log(err2)
					console.log('There was a problem finding SMS from this number or Ask');
				} else {
					var reply = body.Body.toLowerCase();
					reply = reply.trim();
					var isPlaying = false;

					if (reply === 'yes') {
						isPlaying = true;
					}

					ask.responded = true;
					ask.is_playing = isPlaying;
					ask.response_date = Date.now();

					ask.save(function(err){
						if (err) {
							console.log('There was a problem updating Ask ' + ask_id);
							console.log(err);
						} else {
							// Now we must add the date of fixture to a date that is unavailable for person
							// as they are playing
							User.findOneAndUpdate(
								{_id: ask.player},
								{$addToSet: {not_avail_on: ask.fixture.date}}, 
								{safe: true, upsert: true},
								function(err, model) {
									if (err) {
										console.log(err);
									} else {
										console.log("Updated availability for user " + ask.player);
									}
								}
							);

							// The player has accepted to play on a date. This automatically rejects Asks requests to player
							// for same date...as he cannot play in 2 fixtures on same date
							Ask.find({player: ask.player, fixdate: ask.fixdate, responded: false},
							 function(err, asks) {
								for (var i = 0; i < asks.length; i++) {
									asks[i].responded = true;
									asks[i].playing = false;
									asks[i].save();
								}
							});
						}
					});
				}
			});

			sms.remove();
			var resp = twilioAPI.TwimlResponse();
			return resp.toString();

		});
	},
}