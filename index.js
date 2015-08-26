'use strict';

var http = require('http');
var constValues = require('./constValues.json');
var Component = require('./Component');
var ComponentResult = require('../ComponentResult.js');

function StatusScan(controllerCallBacks) {
  Component.call(this, controllerCallBacks, [], []);
}
StatusScan.prototype = Object.create(Component.prototype);

StatusScan.prototype.execute = function() {
  this._controllerCallBacks.providerRequest(constValues.providerTypes.facebook);
};

StatusScan.prototype._FACEBOOK_HOST = 'https://graph.facebook.com';

StatusScan.prototype._getPosts = function(graph, onComplete) {
  graph.get('/me/posts', function(err, res) {
    if (err) {
      console.log(err);
      return;
    }
    onComplete(res);
  });
};

StatusScan.prototype._getNewestMessagePost = function(postsResponse, onComplete) {
  var posts = postsResponse.data;

  for (var i = 0; i < posts.length; i++) {
    if (posts[i].hasOwnProperty('message')) {
      onComplete(posts[i]);
      return;
    }
  }

  if (postsResponse.paging.next) {
    var options = {
      host: this._FACEBOOK_HOST,
      path: postsResponse.paging.next.replace(this._FACEBOOK_HOST, '')
    };

    http.request(options, function(response) {
      var responseStr = '';

      response.on('data', function(chunk) {
        responseStr += chunk;
      });

      response.on('end', function() {
        this._getNewestMessagePost(JSON.parse(responseStr), onComplete);
      });
    }).end();
  }
};

StatusScan.prototype.setProvider = function(fbProvider) {
  var self = this;
  this._fbProvider = fbProvider;
  this._getPosts(fbProvider, function(response) {
    self._getNewestMessagePost(response, function(post) {
      self._controllerCallBacks.finish(
        new ComponentResult(constValues.componentOutputTypes.facebookLatestStatus, post));
    });
  });
};

module.exports = StatusScan;
