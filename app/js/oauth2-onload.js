/**
 * Script to check  if the OAuth2 tocken has been granted
 * Loaded when the Chrome extension opens
 */
window.onload = function () {
  if (window.oauth2.getToken() === null) {
    window.oauth2.start();
  }
};