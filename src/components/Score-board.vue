<template>
  <div class="scoreWrap bgMain">
    <canvas class="rankCanvas" id="rankCanvas" width="900" height="1580"></canvas>
    <div class="scoreHead center-flex">
      <h2 class="scoreTitle" id="text2">Skor</h2>
      <div class="scoreHead__wrap">
        <button class="button buttonHead scoreBtn -download" @click="downloadCanvas('yes')">
          <span class="buttonIcon icon-download"></span>
        </button>
        <button class="button buttonHead -share" @click="downloadCanvas('no')">
          <span class="buttonIcon icon-share"></span>
        </button>
      </div>
    </div>
    <div class="scoreLvl center-flex">
      <button class="button buttonScore buttonMenu"
        v-for="tab in tabs"
        :key="tab.tabname"
        :class="{ '-active': currentTab === tab.tabname }" @click="currentTab = tab.tabname">
        {{ tab.text }} Huruf
      </button>
    </div>
    <div class="scoreContent">
      <keep-alive>
        <component :is="currentTab" class="tab" :users="users"></component>
      </keep-alive>
    </div>
  </div>

  <Teleport to="body">
    <!-- use the modal component, pass in the prop -->
    <Modal_compo :show="showShare" @close="showShare = false">
      <template #header>
        <div class="modalHead align-center">
          <h3 class="modalTitle">Bagikan ke</h3>
          <img
            src="@/assets/icon-share.png"
            class="modalShare__icon"
            alt=""
            width="25"
            height="28"
          />
        </div>
      </template>
      <template #body>
        <div class="modalShare__content">
          Ayo bagikan progres permainanmu. <br />
          Tantang teman untuk adu skor.
        </div>

        <div class="modalShare__list align-center">
          <button class="button buttonSecondary buttonShare" @click="downloadCanvas()">
            <img
              src="@/assets/icon-share.png"
              class="modalShare__icon"
              alt=""
              width="15"
              height="16"
            />Bagikan
          </button>
          <button class="button buttonSecondary buttonShare" @click="downloadCanvas()">
            <img
              src="@/assets/share-save.png"
              class="modalShare__icon"
              alt=""
              width="16"
              height="16"
            />Simpan Gambar
          </button>
        </div>
      </template>

      <template #footer>
        <div class="modalShare__footer">
          <button class="button buttonSecondary" @click="showShare = false">
            <img
              src="@/assets/icon-close.png"
              class="modalIcon"
              alt=""
              width="15"
              height="15"
            />Tutup 
          </button>
        </div>
      </template>
    </Modal_compo>
  </Teleport>

  <!-- s: modal error -->
  <Teleport to="body">
    <Modal_compo :show="showError" @close="showError = false">
      <template #header>
        <div class="modalHead center-flex">
          <h3 class="modalTitle">Error</h3>
        </div>
      </template>
      <template #body>
        <div class="modalGame__body">
          <p>
            {{ showErrorMsg }}
          </p>
          <p>
            Jika Anda tetap mengalami hal yang sama berulang kali, kontak pengembang game.
          </p>
        </div>
      </template>
      <template #footer>
        <div class="modalGame__footer center-flex">
          <button class="button buttonPrimary" @click="$emit('backHome')">
            <img
              src="@/assets/icon-home-white.png"
              class="modalGame__icon"
              alt=""
              width="18"
              height="18"
            />Kembali ke Beranda
          </button>
        </div>
      </template>
    </Modal_compo>
  </Teleport>
  <!-- e: modal error -->
</template>

<script>
import axios from 'axios';
import Modal_compo from "@/components/Modal-compo.vue";
import score4_compo from "@/components/score4-board.vue";
import score5_compo from "@/components/score5-board.vue";
import score6_compo from "@/components/score6-board.vue";
import { getAnalytics, logEvent } from "firebase/analytics";

export default {
  components: {
    Modal_compo,
    score4_compo,
    score5_compo,
    score6_compo,
  },
  props: [
    "users"
  ],
  emits: ["backHome"],
  data() {
    return {
      showShare: false,
      currentTab: "score4_compo",
      tabs: [],
      showError: false,
      showErrorMsg: '',
      apiMyRank: {
        url: 'api/kata_kita/score',
        query: {
          myrank: {}
        },
        status: ''
      },
      userRank: {
        template: {
          rank: process.env.VUE_APP_BASE_URL+'bg-rank2.png'
        },
        name: '',
        rankNow: {
          level4: '',
          level5: '',
          level6: ''
        },
        status: ''
      },
    };
  },
  created() {
    this.tabs = [
      { id: 1, tabname: "score4_compo", text: "4" },
      { id: 2, tabname: "score5_compo", text: "5" },
      { id: 3, tabname: "score6_compo", text: "6" },
    ];
  },
  mounted() {
    // let _this = this
    logEvent(getAnalytics(), 'KATAKITA_KLIK_PAPANSKOR');
    if(this.users.kmpsid.length>0) {
      this.getRankAfter(4)
      this.getRankAfter(5)
      this.getRankAfter(6)
    }
  },
  methods: {
    initCanvas() {
      let _ = this
      let img
      let cn = document.getElementById('rankCanvas');
      let cx = cn.getContext('2d');

      img = new Image();
      img.onload = function () {
        cx.drawImage(img, 0, 0);
        let w = cn.width
        let h = cn.height

        // initial
        cx.font = "500 120px Roboto Slab";
        cx.fillStyle = "#fff";
        cx.textAlign = "center";
        cx.fillText(_.users.initial.toUpperCase(), w/2, h/3 + 5);

        // name
        cx.font = "700 50px Mukta";
        cx.fillStyle = "#333333";
        cx.textAlign = "center";
        cx.fillText((_.users.data.first_name+(_.users.data.last_name.length>0?' '+_.users.data.last_name:'')), w/2, h/2 - 100);

        // score txt
        cx.font = "400 45px Mukta";
        cx.fillStyle = "#333333";
        cx.textAlign = "left";
        cx.fillText("Tantangan 4 huruf", 100, h/2 + 100);
        cx.font = "400 45px Mukta";
        cx.fillStyle = "#333333";
        cx.textAlign = "left";
        cx.fillText("Tantangan 5 huruf", 100, h/2 + 240);
        cx.font = "400 45px Mukta";
        cx.fillStyle = "#333333";
        cx.textAlign = "left";
        cx.fillText("Tantangan 6 huruf", 100, h/2 + 380);

        // rank
        cx.font = "500 70px Roboto Slab";
        cx.fillStyle = "#ff512f";
        cx.textAlign = "right";
        cx.fillText((_.userRank.rankNow.level4.length>0?"#"+_.userRank.rankNow.level4:'-'), w - 100, h/2 + 100);

        cx.font = "500 70px Roboto Slab";
        cx.fillStyle = "#ff512f";
        cx.textAlign = "right";
        cx.fillText((_.userRank.rankNow.level5.length>0?"#"+_.userRank.rankNow.level5:'-'), w - 100, h/2 + 240);

        cx.font = "500 70px Roboto Slab";
        cx.fillStyle = "#ff512f";
        cx.textAlign = "right";
        cx.fillText((_.userRank.rankNow.level6.length>0?"#"+_.userRank.rankNow.level6:'-'), w - 100, h/2 + 380);
      };
      img.src = this.userRank.template.rank;
      img.setAttribute('crossorigin', 'anonymous'); // works for me
    },
    downloadCanvas(save) {
      logEvent(getAnalytics(), 'KATAKITA_PAPANSKOR_SHARE');
      let filesArray
      let url = document.getElementById('rankCanvas').toDataURL();
      if(save=='yes') {
        let tab = window.open('about:blank', '_blank');
        tab.document.write('<img src="'+url+'" style="height: 100%"/>');
      } else {

        fetch(url)
          .then(function (response) {
              return response.blob()
          })
          .then(function (blob) {
              let file = new File([blob], "kata-kita-rank.jpg", {
                  type: 'image/jpeg'
              });
              filesArray = [file];
  
              if (navigator.canShare && navigator.canShare({
                  files: filesArray
              })) {
                  navigator.share({
                      text: process.env.VUE_APP_TITLE+' \n\n'+process.env.VUE_APP_DESC+' \n\n',
                      files: filesArray,
                      title: process.env.VUE_APP_TITLE,
                      url: process.env.VUE_APP_SHORT_CL
                  });
              } else {
                let tab = window.open('about:blank', '_blank');
                tab.document.write('<img src="'+url+'" style="height: 100%"/>');
              }
          })
          .catch(function (error) {
              console.log(error);
          });
      }

    },
    getRankAfter(lvl) {
      let ermsg = 'Terdapat kesalahan sistem dalam memproses jawaban Anda, silakan refresh halaman ini.'
      let _this = this;
        axios.get(process.env.VUE_APP_API_URL + this.apiMyRank.url + '?level=' + lvl + '&kgid=' + this.users.kmpsid).then((response) => {
          if(response.data.myrank) {
            // this.userRank.rankNow.push({
            //   'level': lvl,
            //   'position': response.data.myrank.position
            // })
            if(lvl==4) {
              this.userRank.rankNow.level4 = response.data.myrank.position
            }
            if(lvl==5) {
              this.userRank.rankNow.level5 = response.data.myrank.position
            }
            if(lvl==6) {
              this.userRank.rankNow.level6 = response.data.myrank.position
            }
            this.userRank.name = response.data.myrank.name
          // } else {
            // console.log(lvl+' kosong')
            // _this.modalError(ermsg);
          }
          if(lvl==6) {
            _this.initCanvas()
          }
        }).catch((error) => {
          _this.modalError(ermsg);
          this.userRank.status = error.response.status
        });
        // console.log(this.userRank);
    },
    modalError(msg) {
      this.showError = true
      this.showErrorMsg = msg
    },
  }
};
</script>

<style scoped lang="scss">
.rank {
  &Canvas {
    position: absolute;
    // z-index: 9;
    visibility: hidden;
    opacity: 0;
    width: 100%;
    height: 100%;
  }
}
.score {
  &Content {
    position: relative;
    margin-left: 15px;
    margin-right: 15px;
    padding: 15px 10px;
    background: var(--cl-white);
    box-shadow: 0px 0px 10px rgba(51, 51, 51, 0.05);
    border-radius: 5px;
    height: calc(100% - 90px - 50px - 15px);
    overflow: hidden;
    z-index: 1;
  }
  &Wrap {
    position: absolute;
    top: 0;
    width: 100%;
    height: calc(100% - 56px);
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    z-index: 2;
  }
  &Head {
    margin-top: 30px;
    justify-content: space-between;
    width: 100%;
    height: 60px;
    padding: 0 5px;
    &__wrap {
      position: relative;
      padding-left: 10px;
      padding-right: 10px;
      display: flex;
      gap: 10px;
    }
  }
  &Title {
    margin-left: 10px;
    font-family: var(--font-parent);
    font-weight: 500;
    font-size: 24px;
    line-height: 32px;
    color: var(--cl-white);
  }
  &Lvl {
    padding-left: 11px;
    padding-right: 11px;
  }
  &Btn {
    &.-download {
      @media screen and (min-width: 768px) {
        display: none;
      }
    }
  }
}
.button {
  &Score {
    margin-left: 4px;
    margin-right: 4px;
    padding: 8px 10px;
  }
}
</style>