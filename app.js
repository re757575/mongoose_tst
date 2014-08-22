
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
var colors = require('colors');
	colors.setTheme({
	  silly: 'rainbow',
	  input: 'grey',
	  verbose: 'cyan',
	  prompt: 'grey',
	  info: 'green',
	  data: 'grey',
	  help: 'cyan',
	  warn: 'yellow',
	  debug: 'blue',
	  error: 'red'
	});
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

mongoose.connect(process.env.MONGOHQ_URL);
var schema = new mongoose.Schema( { name: "string", created: { type: Date, default: Date.now , required: true} }, { versionKey: false });
var Games = mongoose.model('games', schema);
var mongodbInfo = '';//Games.db.name +' => '+ Games.db.host + ':'+ Games.db.port;
	mongodbInfo += 'DbName:' + Games.db.name +'\n';
	mongodbInfo += 'host:' + Games.db.host +'\n';
	mongodbInfo += 'port:' + Games.db.port +'\n';
	mongodbInfo += 'collection:' + Games.collection.name +'\n';

console.log('\n');
console.log('/******* mongodb server info *******/'.help);
console.log(mongodbInfo.info);

var _list = function (resp, _sort) {
	var _s = (_sort == 'desc' ? -1 : 1);

	/* 查詢條件, [顯示的欄位: 1=顯示,0=不顯示], [跳過，筆數，排序]，callback  */

	// 1.直接callback
	/*
	Games.find({name: { $in: ['吃吃', 'abbcc'] }}, {_id: 0}, {skip: 0, limit: 5, sort: {name: _s} }, function (err, result) {
		console.log(result);
		resp.json(result);
	});
	*/

	// 2.使用exec Function
	//var query = Games.find({name: { $in: ['吃吃', 'abbcc'] }}, {_id: 0}, {skip: 0, limit: 10, sort: {name: _s} });
	var _q = {name: { $in: ['吃吃', 'abbcc'] }};
	var query = Games.find({}, {'': 0})
				.skip()
				.limit(100)
				.sort({created: _s});

	query.exec(function (err, result) {

		for (var i in result) {
			console.log(result[i]);
		}
		var output = {};
		output.collenction = Games.collection.name;
		output.count = result.length;
		output.docs = result;
		resp.statusCode = 200
		resp.json(output);
		/*
		resp.writeHead(200, {"Content-Type": "application/json"});
		resp.write(JSON.stringify(output));
		resp.end();
		*/
	});
};

app.get('/', routes.index);

app.get('/list', function (req, resp) {
	_list(resp);
});

app.get('/list/:sort', function (req, resp) {
	var _sort = req.params.sort;
	_list(resp, _sort);
});

app.get('/count', function (req, resp) {
	Games.count({}, function (err, result) {
		resp.json([ {collection: 'games' , count: result } ]);
	});
});

app.get('/find/:id', function (req,resp) {
	var _id = req.params.id;
	Games.findById(_id, function (err, result) {
		if (err) {
			console.log("error:" + err);
			resp.send(err);
		} else {
			console.log(result);
			resp.json(result);
		}
	});
});

app.get('/add/:gameName', function (req, resp) {
	var _name = req.params.gameName;
	var game = new Games({name: _name, created: new Date(), notSave: 'Hi!!'});
	game.save(function (err) {
		if (err) {
			resp.send(err);
			return console.log("error:" + err);
		} else {
			//resp.send("成功");
			resp.writeHead('302',{refresh:3, Location: '/list'});
			resp.write("成功");
			resp.end();
			return console.log("成功");
		}
	});
});

app.get('/update/:id', function (req,resp) {
	var _id = req.params.id;
	Games.findByIdAndUpdate(_id, { name: 'mongodb is good' }, function (err, result) {
		if (err) {
			console.log("error:" + err);
			resp.send(err);
		} else {
			console.log(_id + ' docum is update');
			resp.writeHead('302',{Location: '/list'});
			resp.end();
		}
	}); 
});

app.get('/remove/:id', function (req,resp) {
	var _id = req.params.id;
	if (_id == 'all') {
		Games.find({}).remove(function (err, result) {
			if (err) {
				console.log("error:" + err);
				resp.send(err);
				return 
			} else {
				console.log(_id + ' docum is remove');
				resp.writeHead('302',{Location: '/list'});
				resp.end();
			}
		});
	} else {
		Games.findByIdAndRemove(_id).remove(function (err, result) {
			if (err) {
				console.log("error:" + err);
				resp.send(err);
				return 
			} else {
				console.log(_id + ' docum is remove');
				resp.writeHead('302',{Location: '/list'});
				resp.end();
			}
		});
	}
});

http.createServer(app).listen(app.get('port'), function() {
  var nodeServer = 'Express server listening on port ' + app.get('port');
  console.log(nodeServer.info);
});
