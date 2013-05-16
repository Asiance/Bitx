window.onload = function() {
  var userLang = (navigator.language) ? navigator.language : navigator.userLanguage;
  var lang = userLang.substring(0,2);
  document.body.className = lang;
  document.getElementById("thankYou").innerHTML = window[lang].thankYou;
  document.getElementById("syncMess").innerHTML = window[lang].syncMess;
};