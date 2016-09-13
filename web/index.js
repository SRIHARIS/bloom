var express = require('express');
var app = express();
var fs = require('fs')
var _ = require('lodash')
var engines = require('consolidate');
var mysql = require('mysql');
var bodyParser = require('body-parser')
var https = require('https');
var http = require('http');
/*
var options = {
    key: fs.readFileSync('./ssl/localhost.key'),
    cert: fs.readFileSync('./ssl/localhost.cert'),
};
*/
app.engine('hbs',engines.handlebars);
app.set('views','./views');
app.use('/asset',express.static(__dirname + '/public'));
app.set('view engine','hbs');
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

/*
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
*/

var routes = require('./routes')(app);

http.createServer(app).listen(3001);
//https.createServer(options, app).listen(1443); 