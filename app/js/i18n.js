var userLang = (navigator.language) ? navigator.language : navigator.userLanguage; 
var locale = userLang.substring(0,2);
$().ready(function () {
  var url = '../_locales/' + userLang.substring(0,2) + '/messages.json';
  $.get(url, function (data) {
    var jsonData = JSON.parse(data);
  document.getElementById("thankYou").innerHTML = jsonData.thankYou.message;
  document.getElementById("syncMess").innerHTML = jsonData.syncMess.message;
  document.getElementById("startMess").innerHTML = jsonData.startMess.message;

  });
});