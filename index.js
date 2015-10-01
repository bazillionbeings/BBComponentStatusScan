'use strict';

let http = require('http');

let bbComponent = require('bb-component');
let constValues = bbComponent.constValues;
let ComponentResult = bbComponent.ComponentResult;
let Component = bbComponent.Component;

class StatusScan extends Component {
    constructor(controllerCallBacks) {
        super(this, controllerCallBacks, [], []);
        this._FACEBOOK_HOST = 'https://graph.facebook.com';
    }

    execute() {
        this._controllerCallBacks.providerRequest(constValues.providerTypes.facebook);
    }

    _getPosts(graph, onComplete) {
        graph.get('/me/posts', (err, res) => {
            if (err) {
                console.log(err);
                return;
            }
            onComplete(res);
        });
    }

    _getNewestMessagePost(postsResponse, onComplete) {
        let posts = postsResponse.data;

        for (let i = 0; i < posts.length; i++) {
            if (posts[i].hasOwnProperty('message')) {
                onComplete(posts[i]);
                return;
            }
        }

        if (postsResponse.paging.next) {
            let options = {
                host: this._FACEBOOK_HOST,
                path: postsResponse.paging.next.replace(this._FACEBOOK_HOST, '')
            };

            http.request(options, function (response) {
                let responseStr = '';

                response.on('data', function (chunk) {
                    responseStr += chunk;
                });

                response.on('end', function () {
                    this._getNewestMessagePost(JSON.parse(responseStr), onComplete);
                });
            }).end();
        }
    }

    setProvider(fbProvider) {
        this._fbProvider = fbProvider;
        this._getPosts(fbProvider, response => {
            this._getNewestMessagePost(response, post => {
                this._controllerCallBacks.result(new ComponentResult(constValues.componentOutputTypes.facebookLatestStatus, post));
                this._controllerCallBacks.finish();
            });
        });
    }
}

module.exports = StatusScan;
