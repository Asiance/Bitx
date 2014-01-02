/*
 * Lib from https://github.com/jjNford/chrome-ex-oauth2
 * Modified to fit basecamp needs (URI parameters)
 */

(function () {
  window.oauth2 = {
    access_token_url: "https://launchpad.37signals.com/authorization/token", // URL to api where token is request
    authorization_url: "https://launchpad.37signals.com/authorization/new", // URL to api where user authorizes extension with
    client_id: "e41e44d7de71a7090bf36260b73dddabfa2f5ab7",
    client_secret: "c37ff0ef6d9a5cfb788c6977084374bc0ceb74dd",
    redirect_url: "http://www.google.com/basecamp-crx", // URL where api will redirect access token request
    scopes: [],

    key: "basecampToken",

    /**
     * Starts the authorization process.
     */
    start: function () {
      var url = this.authorization_url + "?type=web_server&client_id=" + this.client_id + "&redirect_uri=" + this.redirect_url;
      chrome.tabs.create({
        url: url,
        active: true
      });
    },

    /**
     * Finishes the oauth2 process by exchanging the given authorization code for an
     * authorization token. The authroiztion token is saved to the browsers local storage.
     * If the redirect page does not return an authorization code or an error occures when
     * exchanging the authorization code for an authorization token then the oauth2 process dies
     * and the authorization tab is closed.
     *
     * @param url The url of the redirect page specified in the authorization request.
     */
    finish: function (url) {
      function removeTab() {
        chrome.tabs.getCurrent(function (tab) {
          chrome.tabs.remove(tab.id);
        });
      };
      if (url.match(/\?error=(.+)/)) {
        removeTab();
      } else {
        var code = url.match(/\?code=([\w\/\-]+)/)[1];
        var that = this;

        // Send request for authorization token.
        var xhr = new XMLHttpRequest();
        xhr.addEventListener('readystatechange', function (event) {
          if (xhr.readyState == 4) {
            if (xhr.status == 200) {
              if (xhr.responseText.match(/error=/)) {
                removeTab();
              } else {
                console.log(xhr.responseText);
                var jsonResponse = JSON.parse(xhr.responseText);
                window.localStorage.setItem(that.key, jsonResponse.access_token);
                window.localStorage.setItem("basecampRefreshToken", jsonResponse.refresh_token);
                chrome.tabs.getCurrent(function (tab) {
                  chrome.tabs.update(tab.id, {url:'./views/auth-success.html'});
                });
              }
            } else {
              removeTab();
            }
          }
        });
        xhr.open('POST', this.access_token_url + "?type=web_server&client_id=" + this.client_id + "&redirect_uri=" + this.redirect_url + "&client_secret=" + this.client_secret + "&code=" + code, true);
        xhr.send();
      }
    },

    /**
     * Renew the token, based on the refresh token
     */
    renew: function () {
      var that = this
      // Send request for authorization token.
      var xhr = new XMLHttpRequest();
      var params = "type=refresh" +
                   "&client_id="     + encodeURIComponent(this.client_id) +
                   "&redirect_uri="  + encodeURIComponent(this.redirect_url) +
                   "&client_secret=" + encodeURIComponent(this.client_secret) +
                   "&refresh_token=" + encodeURIComponent(window.localStorage.basecampRefreshToken);
      xhr.open("POST", this.access_token_url, true);
      xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=utf-8");
      xhr.addEventListener("readystatechange", function (event) {
        if (xhr.readyState == 4) {
          if (xhr.status == 200) {
            var jsonResponse = JSON.parse(xhr.responseText);
            window.localStorage.setItem(that.key, jsonResponse.access_token);
            console.log("LOG: OAuth - Token renewed");
            window.backgroundTasks.start();
          } else {
            that.start();
          }
        }
      });
      xhr.send(params);
    },

    /**
     * Retrieves the authorization token from local storage.
     *
     * @return Authorization token if it exists, null if not.
     */
    getToken: function () {
      return window.localStorage.getItem(this.key);
    },

    /**
     * Clears the authorization token from the local storage.
     */
    clearToken: function () {
      delete window.localStorage.removeItem(this.key);
    }
  }
})();
