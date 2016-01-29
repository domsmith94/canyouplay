var express = require('express');

var app = express();

app.set('view engine', 'jade');
app.use(express.static('public'));

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

var api = require('./routes/api'); // Define and use the API routes
app.use('/api', api);


app.get('/', function(req, res) {
	res.render('index',
		{title : 'CanYouPlay'})
});

app.get('/register', function(req, res){
	res.render('register');

})


var port = process.env.PORT || 3000;
app.listen(port);
console.log('canyouplay listening on port 3000');