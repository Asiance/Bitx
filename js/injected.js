/*
 * Script loaded by adapter.html to process the authentification
 */
window.onload = function () {
  OAuth2.parseAccessCode(window.location.href);
}