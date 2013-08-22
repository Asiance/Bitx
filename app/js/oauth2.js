/*
 * oauth2-chrome-extensions
 * <https://github.com/jjNford/oauth2-chrome-extensions>
 *
 * Copyright (C) 2012, JJ Ford (jj.n.ford@gmail.com)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * This is a streamlined version of Boris Smus solution (Aapache License v2.0).
 * <https://github.com/borismus/oauth2-extensions>
 *
 * <http://oauth.net/2/>
 *
 */

/* NOTE
 *
 * This was designed to work with the GitHub API v3. The source may need to be altered
 * to work with your providers API. However the method used to gain the OAuth2 token
 * should work if the code is correctly configured to the API being targeted.
 * Methods to update the token and save the expiration date may also need to be added.
 *
 */
(function() {

  window.OAuth2 = {

    /**
     * Initialize
     */
    init: function() {
      this._key = "basecampToken";
      this._refreshkey = "basecampRefreshToken";
      this._access_token_url = "https://launchpad.37signals.com/authorization/token"; // URL to api where token is request
      this._authorization_url = "https://launchpad.37signals.com/authorization/new"; // URL to api where user authorizes extension with
      this._client_id = "e41e44d7de71a7090bf36260b73dddabfa2f5ab7"; // Application ID
      this._client_secret = "c37ff0ef6d9a5cfb788c6977084374bc0ceb74dd"; // Application secret
      this._redirect_url = "http://www.google.com/basecamp-crx"; // URL where api will redirect access token request
      this._scopes = ['']; // API permissions being requested
    },

    /**
     * Begin
     */
    begin: function() {
      console.log('begin');
      var url = this._authorization_url + "?type=web_server&client_id=" + this._client_id + "&redirect_uri=" + this._redirect_url;
      chrome.tabs.create({url: url, selected: true});
    },

    /**
     * Parses Access Code
     *
     * @param url The url containing the access code.
     */
    parseAccessCode: function(url) {
      console.log('parseAccessCode');
      if(url.match(/\?error=(.+)/)) {
        chrome.tabs.getCurrent(function(tab) {
          chrome.tabs.remove(tab.id, function(){});
        });
      }
      else {
        this.requestToken(url.match(/\?code=([\w\/\-]+)/)[1]);
      }
    },

    /**
     * Request Token
     *
     * @param code The access code returned by provider.
     */
    requestToken: function(code) {
      var that = this;
      var xhr = new XMLHttpRequest();
      console.log('requestToken');

      xhr.addEventListener('readystatechange', function(event) {
        if(xhr.readyState == 4) {
          if(xhr.status == 200) {
            that.finish(JSON.parse(xhr.responseText).access_token, JSON.parse(xhr.responseText).refresh_token);
          }
          else {
            chrome.tabs.getCurrent(function(tab) {
              chrome.tabs.remove(tab.id, function(){});
            });
          }
        }
      });
      xhr.open('POST', this._access_token_url + "?type=web_server&client_id=" + this._client_id + "&redirect_uri=" + this._redirect_url + "&client_secret=" + this._client_secret + "&code=" + code, true);
      xhr.send();
    },

    /**
     * Finish
     *
     * @param token The OAuth2 token given to the application from the provider.
     */
    finish: function(token, refresh_token) {
      console.log('finish');
      try {
        window.localStorage[this._key] = token;
        window.localStorage[this._refreshkey] = refresh_token;
        chrome.tabs.create({url:'./views/auth-success.html'});
      }
      catch(error) {
        return null;
      }
      chrome.tabs.getCurrent(function(tab) {
        chrome.tabs.remove(tab.id, function() {});
      });
    },


    /**
     * Get Token
     *
     * @return OAuth2 access token if it exists, null if not.
     */
    getToken: function() {
      try {
        return window.localStorage[this._key];
      }
      catch(error) {
        return null;
      }

    },

    /**
     * Refresh Token
     *
     * @return a new token.
     */
    refreshToken: function() {
      try {
	var that = this;
	var xhr = new XMLHttpRequest();
	this.refresh_token = window.localStorage[this._refreshkey];

	xhr.addEventListener('readystatechange', function(event) {
          if(xhr.readyState == 4) {
            if(xhr.status == 200) {
              that.finish(JSON.parse(xhr.responseText).access_token, JSON.parse(xhr.responseText).refresh_token);
            }
            else {
              chrome.tabs.getCurrent(function(tab) {
		chrome.tabs.remove(tab.id, function(){});
              });
            }
          }
	});
 	xhr.open('POST', this._access_token_url + "?type=refresh&client_id=" + this._client_id + "&redirect_uri=" + this._redirect_url + "&client_secret=" + this._client_secret + "&refresh_token=" + this.refresh_token, true);
	xhr.send();
      }
      catch(error) {
        return null;
      }
    },

    /**
     * Delete Token
     *
     * @return True if token is removed from localStorage, false if not.
     */
    deleteToken: function() {
      try {
        delete window.localStorage[this._key];
        return true;
      }
      catch(error) {
        return false;
      }
    }
  };

  OAuth2.init();

})();

function initOAuth2() {
  /**
   * Open signin page for Basecamp
   */
  if ((token = OAuth2.getToken()) === undefined ) {
    OAuth2.begin();
  }
  else{
    OAuth2.refreshToken();
  }
}