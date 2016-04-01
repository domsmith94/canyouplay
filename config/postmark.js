module.exports = {

	// Used to configure Postmark. 

	postmarkKey: function(){

		var uristring =
    		process.env.POSTMARK_API_TOKEN || "144acc06-7bcf-46a0-89b0-5346f9c79bfa";
    		
    	return uristring;
	}
};
