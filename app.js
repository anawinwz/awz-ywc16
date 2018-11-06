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
        let ajaxFunc = (method, endpoint, params, $cb) => $.ajax({
            type: method,
            url: ((endpoint.indexOf("api.spotify.com") == -1) ? "https://api.spotify.com" : "") + endpoint,
            data: params,
            dataType: "json",
            success: function (response) {
                if (typeof $cb != "undefined") $callback();
            },
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Bearer " + spotify.token);
            }
        });
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
        message: 'Hello Vue!',
        tracks: [
            {
                "album": {
                    "album_type": "single",
                    "artists": [
                        {
                            "external_urls": {
                                "spotify": "https://open.spotify.com/artist/6sFIWsNpZYqfjUpaCgueju"
                            },
                            "href": "https://api.spotify.com/v1/artists/6sFIWsNpZYqfjUpaCgueju",
                            "id": "6sFIWsNpZYqfjUpaCgueju",
                            "name": "Carly Rae Jepsen",
                            "type": "artist",
                            "uri": "spotify:artist:6sFIWsNpZYqfjUpaCgueju"
                        }
                    ],
                    "available_markets": [
                        "AD",
                        "AR",
                        "AT",
                        "AU",
                        "BE",
                        "BG",
                        "BO",
                        "BR",
                        "CA",
                        "CH",
                        "CL",
                        "CO",
                        "CR",
                        "CY",
                        "CZ",
                        "DE",
                        "DK",
                        "DO",
                        "EC",
                        "EE",
                        "ES",
                        "FI",
                        "FR",
                        "GB",
                        "GR",
                        "GT",
                        "HK",
                        "HN",
                        "HU",
                        "ID",
                        "IE",
                        "IL",
                        "IS",
                        "IT",
                        "JP",
                        "LI",
                        "LT",
                        "LU",
                        "LV",
                        "MC",
                        "MT",
                        "MX",
                        "MY",
                        "NI",
                        "NL",
                        "NO",
                        "NZ",
                        "PA",
                        "PE",
                        "PH",
                        "PL",
                        "PT",
                        "PY",
                        "RO",
                        "SE",
                        "SG",
                        "SK",
                        "SV",
                        "TH",
                        "TR",
                        "TW",
                        "US",
                        "UY",
                        "VN",
                        "ZA"
                    ],
                    "external_urls": {
                        "spotify": "https://open.spotify.com/album/0tGPJ0bkWOUmH7MEOR77qc"
                    },
                    "href": "https://api.spotify.com/v1/albums/0tGPJ0bkWOUmH7MEOR77qc",
                    "id": "0tGPJ0bkWOUmH7MEOR77qc",
                    "images": [
                        {
                            "height": 640,
                            "url": "https://i.scdn.co/image/966ade7a8c43b72faa53822b74a899c675aaafee",
                            "width": 640
                        },
                        {
                            "height": 300,
                            "url": "https://i.scdn.co/image/107819f5dc557d5d0a4b216781c6ec1b2f3c5ab2",
                            "width": 300
                        },
                        {
                            "height": 64,
                            "url": "https://i.scdn.co/image/5a73a056d0af707b4119a883d87285feda543fbb",
                            "width": 64
                        }
                    ],
                    "name": "Cut To The Feeling",
                    "release_date": "2017-05-26",
                    "release_date_precision": "day",
                    "type": "album",
                    "uri": "spotify:album:0tGPJ0bkWOUmH7MEOR77qc"
                },
                "artists": [
                    {
                        "external_urls": {
                            "spotify": "https://open.spotify.com/artist/6sFIWsNpZYqfjUpaCgueju"
                        },
                        "href": "https://api.spotify.com/v1/artists/6sFIWsNpZYqfjUpaCgueju",
                        "id": "6sFIWsNpZYqfjUpaCgueju",
                        "name": "Carly Rae Jepsen",
                        "type": "artist",
                        "uri": "spotify:artist:6sFIWsNpZYqfjUpaCgueju"
                    }
                ],
                "available_markets": [
                    "AD",
                    "AR",
                    "AT",
                    "AU",
                    "BE",
                    "BG",
                    "BO",
                    "BR",
                    "CA",
                    "CH",
                    "CL",
                    "CO",
                    "CR",
                    "CY",
                    "CZ",
                    "DE",
                    "DK",
                    "DO",
                    "EC",
                    "EE",
                    "ES",
                    "FI",
                    "FR",
                    "GB",
                    "GR",
                    "GT",
                    "HK",
                    "HN",
                    "HU",
                    "ID",
                    "IE",
                    "IL",
                    "IS",
                    "IT",
                    "JP",
                    "LI",
                    "LT",
                    "LU",
                    "LV",
                    "MC",
                    "MT",
                    "MX",
                    "MY",
                    "NI",
                    "NL",
                    "NO",
                    "NZ",
                    "PA",
                    "PE",
                    "PH",
                    "PL",
                    "PT",
                    "PY",
                    "RO",
                    "SE",
                    "SG",
                    "SK",
                    "SV",
                    "TH",
                    "TR",
                    "TW",
                    "US",
                    "UY",
                    "VN",
                    "ZA"
                ],
                "disc_number": 1,
                "duration_ms": 207959,
                "explicit": false,
                "external_ids": {
                    "isrc": "USUM71703861"
                },
                "external_urls": {
                    "spotify": "https://open.spotify.com/track/11dFghVXANMlKmJXsNCbNl"
                },
                "href": "https://api.spotify.com/v1/tracks/11dFghVXANMlKmJXsNCbNl",
                "id": "11dFghVXANMlKmJXsNCbNl",
                "is_local": false,
                "name": "Cut To The Feeling",
                "popularity": 63,
                "preview_url": "https://p.scdn.co/mp3-preview/3eb16018c2a700240e9dfb8817b6f2d041f15eb1?cid=774b29d4f13844c495f206cafdad9c86",
                "track_number": 1,
                "type": "track",
                "uri": "spotify:track:11dFghVXANMlKmJXsNCbNl"
            },
            {
                "album": {
                    "album_type": "single",
                    "artists": [
                        {
                            "external_urls": {
                                "spotify": "https://open.spotify.com/artist/6sFIWsNpZYqfjUpaCgueju"
                            },
                            "href": "https://api.spotify.com/v1/artists/6sFIWsNpZYqfjUpaCgueju",
                            "id": "6sFIWsNpZYqfjUpaCgueju",
                            "name": "Carly Rae Jepsen",
                            "type": "artist",
                            "uri": "spotify:artist:6sFIWsNpZYqfjUpaCgueju"
                        }
                    ],
                    "available_markets": [
                        "AD",
                        "AR",
                        "AT",
                        "AU",
                        "BE",
                        "BG",
                        "BO",
                        "BR",
                        "CA",
                        "CH",
                        "CL",
                        "CO",
                        "CR",
                        "CY",
                        "CZ",
                        "DE",
                        "DK",
                        "DO",
                        "EC",
                        "EE",
                        "ES",
                        "FI",
                        "FR",
                        "GB",
                        "GR",
                        "GT",
                        "HK",
                        "HN",
                        "HU",
                        "ID",
                        "IE",
                        "IL",
                        "IS",
                        "IT",
                        "JP",
                        "LI",
                        "LT",
                        "LU",
                        "LV",
                        "MC",
                        "MT",
                        "MX",
                        "MY",
                        "NI",
                        "NL",
                        "NO",
                        "NZ",
                        "PA",
                        "PE",
                        "PH",
                        "PL",
                        "PT",
                        "PY",
                        "RO",
                        "SE",
                        "SG",
                        "SK",
                        "SV",
                        "TH",
                        "TR",
                        "TW",
                        "US",
                        "UY",
                        "VN",
                        "ZA"
                    ],
                    "external_urls": {
                        "spotify": "https://open.spotify.com/album/0tGPJ0bkWOUmH7MEOR77qc"
                    },
                    "href": "https://api.spotify.com/v1/albums/0tGPJ0bkWOUmH7MEOR77qc",
                    "id": "0tGPJ0bkWOUmH7MEOR77qc",
                    "images": [
                        {
                            "height": 640,
                            "url": "https://i.scdn.co/image/966ade7a8c43b72faa53822b74a899c675aaafee",
                            "width": 640
                        },
                        {
                            "height": 300,
                            "url": "https://i.scdn.co/image/107819f5dc557d5d0a4b216781c6ec1b2f3c5ab2",
                            "width": 300
                        },
                        {
                            "height": 64,
                            "url": "https://i.scdn.co/image/5a73a056d0af707b4119a883d87285feda543fbb",
                            "width": 64
                        }
                    ],
                    "name": "Cut To The Feeling",
                    "release_date": "2017-05-26",
                    "release_date_precision": "day",
                    "type": "album",
                    "uri": "spotify:album:0tGPJ0bkWOUmH7MEOR77qc"
                },
                "artists": [
                    {
                        "external_urls": {
                            "spotify": "https://open.spotify.com/artist/6sFIWsNpZYqfjUpaCgueju"
                        },
                        "href": "https://api.spotify.com/v1/artists/6sFIWsNpZYqfjUpaCgueju",
                        "id": "6sFIWsNpZYqfjUpaCgueju",
                        "name": "Carly Rae Jepsen",
                        "type": "artist",
                        "uri": "spotify:artist:6sFIWsNpZYqfjUpaCgueju"
                    }
                ],
                "available_markets": [
                    "AD",
                    "AR",
                    "AT",
                    "AU",
                    "BE",
                    "BG",
                    "BO",
                    "BR",
                    "CA",
                    "CH",
                    "CL",
                    "CO",
                    "CR",
                    "CY",
                    "CZ",
                    "DE",
                    "DK",
                    "DO",
                    "EC",
                    "EE",
                    "ES",
                    "FI",
                    "FR",
                    "GB",
                    "GR",
                    "GT",
                    "HK",
                    "HN",
                    "HU",
                    "ID",
                    "IE",
                    "IL",
                    "IS",
                    "IT",
                    "JP",
                    "LI",
                    "LT",
                    "LU",
                    "LV",
                    "MC",
                    "MT",
                    "MX",
                    "MY",
                    "NI",
                    "NL",
                    "NO",
                    "NZ",
                    "PA",
                    "PE",
                    "PH",
                    "PL",
                    "PT",
                    "PY",
                    "RO",
                    "SE",
                    "SG",
                    "SK",
                    "SV",
                    "TH",
                    "TR",
                    "TW",
                    "US",
                    "UY",
                    "VN",
                    "ZA"
                ],
                "disc_number": 1,
                "duration_ms": 207959,
                "explicit": false,
                "external_ids": {
                    "isrc": "USUM71703861"
                },
                "external_urls": {
                    "spotify": "https://open.spotify.com/track/11dFghVXANMlKmJXsNCbNl"
                },
                "href": "https://api.spotify.com/v1/tracks/11dFghVXANMlKmJXsNCbNl",
                "id": "11dFghVXANMlKmJXsNCbNl",
                "is_local": false,
                "name": "Cut To The Feeling",
                "popularity": 63,
                "preview_url": "https://p.scdn.co/mp3-preview/3eb16018c2a700240e9dfb8817b6f2d041f15eb1?cid=774b29d4f13844c495f206cafdad9c86",
                "track_number": 1,
                "type": "track",
                "uri": "spotify:track:11dFghVXANMlKmJXsNCbNl"
            }
        ]
    }
});

