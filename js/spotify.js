var spotify = {
  token: '',
  tokenExp: 0,

  getToken: function($cb) {
    $.ajax({
      type: 'POST',
      url: 'http://localhost/awz-ywc16/spotifyToken.php',
      data: {
        passkey: 'LOCALSPOTIFYAPI',
      },
      dataType: 'json',
      success: function(response) {
        if (response && response.access_token && response.expires_in) {
          spotify.token = response.access_token
          spotify.tokenExp = new Date().getTime() + response.expires_in * 1000
          if (typeof $cb != 'undefined') {
            console.log('Got token!')
            $cb()
          }
        }
      },
      beforeSend: function(xhr) {
        xhr.setRequestHeader(
          'Authorization',
          'Basic ' + btoa(this.clientId + ':' + this.clientSecret),
        )
      },
    })
  },

  ajax: function(method, endpoint, params, $cb) {
    let ajaxFunc = (method, endpoint, params, $cb) => {
      $.ajax({
        type: method,
        url:
          (endpoint.indexOf('api.spotify.com') == -1
            ? 'https://api.spotify.com'
            : '') + endpoint,
        data: params,
        dataType: 'json',
        success: function(response) {
          if (typeof $cb != 'undefined') $cb(response)
        },
        beforeSend: function(xhr) {
          xhr.setRequestHeader('Authorization', 'Bearer ' + spotify.token)
        },
      })
    }
    if (this.token.length == 0 || new Date().getTime() >= this.tokenExp)
      this.getToken(() => ajaxFunc(method, endpoint, params, $cb))
    else ajaxFunc(method, endpoint, params, $cb)
  },
  get: function(endpoint, params, $cb) {
    this.ajax('GET', endpoint, params, $cb)
  },
  post: function(endpoint, params, $cb) {
    this.ajax('POST', endpoint, params, $cb)
  },
}
