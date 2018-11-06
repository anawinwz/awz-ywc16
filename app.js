const Main = {
  beforeRouteEnter(to, from, next) {
    if (to.path == '/search/' || to.path == '/search') router.replace('/')
    next(vm => {
      vm.q = to.params.q ? to.params.q : ''
      vm.search(vm.q)
    })
  },
  watch: {
    $route(to, from) {
      this.q = to.params.q ? to.params.q : ''
      this.search(this.q)
      next()
    },
  },

  data: function() {
    return {
      loading: 1,
      q: '',
      trackId: '',
      tracks: {},
    }
  },
  methods: {
    getArtist: function(artists) {
      let a = []
      artists.forEach(artist => {
        a.push(artist.name)
      })
      return a.join(', ')
    },
    processTracks: function(tracks, isFeature) {
      tracks.items.forEach(item => {
        if (item.track) this.$set(this.tracks, item.track.id, item.track)
        else this.$set(this.tracks, item.id, item)
      })
      if (typeof isFeature == 'undefined' || isFeature) {
        spotify.get(
          '/v1/audio-features',
          { ids: Object.keys(this.tracks).join(',') },
          resp => {
            resp.audio_features.forEach(item => {
              if (!this.tracks[item.id]) return false
              this.$set(this.tracks[item.id], 'features', item)
            })
          },
        )
      }
    },
    search: function(q) {
      this.loading = 1
      this.tracks = {}
      if (!q || q.length == 0) {
        spotify.get(
          '/v1/playlists/37i9dQZEVXbMnz8KIWsvf9/tracks',
          {
            limit: 10,
            fields:
              'items(track(id,name,artists(name),popularity,explicit,href,album(name,href,images)))',
          },
          resp => {
            this.processTracks(resp)
            this.loading = 0
          },
        )
      } else {
        spotify.get('/v1/search', { q: q, type: 'track', limit: 10 }, resp => {
          this.processTracks(resp.tracks)
          this.loading = 0
        })
      }
    },
  },
  created() {
    //this.search(this.q)
  },
  template: `
    <div>
    <div class="row align-items-center" style="height:10vh;background:#313131;">
        <div class="col">
            <input type="search" v-bind:value="q" class="form-control" id="songQuery" placeholder="ชื่อเพลง/ศิลปิน Spotify" onchange="router.push('/search/'+this.value)">
        </div>
    </div>
    <div class="row align-items-center" id="mainRow">
        <div class="col-12" id="leftPane">
            <center style="display:none" v-show="loading == 1">Loading...</center>
            <div class="card" v-show="loading == 0">
                <div class="card-body">
                    <h1 class="text-muted" v-show="Object.keys(tracks).length==0">ไม่พบผลลัพธ์สำหรับคำค้นหาดังกล่าว</h1>
                    <a v-for="(track,id) in tracks">
                        <div class="media song-item">
                            <img class="align-self-center mr-3" v-if="track.album.images.length > 0" v-bind:src="track.album.images[0].url"
                                width="64">

                            <div class="align-self-center media-body">
                                <h5 class="m-0">{{track.name}} <span class="badge badge-dark" v-if="track.explicit">Explicit</span></h5>
                                <span>{{getArtist(track.artists)}} </span>
                                <br>
                                <small><span v-if="track.features.tempo">{{parseInt(track.features.tempo)}} BPM |
                                    </span>Popularity:
                                    {{track.popularity}}/100</small>
                                <span class="badge badge-success" v-if="track.features.valence >= 0.6">Positive</span>
                                <span class="badge badge-primary" v-if="track.features.danceability >= 0.65">Danceable</span>
                                <span class="badge badge-info" v-if="track.features.acousticness > 0.5">Acoustic</span>
                                <span class="badge badge-secondary" v-if="track.features.instrumentalness > 0.5">Instrumental</span>

                            </div>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    </div>
    </div>
    `,
}
const routes = [
  { path: '/', component: Main },
  { path: '/search/:q', component: Main },
  { path: '*', redirect: '/' },
]

const router = new VueRouter({
  routes,
})

const app = new Vue({
  router,
}).$mount('#app')
