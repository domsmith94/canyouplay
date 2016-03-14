var Ask = require('../models/ask');
var SMS = require('../models/sms');
var auth = require('../config/auth');

var privateConfig = require('../config/private');
var accountSid = process.env.accountSid || privateConfig.accountSid;
var authToken = process.env.authToken || privateConfig.authToken;
var twilio = require("twilio")(accountSid, authToken);

module.exports = {

	sendSMS : function(askId) {
		Ask.findOne({_id: askId}).
			populate('fixture').
			populate('player').
			exec(function(err, ask){
				sms = new SMS();
				sms.ask = ask._id;
				sms.mobile = ask.player.mobile;

				var message = 'Hi ' + ask.player.firstname + '. You have been asked to play for ' + 
								ask.fixture.side + ' against ' + ask.fixture.opposition + ' on ' +
								ask.fixture.date + '. If you can play reply YES, if you can\'t reply NO. Thanks'

				twilio.messages.create({
					body: message,
					to: ask.player.mobile,
					from: "447481345982"
				}, function(err, message) {
					console.log(message.sid);
					sms.save();
				});

			});

	},

	receivedSMS : function(body) {
		SMS.findOne({mobile: body.From}, function(err, sms){
			Ask.findOne({_id: sms.ask})
			.populate('fixture')
			.exec(function(err2, ask){
				if (err) {
					console.log(err);
					console.log('There was a problem');
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
							console.log(err);
							res.send({'success': false});
						} else {
							res.send({'success': true});

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
							Ask.find({player: ask.player, fixdate: ask.fixdate, responded: false}, function(err, asks) {
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


		});

	},

}



