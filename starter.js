var request = require('superagent');
var Rx = require('rx');

var clientId = process.argv[2];
if (!clientId) {
  console.error('Run with Instagram client_id:\nnpm start -- <client_id>\n');
  process.exit(0);
}

var participant = 'anonymous';
var interval = 5; // seconds
var postEndpoint = 'http://rxdisplay.neueda.lv/in';
var instagramTag = encodeURIComponent('ничоси');


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
  var url = ???;
  return Rx.Observable.???(request.get(url));
};


// Step 2: Fetch with an interval and flatten
var ticker = Rx.Observable.???;
var rawPics = ticker.flatMap(function() {
  return fromInstagramByTag(instagramTag).???(function(res) {
    return res.body.data;
  });
});


// Step 3: Filter and restructure data, then send to UI
var uniquePics = rawPics.???(function (pic) {
  return ???;
});
var pics = uniquePics.???(function(pic) {
  return {
    tag: instagramTag,
    ???
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
