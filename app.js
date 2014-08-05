
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
//var mongo = require('mongodb');
var mongoose = require('mongoose');
var mongo = require('mongoose').mongodb;

var app = express();

// all environments
process.env['MONGOHQ_URL'] = 'mongodb://re757575:635375@kahana.mongohq.com:10021/re757575db';
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// mongodb connect
mongoose.connect(process.env.MONGOHQ_URL);
var schema = new mongoose.Schema( { name: "string", created: "Date" }, { versionKey: false });
var Games = mongoose.model('games', schema);

var _list = function (rep) {
	Games.find({},function (err, result) {
		console.log(result);
		rep.json(result);
	});
};

app.get('/', routes.index);

app.get('/add/:gameName', function (req, rep) {
	var _name = req.params.gameName;
	var game = new Games({name: _name,created: new Date()});
	game.save(function (err) {
		if (err) {
			rep.send(err);
			return console.log("error:" + err);
		} else {
			rep.send("成功");
			return console.log("成功");
		}
	});
});

app.get('/list', function (req, rep) {
	_list(rep);
});

app.get('/count', function (req, rep) {
	Games.count({}, function (err, result) {
		rep.json([ {collection: 'games' , count: result } ]);
	});
});

app.get('/find/:id', function (req,rep) {
	var _id = req.params.id;
	Games.findById(_id, function (err, result) {
		if (err) {
			console.log("error:" + err);
			rep.send(err);
		} else {
			console.log(result);
			rep.json(result);
		}
	});
});

app.get('/update/:id', function (req,rep) {
	var _id = req.params.id;
	Games.findByIdAndUpdate(_id, { name: 'mongodb is good' }, function (err, result) {
		if (err) {
			console.log("error:" + err);
			rep.send(err);
		} else {
			console.log(_id + ' docum is update');
			rep.writeHead('302',{Location: '/list'});
			rep.end();
		}
	}); 
});

app.get('/remove/:id', function (req,rep) {
	var _id = req.params.id;
	if (_id == 'all') {
		Games.find({}).remove(function (err, result) {
			if (err) {
				console.log("error:" + err);
				rep.send(err);
				return 
			} else {
				console.log(_id + ' docum is remove');
				rep.writeHead('302',{Location: '/list'});
				rep.end();
			}
		});
	} else {
		Games.findByIdAndRemove(_id).remove(function (err, result) {
			if (err) {
				console.log("error:" + err);
				rep.send(err);
				return 
			} else {
				console.log(_id + ' docum is remove');
				rep.writeHead('302',{Location: '/list'});
				rep.end();
			}
		});
	}

/*
		// not executed
		var query = Games.find().remove({'name': '哈阿'});
		// executed
		query.remove({'name': '哈阿'}, function(err, result) {
			if (err) {
				return console.log("error:" + err);
			} else {
				return console.log('docs is remove');
			}
		});
		// executed without a callback (unsafe write)
		query.exec();
	*/
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
