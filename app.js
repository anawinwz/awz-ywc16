const Main = {
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.q = to.params.q ? to.params.q : ''
      vm.trackId = to.params.id ? to.params.id : ''
      if (vm.trackId == '') vm.search(vm.q)
      else if (!tracks[vm.trackId]) {
        //TODO: track get info
      }
    })
  },
  watch: {
    $route(to, from) {
      this.trackId = to.params.id ? to.params.id : ''
      if (this.trackId == '') {
        if (!to.params.q || to.params.q != this.q) {
          this.q = to.params.q ? to.params.q : ''
          this.search(this.q)
        }
      }
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
  template: `
    <div>
      <div class="row align-items-center" id="headBar">
          <div class="col">
              <input type="search" v-show="trackId==''" v-bind:value="q" class="form-control" id="songQuery" placeholder="ชื่อเพลง/ศิลปิน Spotify" onchange="router.push('/search/'+this.value)">
              <template v-if="trackId!=''">
                <a href="javascript:history.go(-1)" class="btn btn-lg btn-outline-light">ย้อนกลับ</a>
                <h3 class="d-inline-block w-50 ml-2">ข้อมูลเชิงลึกของเพลง</h3>
              </template>
          </div>
      </div>
      <div class="row align-items-center" id="mainRow" v-bind:style="(trackId!='')?{backgroundColor:'rgba(0,0,0,0.5)'}:{}">
          <template v-if="trackId!=''">
            <div style="width: 115vw;
            height: 115vh;
            filter: blur(60px);
            z-index: -1;
            position: fixed;
            top: 0;
            left: -6%;" v-bind:style="(trackId!='')?{background:'url('+((tracks[trackId].album.images.length > 0)?tracks[trackId].album.images[0].url:'img/albumDefault.png')+')',backgroundSize:'cover',filter:'blur(5px)'}:{}">
            </div>
          </template>
          <div class="col" id="leftPane">
              <center v-show="loading == 1">กำลังโหลด...</center>

              <div class="card" v-show="loading == 0 && trackId==''">
                  <div class="card-body">
                      <h1 class="text-muted" v-show="Object.keys(tracks).length==0">ไม่พบผลลัพธ์สำหรับคำค้นหาดังกล่าว</h1>
                      <router-link :to="'/track/'+id" v-for="(track,id) in tracks">
                          <div class="media song-item">
                              <img class="align-self-center mr-3" v-bind:src="(track.album.images.length > 0)?track.album.images[0].url:'img/albumDefault.png'"
                                  width="64">

                              <div class="align-self-center media-body">
                                  <h5 class="m-0">{{track.name}} <span class="badge badge-dark" v-if="track.explicit">Explicit</span></h5>
                                  <span>{{getArtist(track.artists)}}</span>
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
                      </router-link>
                  </div>
              </div>

              <template v-if="trackId!=''">
                <div class="row">
                  <div class="col-3">
                    <img class="img-fluid" v-bind:src="(tracks[trackId].album.images.length > 0)?tracks[trackId].album.images[0].url:'img/albumDefault.png'">
                  </div>
                  <div class="col-6">
                    <h3>{{tracks[trackId].name}}</h3>
                    <p>{{getArtist(tracks[trackId].artists)}}</p>
                    
                    <span class="text-success">{{tracks[trackId].album.name}}</span>

                  </div>
                </div>
              </template>
          </div>
      </div>
    </div>
    `,
}

const routes = [
  { path: '/', component: Main },
  { path: '/search/:q', component: Main },
  { path: '/track/:id', component: Main },
  { path: '*', redirect: '/' },
]

const router = new VueRouter({
  routes: routes,
  //base: '/awz-ywc16',
  //  mode: 'history'
})

const app = new Vue({
  router,
}).$mount('#app')
