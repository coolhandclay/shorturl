var port = process.env.PORT || 8080;
var mongo = require('mongodb');
var dburl = process.env.MONGOLAB_URI;
var express = require('express');
var autoIncrement = require("mongodb-autoincrement");
var buildUrl = require('./helpers/buildUrl.js');
var checkUrl = require('./helpers/checkUrl.js');
var app = express();


//INSTRUCTIONS//
app.get('/', function(req,res) {
   res.end('HELLO! Add a "/new/URL" to the end of the URL.'); 
});

//ADD A NEW SHORT URL//
app.get('/new/*', function(req, res) {
    var url = req.params[0];
    var count;
    if(checkUrl(url)) {
        mongo.MongoClient.connect(dburl, function(err, db) {
            if(err) {console.error('mongodb didnt connect')}
            
           autoIncrement.getNextSequence(db, 'urls', function (err, autoIndex) {
               if(err) console.err(err);
        var collection = db.collection('urls');
        collection.insert({
            _id: autoIndex,
            url: url
        }, function(err, data) { if(err) {console.error(err)} res.end(data.ops[0].url + ' saved as ' + data.ops[0]._id)});
        db.close();
           });
    }); 
        
            
    } else {
        res.end('invalid url');
    }
});

//REDIRECT TO SHORT URL//
app.get('/*', function(req, res) {
    console.log('2nd get');
    var redirect = '';
    var hash = req.params[0];
    console.log(hash);
   mongo.MongoClient.connect(dburl, function(err, db) {
       if(err) console.log('unable to connect to mongodb server: ' + err);
       var urls = db.collection('urls');
       
       /////////////////////////
       
       //IT EITHER NEEDS TO FIND THE AUTOMATICALLY ASSIGNED OBJECT ID, OR WE NEED TO ASSIGN OUR OWN ID AND FIND THAT
       
       /////////////////////////
       urls.find({_id:parseInt(hash)}).toArray(function(err, documents){ // this is where you'd want to hash the id to make it shorter
           if(err) throw err;
           console.log(documents[0].url);
           redirect = documents[0].url;
       });
       db.close();
   });
   res.redirect(redirect);
   res.end();
});
app.listen(port);