var request = require('superagent');
var Rx = require('rx');

var clientId = process.argv[2];
if (!clientId) {
  console.error('Run with Instagram client_id:\nnpm start -- <client_id>\n');
  process.exit(0);
}

var participant = 'dimochka';
var interval = 5; // seconds
var postEndpoint = 'http://rxdisplay.neueda.lv/in';
var instagramTag = 'cat';


// Step 0: Helper to create Observable instances from HTTP requests
Rx.Observable.fromRequest = function(req) {
  return Rx.Observable.create(function(observable) {
    req.end(function(err, res) {
      if (err) {
        observable.onError(err);
      } else {
        observable.onNext(res);
      }
      observable.onCompleted();
    })
  });
};


// Step 1: Fetch from Instagram by tag
var apiRoot = 'https://api.instagram.com/v1/';
var fromInstagramByTag = function(tag) {
  var url = apiRoot + 'tags/' + tag + '/media/recent?client_id=' + clientId;
  return Rx.Observable.fromRequest(request.get(url));
};


// Step 2: Fetch with an interval and flatten
var rawPics = Rx.Observable.interval(interval * 1000).flatMap(function() {
  return fromInstagramByTag(instagramTag).flatMap(function(res) {
    return res.body.data;
  });
});


// Step 3: Restructure data and send to UI
var pics = rawPics.filter(function(pic) {
  return pic.location != null
    && pic.location.latitude != null
    && pic.location.longitude != null;
}).map(function(pic) {
  return {
    tag: instagramTag,
    url: pic.images.thumbnail.url,
    location: pic.location,
    participant: participant
  };
});
pics.subscribe(function(pic) {
  var req = request.post(postEndpoint).send(pic);
  Rx.Observable.fromRequest(req)
    .subscribe(function(res) {
      console.log(postEndpoint + ' <- ' + pic.url);
    }, function(err) {
      if (err.response) {
        console.log(err.response.text.trim());
      } else {
        console.log(err.code);
      }
    });
});
