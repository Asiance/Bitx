window.onload = function () {
    if((token = OAuth2.getToken()) === undefined ) {
        OAuth2.begin();
    }
    else {
        console.log("My token is " + token);
    }
}