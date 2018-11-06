var spotify = {
    token: '',
    tokenExp: 0,

    getToken: function ($cb) {
        $.ajax({
            type: "POST",
            url: "http://localhost/awz-ywc16/spotifyToken.php",
            data: {
                passkey: "LOCALSPOTIFYAPI"
            },
            dataType: "json",
            success: function (response) {
                if (response && response.access_token && response.expires_in) {
                    spotify.token = response.access_token;
                    spotify.tokenExp = new Date().getTime() + response.expires_in;
                    if(typeof $cb != "undefined") $cb();
                }
            },
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Basic " + btoa(this.clientId + ':' + this.clientSecret));
            }
        });
    },

    ajax: function (method, endpoint, params, $cb) {
        let ajaxFunc = (method, endpoint, params, $cb) => {$.ajax({
            type: method,
            url: ((endpoint.indexOf("api.spotify.com") == -1) ? "https://api.spotify.com" : "") + endpoint,
            data: params,
            dataType: "json",
            success: function (response) {
                if (typeof $cb != "undefined") $cb();
            },
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Bearer " + spotify.token);
            }
        })};
        if(this.token.length==0 || new Date().getTime()>=this.tokenExp) this.getToken(ajaxFunc(method, endpoint, params, $cb));
    },
    get: function (endpoint, params, $cb) {
        this.ajax("GET", endpoint, params, $cb);
    },
    post: function (endpoint, params, $cb) {
        this.ajax("POST", endpoint, params, $cb);
    }
}
var app = new Vue({
    el: '#app',
    data: {
        tracks: [
        ]
    }
    
});
spotify.getToken(()=>{
    spotify.get('/v1/tracks/?ids=11dFghVXANMlKmJXsNCbNl,20I6sIOMTCkB6w7ryavxtO,7xGfFoTpQ2E7fRF5lN10tr',{},(resp)=>{
        this.data.tracks = resp;
    });
});

