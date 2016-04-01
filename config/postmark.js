module.exports = {

	// Used to configure Postmark. 

	postmarkKey: function(){

		var uristring =
    		process.env.POSTMARK_API_TOKEN || '144acc06-7bcf-46a0-89b0-5346f9c79bfa';
    		
    	return uristring;
    	
	},

	buildMessage: function(inviteId){
		url = process.env.HEROKUURL || 'http://localhost:3000/'
		return 'You have been invited to join CanYouPlay. ' + url + 'register?token=' + invite._id

	}
};
