const features = [
  'acousticness',
  'valence',
  'danceability',
  'energy',
  'instrumentalness',
  'liveness',
  'speechiness',
]
const PolarGraph = {
  data: function() {
    return {}
  },
  template: `
  <div class="chart-container" style="position: relative; width:100%;">
    <canvas v-bind:id="'chart_'+_uid"></canvas>
  </div>
  `,
  props: ['data'],
  mounted() {
    console.log(this._uid)

    new Chart($('#chart_' + this._uid), {
      data: {
        datasets: [
          {
            label: 'Features',
            data: Object.values(this.data),
            backgroundColor: [
              'rgb(255, 99, 132)',
              'rgb(75, 192, 192)',
              'rgb(255, 205, 86)',
              'rgb(201, 203, 207)',
              'rgb(54, 162, 235)',
            ],
          },
        ],
        labels: Object.keys(this.data),
      },
      type: 'polarArea',
      options: {
        legend: {
          position: 'right',
        },
        scale: {
          display: false,
        },
      },
    })
  },
}
const Main = {
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.q = to.params.q ? to.params.q : ''
      if (!to.params.id || to.params.id == '') vm.search(vm.q)
      else if (vm.trackId != to.params.id) {
        vm.trackId = to.params.id
        if (!vm.tracks[to.params.id]) {
          vm.getTrack(vm.trackId)
        } else {
          if (!vm.tracks[to.params.id].album.genres) {
            vm.loading = 1
            vm.getAlbum(vm.tracks[to.params.id].album.id, to.params.id, () => {
              if (!vm.tracks[to.params.id].analysis) {
                vm.getTrackAnalysis(to.params.id, () => {
                  vm.loading = 0
                })
              } else {
                vm.loading = 0
              }
            })
          } else if (!vm.tracks[to.params.id].analysis) {
            vm.loading = 1
            vm.getTrackAnalysis(to.params.id, () => {
              vm.loading = 0
            })
          }
        }
      }
    })
  },
  watch: {
    $route(to, from) {
      this.trackId = to.params.id ? to.params.id : ''
      if (this.trackId == '') {
        if ((!to.params.q && this.q != '') || to.params.q != this.q) {
          if (!to.params.q || !from.params.q || to.params.q != from.params.q)
            this.search(to.params.q ? to.params.q : '')
        }
      } else {
        if (!this.tracks[to.params.id].album.genres) {
          this.loading = 1
          this.getAlbum(
            this.tracks[to.params.id].album.id,
            to.params.id,
            () => {
              if (!this.tracks[to.params.id].analysis) {
                this.getTrackAnalysis(to.params.id, () => {
                  this.loading = 0
                })
              } else {
                this.loading = 0
              }
            },
          )
        } else if (!this.tracks[to.params.id].analysis) {
          this.loading = 1
          this.getTrackAnalysis(to.params.id, () => {
            this.loading = 0
          })
        }
      }
    },
  },

  data: function() {
    return {
      loading: 1,
      isInit: true,
      q: '',
      trackId: '',
      tracks: {},
    }
  },
  methods: {
    getTrack: function(trackId, $cb) {
      this.loading = 1
      spotify.get('/v1/tracks/' + trackId, {}, resp => {
        if (!resp) {
          this.error = 'ไม่สามารถรับข้อมูลของเพลงได้'
          return false
        }

        this.tracks = {}
        this.processTracks({ items: [resp] }, () => {
          this.getAlbum(resp.album.id, resp.id, () => {
            this.getTrackAnalysis(resp.id, () => {
              this.loading = 0
            })
          })
        })
        //this.loading = 0
      })
    },
    getAlbum: function(albumId, trackId, $cb) {
      this.loading = 1
      spotify.get('/v1/albums/' + albumId, {}, resp => {
        if (!resp) {
          this.error = 'ไม่สามารถรับข้อมูลอัลบั้มได้'
          return false
        }

        if (typeof trackId != 'undefined' && trackId.length > 0) {
          for (idx in resp) {
            if (!this.tracks[trackId].album[idx]) {
              this.$set(this.tracks[trackId].album, idx, resp[idx])
            }
          }
        }
        if (typeof $cb == 'function') $cb()
      })
    },
    getTrackAnalysis: function(trackId, $cb) {
      this.loading = 1
      spotify.get('/v1/audio-analysis/' + trackId, {}, resp => {
        if (!resp) {
          this.error = 'ไม่สามารถรับข้อมูลการวิเคราะห์บทเพลงได้'
          return false
        }

        this.$set(this.tracks[trackId], 'analysis', resp)
        if (typeof $cb == 'function') $cb()
      })
    },
    getArtist: function(artists) {
      let a = []
      artists.forEach(artist => {
        a.push(artist.name)
      })
      return a.join(', ')
    },
    processTracks: function(tracks, $cb, isFeature) {
      tracks.items.forEach(item => {
        if (item.track) {
          this.$set(this.tracks, item.track.id, item.track)
          if (item.track.albums)
            this.$set(this.tracks[item.track.id], 'album', item.track.albums[0])
        } else {
          this.$set(this.tracks, item.id, item)
          if (item.albums)
            this.$set(this.tracks[item.id], 'album', item.albums[0])
        }
      })

      if (typeof isFeature == 'undefined' || isFeature) {
        spotify.get(
          '/v1/audio-features',
          { ids: Object.keys(this.tracks).join(',') },
          resp => {
            if (!resp) {
              this.error = 'ไม่สามารถรับข้อมูลลักษณะเด่นของเพลงได้'
              return false
            }
            resp.audio_features.forEach(item => {
              if (!this.tracks[item.id]) return false

              this.$set(this.tracks[item.id], 'features', {})
              if (item.tempo)
                this.$set(this.tracks[item.id], 'tempo', item.tempo)
              for (idx in item) {
                if (features.indexOf(idx) != -1) {
                  this.$set(
                    this.tracks[item.id]['features'],
                    idx[0].toUpperCase() + idx.slice(1),
                    item[idx],
                  )
                }
              }

              if (typeof $cb == 'function') $cb()
              else this.loading = 0
            })
          },
        )
      } else {
        if (typeof $cb == 'function') $cb()
        else this.loading = 0
      }
    },
    search: function(q) {
      if (q == this.q && !this.isInit) return
      this.isInit = false
      this.loading = 1
      this.tracks = {}
      if (!q || q.length == 0) {
        spotify.get(
          '/v1/playlists/37i9dQZEVXbMnz8KIWsvf9/tracks',
          {
            limit: 10,
            fields:
              'items(track(id,name,artists(name),popularity,explicit,href,album(name,id,images)))',
          },
          resp => {
            if (!resp) {
              this.error = 'ไม่สามารถรับข้อมูลเพลย์ลิสต์เพลงยอดนิยมได้'
              return false
            }

            this.q = q
            this.processTracks(resp)
          },
        )
      } else {
        spotify.get('/v1/search', { q: q, type: 'track', limit: 10 }, resp => {
          if (!resp) {
            this.error = 'ไม่สามารถรับข้อมูลการค้นหาได้'
            return false
          }
          this.q = q
          this.processTracks(resp.tracks)
        })
      }
    },
  },
  components: {
    'polar-graph': PolarGraph,
  },
  template: `
    <div>
      <div class="row align-items-center" id="headBar">
          <div class="col">
              <input type="search" v-show="trackId==''" v-bind:value="q" class="form-control" id="songQuery" placeholder="ชื่อเพลง/ศิลปิน Spotify" onchange="router.push('/search/'+this.value)">
              <template v-if="trackId!=''">
                <a href="javascript:history.go(-1)" class="btn btn-lg btn-outline-light">ย้อนกลับ</a>
                <h3 class="d-inline-block ml-2">ข้อมูลเชิงลึกของเพลง</h3>
              </template>
          </div>
      </div>
      <div class="row align-items-center" id="mainRow" v-bind:style="(trackId!='')?{background:'linear-gradient(to bottom, rgb(65, 65, 65) 0%, rgb(24, 24, 24) 100%)'}:{}">
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
                                  <small><span v-if="track.tempo">{{parseInt(track.tempo)}} BPM |
                                      </span>ความนิยม:
                                      {{track.popularity}}/100</small>
                                  <template v-if="track.features">
                                    <span class="badge badge-success" v-if="track.features.Valence >= 0.6">Positive</span>
                                    <span class="badge badge-primary" v-if="track.features.Danceability >= 0.65">Danceable</span>
                                    <span class="badge badge-info" v-if="track.features.Acousticness > 0.5">Acoustic</span>
                                    <span class="badge badge-secondary" v-if="track.features.Instrumentalness > 0.5">Instrumental</span>
                                  </template>
                              </div>
                          </div>
                      </router-link>
                  </div>
              </div>

              <template v-if="loading==0 && trackId!=''">
                <div class="row justify-content-center mb-5">
                  <div class="col-4 col-md-3 col-lg-2">
                    <img class="img-fluid album-img-lg" v-bind:src="(tracks[trackId].album.images.length > 0)?tracks[trackId].album.images[0].url:'img/albumDefault.png'">
                  </div>
                  <div class="col-8 col-md-5 col-lg-4">
                    <h3>{{tracks[trackId].name}} <span class="badge badge-secondary" v-show="tracks[trackId].explicit">Explicit</span></h3>
                    <p class="text-light">{{getArtist(tracks[trackId].artists)}}</p>
                    
                    <div class="albumInfo">
                      <p class="m-0"><small class="text-muted">{{tracks[trackId].album.album_type.toString().toUpperCase()}}</small></p>
                      <h5 class="text-spotify m-0">
                        {{tracks[trackId].album.name}}
                      </h5>
                      <p class="mb-1">
                        <span class="badge badge-spotify">
                        {{tracks[trackId].album.release_date.substring(0,4)}}
                        </span> <small>{{tracks[trackId].album.total_tracks}} เพลง</small>
                      </p>

                      ความนิยม: 
                      <div class="progress"  style="height: 5px;">
                        <div class="progress-bar bg-spotify" role="progressbar" v-bind:style="{width:tracks[trackId].album.popularity+'%'}"></div>
                      </div>
                      <p v-if="tracks[trackId].album.genres && tracks[trackId].album.genres.length>0"> 
                        <span class="badge badge-secondary" v-for="genre in tracks[trackId].album.genres">{{genre}}</span>
                      </p>
                    </div>


                  </div>
                </div>
                <div class="row justify-content-center">
                  <div class="col-9 col-md-6 col-lg-4">
                    <template v-if="tracks[trackId].features">
                      <polar-graph v-bind:data="tracks[trackId].features"></polar-graph>
                    </template>
                  </div>
                  <div class="col-12 col-md-6 col-lg-6">
                    Data
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
