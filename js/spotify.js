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
    })
  },

  ajax: function(method, endpoint, params, $cb, timeout) {
    let ajaxFunc = (method, endpoint, params, $cb, timeout) => {
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
        error: function(XMLHttpRequest, textStatus, errorThrown) {
          if (typeof $cb != 'undefined') $cb()
        },
        beforeSend: function(xhr) {
          xhr.setRequestHeader('Authorization', 'Bearer ' + spotify.token)
        },
        timeout: timeout ? timeout : 0,
      })
    }
    if (this.token.length == 0 || new Date().getTime() >= this.tokenExp)
      this.getToken(() => ajaxFunc(method, endpoint, params, $cb, timeout))
    else ajaxFunc(method, endpoint, params, $cb, timeout)
  },
  get: function(endpoint, params, $cb, timeout) {
    this.ajax('GET', endpoint, params, $cb, timeout)
  },
  post: function(endpoint, params, $cb, timeout) {
    this.ajax('POST', endpoint, params, $cb, timeout)
  },
}
