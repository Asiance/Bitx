window.onload = function () {
  /**
  * Open signin page for Basecamp
  */
  if ((token = OAuth2.getToken()) === undefined ) OAuth2.begin();
}