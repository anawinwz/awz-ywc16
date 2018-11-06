var app = new Vue({
    el: '#app',
    data: {
        loading: 1,
        trackId: '',
        tracks: {},
    },
    methods: {
        getArtist: function (artists) {
            let a = [];
            artists.forEach((artist) => {
                a.push(artist.name);
            })
            return a.join(", ");
        },
        processTracks: function (tracks, isFeature) {
            tracks.items.forEach((item) => {
                if (item.track)
                    app.$set(app.tracks, item.track.id, item.track);
                else
                    app.$set(app.tracks, item.id, item);
            });
            if (typeof isFeature == "undefined" || isFeature) {
                spotify.get('/v1/audio-features', { ids: Object.keys(app.tracks).join(",") }, (resp) => {
                    resp.audio_features.forEach((item) => {
                        if (!app.tracks[item.id]) return false;
                        app.$set(app.tracks[item.id], 'features', item);
                    });
                });
            }
        },
        search: function (q) {

            app.loading = 1;
            app.tracks = {};
            if (!q || q.length == 0) {
                spotify.get('/v1/playlists/37i9dQZEVXbMnz8KIWsvf9/tracks', { limit: 10, fields: 'items(track(id,name,artists(name),popularity,explicit,href,album(name,href,images)))' }, (resp) => {

                    app.processTracks(resp);
                    app.loading = 0;
                });
            } else {
                spotify.get('/v1/search', { q: q, type: 'track', limit: 10 }, (resp) => {
                    
                    app.processTracks(resp.tracks);
                    app.loading = 0;
                });
            }
        }
    }

});

app.search();
