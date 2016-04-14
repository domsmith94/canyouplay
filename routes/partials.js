var express = require('express');
var router = express.Router();

router.get('/status', function(req, res){
		res.render('./app/partials/status',
		{
			auth: req.session.auth,
			user: req.session.user
		});
});

router.get('/:partial', function(req, res){
	var name = req.params.partial;
	res.render('./app/partials/' + name);

});

module.exports = router;