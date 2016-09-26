var port = process.env.PORT || 8080;
var mongo = require('mongodb').MongoClient;
var dburl = process.env.MONGOLAB_URI;
var express = require('express');
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
    if(checkUrl(url)) {
        mongo.connect(dburl, function(err, db) {
            if(err) {console.error('mongodb didnt connect')}
            var counters = db.collection('counters');
            var urls = db.collection('urls');
            counters.insert({_id:"urlid",sequence_value:0});
            function getNextSequenceValue(sequenceName){
                var sequenceDocument = db.counters.findAndModify({
                    query:{_id: sequenceName },
                    update: {$inc:{sequence_value:1}},
                    new:true
                });
                return sequenceDocument.sequence_value;
            }
            urls.insert({_id: getNextSequenceValue('urlid'), url: url}, function(err, data) {
                if(err) {console.error('insert didnt work')}
                res.end('Added ' + data.ops[0].url.toString() + ' as ' + data.ops[0]._id.toString());
            });
            db.close();
        });
        
    } else {
        res.end('invalid url');
    }
});

//REDIRECT TO SHORT URL//
app.get('/*', function(req, res) {
    console.log('2nd get');
    var redirect = '';
    var hash = req.params[0].toString();
   mongo.connect(dburl, function(err, db) {
       if(err) console.log('unable to connect to mongodb server: ' + err);
       var urls = db.collection('urls');
       
       /////////////////////////
       
       //IT EITHER NEEDS TO FIND THE AUTOMATICALLY ASSIGNED OBJECT ID, OR WE NEED TO ASSIGN OUR OWN ID AND FIND THAT
       
       /////////////////////////
       urls.find({_id: hash}).toArray(function(err, documents){ // this is where you'd want to hash the id to make it shorter
           if(err) throw err;
           if(documents[0]) {
            redirect = documents[0].url;
           } else {
               redirect = 'not found';
           }
           console.log(redirect);
       });
       db.close();
   });
   res.redirect(redirect);
   res.end();
});
app.listen(port);