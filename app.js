const features = [
  "acousticness",
  "valence",
  "danceability",
  "energy",
  "instrumentalness",
  "liveness",
  "speechiness"
];
const PolarGraph = {
  data: function() {
    return {};
  },
  template: `
  <div class="chart-container" style="position: relative; width:100%; height: 240px;">
    <canvas v-bind:id="'chart_'+_uid"></canvas>
  </div>
  `,
  props: ["data"],
  mounted() {
    console.log(this._uid);

    new Chart($("#chart_" + this._uid), {
      data: {
        datasets: [
          {
            label: "Features",
            data: Object.values(this.data),
            backgroundColor: [
              "#9B59B6",
              "#5499C7",
              "#48C9B0",
              "#F4D03F",
              "#EC7063",
              "#34495E",
              "#D7DBDD"
            ]
          }
        ],
        labels: Object.keys(this.data)
      },
      type: "polarArea",
      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          position: "right"
        },
        scale: {
          display: false
        }
      }
    });
  }
};
const Main = {
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.q = to.params.q ? to.params.q : "";
      if (!to.params.id || to.params.id == "") vm.search(vm.q);
      else if (vm.trackId != to.params.id) {
        vm.trackId = to.params.id;
        if (!vm.tracks[to.params.id]) {
          vm.getTrack(vm.trackId);
        } else {
          if (!vm.tracks[to.params.id].album.genres) {
            vm.loading = 1;
            vm.getAlbum(vm.tracks[to.params.id].album.id, to.params.id, () => {
              vm.loading = 0;
            });
          }
          if (!vm.tracks[to.params.id].analysis) {
            vm.getTrackAnalysis(to.params.id);
          }
        }
      }
    });
  },
  watch: {
    $route(to, from) {
      this.trackId = to.params.id ? to.params.id : "";
      if (this.trackId == "") {
        if ((!to.params.q && this.q != "") || to.params.q != this.q) {
          if (!to.params.q || !from.params.q || to.params.q != from.params.q)
            this.search(to.params.q ? to.params.q : "");
        }
      } else {
        if (!this.tracks[to.params.id].album.genres) {
          this.loading = 1;
          this.getAlbum(
            this.tracks[to.params.id].album.id,
            to.params.id,
            () => {
              this.loading = 0;
            }
          );
        }
        if (!this.tracks[to.params.id].analysis) {
          this.getTrackAnalysis(to.params.id);
        }
      }
    }
  },

  data: function() {
    return {
      loading: 1,
      isInit: true,
      q: "",
      error: "",
      trackId: "",
      tracks: {},
      pitchs: [
        "C",
        "C#/Db",
        "D",
        "D#/Eb",
        "E",
        "F",
        "F#/Gb",
        "G",
        "G#/Ab",
        "A",
        "A#/Bb",
        "B"
      ],
      filter: "all"
    };
  },
  methods: {
    getTrack: function(trackId, $cb) {
      this.loading = 1;
      spotify.get("/v1/tracks/" + trackId, {}, resp => {
        if (!resp) {
          this.error = "ไม่สามารถรับข้อมูลของเพลงได้";
          return false;
        }
        this.error = "";
        this.tracks = {};
        this.processTracks({ items: [resp] }, () => {
          this.getAlbum(resp.album.id, resp.id, () => {
            this.loading = 0;
            this.getTrackAnalysis(resp.id);
          });
        });
      });
    },
    getAlbum: function(albumId, trackId, $cb) {
      this.loading = 1;
      spotify.get("/v1/albums/" + albumId, {}, resp => {
        if (!resp) {
          this.error = "ไม่สามารถรับข้อมูลอัลบั้มได้";
          return false;
        }
        this.error = "";
        if (typeof trackId != "undefined" && trackId.length > 0) {
          for (idx in resp) {
            if (!this.tracks[trackId].album[idx]) {
              this.$set(this.tracks[trackId].album, idx, resp[idx]);
            }
          }
        }
        if (typeof $cb == "function") $cb();
      });
    },
    getTrackAnalysis: function(trackId, $cb) {
      spotify.get(
        "/audioAnalysis.php?trackId=" + trackId,
        {},
        resp => {
          if (!resp) {
            this.$set(this.tracks[trackId], "analysisFailed", true);
            return false;
          }
          this.error = "";
          this.$set(this.tracks[trackId], "analysis", resp.track);
          if (typeof $cb == "function") $cb();
        },
        120000
      );
    },
    getDuration: function(ms) {
      let s = parseInt(ms / 1000);
      let min = parseInt(s / 60);
      s %= 60;
      return min + ":" + (s < 10 ? "0" + s : s);
    },
    getArtist: function(artists) {
      let a = [];
      artists.forEach(artist => {
        a.push(artist.name);
      });
      return a.join(", ");
    },
    classifyTrack: function(feature, data) {
      if (!data[feature]) return false;

      if (feature == "Valence") return data[feature] >= 0.6 ? true : false;
      else if (feature == "Danceability")
        return data[feature] >= 0.65 ? true : false;
      return data[feature] > 0.5 ? true : false;
    },
    processTracks: function(tracks, $cb, isFeature) {
      tracks.items.forEach(item => {
        if (item.track) {
          this.$set(this.tracks, item.track.id, item.track);
          if (item.track.albums)
            this.$set(
              this.tracks[item.track.id],
              "album",
              item.track.albums[0]
            );
        } else {
          this.$set(this.tracks, item.id, item);
          if (item.albums)
            this.$set(this.tracks[item.id], "album", item.albums[0]);
        }
      });

      if (typeof isFeature == "undefined" || isFeature) {
        spotify.get(
          "/v1/audio-features",
          { ids: Object.keys(this.tracks).join(",") },
          resp => {
            if (!resp) {
              this.error = "ไม่สามารถรับข้อมูลลักษณะเด่นของเพลงได้";
              return false;
            }
            this.error = "";
            resp.audio_features.forEach(item => {
              if (item == null || !this.tracks[item.id]) return false;

              this.$set(this.tracks[item.id], "features", {});
              if (item.tempo)
                this.$set(this.tracks[item.id], "tempo", item.tempo);
              for (idx in item) {
                if (features.indexOf(idx) != -1) {
                  this.$set(
                    this.tracks[item.id]["features"],
                    idx[0].toUpperCase() + idx.slice(1),
                    item[idx]
                  );
                }
              }
            });
            if (typeof $cb == "function") $cb();
            else this.loading = 0;
          }
        );
      } else {
        if (typeof $cb == "function") $cb();
        else this.loading = 0;
      }
    },
    search: function(q) {
      if (q == this.q && !this.isInit) return;
      this.isInit = false;
      this.loading = 1;
      this.tracks = {};
      if (!q || q.length == 0) {
        spotify.get(
          "/v1/playlists/37i9dQZEVXbMnz8KIWsvf9/tracks",
          {
            limit: 50,
            fields:
              "items(track(id,name,duration_ms,artists(name),popularity,explicit,href,album(name,id,images)))"
          },
          resp => {
            if (!resp) {
              this.error = "ไม่สามารถรับข้อมูลเพลย์ลิสต์เพลงยอดนิยมได้";
              return false;
            }
            this.error = "";
            this.q = q;
            this.filter = "all";
            this.processTracks(resp);
          }
        );
      } else {
        spotify.get("/v1/search", { q: q, type: "track", limit: 10 }, resp => {
          if (!resp) {
            this.error = "ไม่สามารถรับข้อมูลการค้นหาได้";
            return false;
          }
          this.error = "";
          this.q = q;
          this.filter = "all";
          this.processTracks(resp.tracks);
        });
      }
    }
  },
  components: {
    "polar-graph": PolarGraph
  },
  template: `
    <div>
      <div class="row align-items-center" id="headBar">
          <div class="col">
              <input type="search" v-show="trackId==''" v-bind:value="q" class="form-control" id="songQuery" placeholder="ชื่อเพลง/ศิลปิน Spotify" onchange="router.push('/search/'+this.value)">
              <template v-if="trackId!=''">
                <a href="javascript:history.go(-1)" class="btn btn-outline-light">ย้อนกลับ</a>
                <h3 class="d-inline-block ml-2">ข้อมูลเชิงลึกของเพลง</h3>
              </template>
          </div>
      </div>
      <div class="row align-items-center" id="mainRow" v-bind:style="(trackId!='')?{background:'linear-gradient(to bottom, rgb(65, 65, 65) 0%, rgb(24, 24, 24) 100%)'}:{}">
          <div class="col" id="leftPane">
              <center v-show="loading == 1 && !error">กำลังโหลด...</center>
              <div class="alert alert-danger" v-if="error">{{error}}</div>

              <div class="card" v-show="loading == 0 && trackId==''">
                  <div class="card-header">
                    <button class="btn btn-sm btn-outline-secondary" 
                    v-bind:class="{ active: filter=='all' }"  v-on:click="filter = 'all'">ทั้งหมด</button>
                    <button class="btn btn-sm btn-outline-secondary" 
                    v-bind:class="{ active: filter=='Valence' }" v-on:click="filter = 'Valence'">เชิงบวก</button> 
                    <button class="btn btn-sm btn-outline-secondary"
                    v-bind:class="{ active: filter=='Danceability' }" v-on:click="filter = 'Danceability'">เหมาะกับการเต้น</button>
                    <button class="btn btn-sm btn-outline-secondary"
                    v-bind:class="{ active: filter=='Acousticness' }" v-on:click="filter = 'Acousticness'">อะคูสติก</button>
                  </div>
                  <div class="card-body">
                      <h1 class="text-muted" v-show="Object.keys(tracks).length==0">ไม่พบผลลัพธ์สำหรับคำค้นหาดังกล่าว</h1>
                      <router-link :to="'/track/'+id" v-for="(track,id) in tracks"
                      v-if="filter=='all' || (filter!='all'&&track.features&&classifyTrack(filter,track.features))">
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
                                  <p class="d-inline-block m-0" v-if="track.features">
                                    <span class="badge badge-success text-serif" v-if="classifyTrack('Valence',track.features)">เชิงบวก</span>
                                    <span class="badge badge-primary text-serif" v-if="classifyTrack('Danceability',track.features)">เหมาะกับการเต้น</span>
                                    <span class="badge badge-info text-serif" v-if="classifyTrack('Acousticness',track.features)">อะคูสติก</span>
                                    <span class="badge badge-secondary text-serif" v-if="classifyTrack('Instrumentalness',track.features)">ดนตรีบรรเลง</span>
                                  </p>
                              </div>
                          </div>
                      </router-link>
                  </div>
              </div>

              <template v-if="loading==0 && trackId!=''">
                <div class="row justify-content-center mb-4">
                  <div class="col-4 col-md-3 col-lg-2 align-self-center">
                    <img class="img-fluid album-img-lg" v-bind:src="(tracks[trackId].album.images.length > 0)?tracks[trackId].album.images[0].url:'img/albumDefault.png'">
                  </div>
                  <div class="col-8 col-md-5 col-lg-4">
                    <h3 class="text-overflow songName">{{tracks[trackId].name}} <span class="badge badge-secondary" v-show="tracks[trackId].explicit">Explicit</span></h3>
                    <p class="text-light artistName">{{getArtist(tracks[trackId].artists)}}</p>
                    
                    <div class="albumInfo">
                      <p class="m-0"><small class="text-muted">{{tracks[trackId].album.album_type.toString().toUpperCase()}}</small></p>
                      <h5 class="text-overflow text-spotify m-0 d-inline-block" style="max-width:100%;margin-bottom: -5px !important;">
                        {{tracks[trackId].album.name}}
                      </h5>
                      <p class="mb-1 d-inline-block">
                        <span class="badge badge-spotify">
                        {{tracks[trackId].album.release_date.substring(0,4)}}
                        </span> <small>{{tracks[trackId].album.total_tracks}} เพลง</small>
                      </p>
                      <br>
                      <small class="text-light">ความนิยม:</small> 
                      <div class="progress"  style="height: 5px;">
                        <div class="progress-bar bg-spotify" role="progressbar" v-bind:style="{width:tracks[trackId].album.popularity+'%'}"></div>
                      </div>
                      <p v-if="tracks[trackId].album.genres && tracks[trackId].album.genres.length>0"> 
                        <span class="badge badge-secondary" v-for="genre in tracks[trackId].album.genres">{{genre}}</span>
                      </p>
                    </div>


                  </div>
                </div>
                <div class="row d-none d-lg-block">
                  <div class="col-6" style="margin:0 auto;">
                    <iframe v-bind:src="'https://open.spotify.com/embed/track/'+trackId" 
                    width="100%" height="80" frameborder="0" allowtransparency="true" 
                    allow="encrypted-media"></iframe>
                  </div>
                </div>
                <div class="row justify-content-center">
                  <div class="col-9 col-md-6 col-lg-4">
                    <template v-if="tracks[trackId].features">
                      <polar-graph v-bind:data="tracks[trackId].features"></polar-graph>
                    </template>
                  </div>
                  <div class="col-12 col-md-6 col-lg-5 align-self-center">
                    <div class="dataField" v-if="tracks[trackId].duration_ms">
                     <p>{{getDuration(tracks[trackId].duration_ms)}}</p>
                     ความยาว
                    </div>
                    <div class="dataField">
                      <div class="progress bg-dark" style="height: 5px;">
                        <div class="progress-bar bg-light" role="progressbar" v-bind:style="{width:tracks[trackId].popularity+'%'}"></div>
                      </div>
                      <p>{{tracks[trackId].popularity}}<small>/100</small></p>
                      ความนิยม
                    </div>
                    <div class="dataField">
                      <p>{{(tracks[trackId].tempo)?parseInt(tracks[trackId].tempo):"ไม่ทราบ"}}</p>
                      BPM
                    </div>
                    <template v-if="tracks[trackId].analysis">
                      <div class="dataField">
                        <p>{{(tracks[trackId].analysis.key==-1)?'ไม่ทราบ':pitchs[tracks[trackId].analysis.key]}}</p>
                        คีย์
                      </div>
                      <div class="dataField">
                        <p>{{(tracks[trackId].analysis.mode==-1)?'ไม่ทราบ':((tracks[trackId].analysis.mode)?'Major':'Minor')}}</p>
                        โหมด
                      </div> 
                      <div class="dataField">
                        <p>{{tracks[trackId].analysis.time_signature}}/4</p>
                        อัตราจังหวะ
                      </div>
                    </template>
                    <template v-else-if="tracks[trackId].analysisFailed">
                      <div class="dataField">
                        <p>Error</p>
                        โหลดข้อมูลเพิ่มเติมไม่ได้
                      </div>
                    </template>
                    <template v-else>
                      <div class="dataField">
                        <p><img src="img/loading.svg" width="32" height="32"></p>
                        กำลังโหลด...
                      </div>
                    </template>
                  </div>
                </div>
              </template>
          </div>
      </div>
    </div>
    `
};

const routes = [
  { path: "/", component: Main },
  { path: "/search/:q", component: Main },
  { path: "/track/:id", component: Main },
  { path: "*", redirect: "/" }
];

const router = new VueRouter({
  routes: routes,
  mode: "history"
});

const app = new Vue({
  router
}).$mount("#app");
