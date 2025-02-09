<template>
  <Header_compo />

  <div v-if="!isHidden" id="menuWrap" class="menuWrap">
    <button
      class="button buttonMenu -active -loading"
      id="btnstart"
      @click="hideMenu"
    >
      <span class="buttonIcon icon-game"></span>
      <span class="buttonTxt">Yuk Main</span>
    </button>
    <button class="button buttonMenu -loading" id="btnscore" @click="showScoreboard">
      <span class="buttonIcon icon-trophy"></span>
      <span class="buttonTxt">Papan Skor</span>
    </button>
  </div>

  <Menu_level @showGame="displayGame" v-if="showMenu" />

  <Game_compo :levelChar="levelChar" v-if="displayGameBoard" @playAgain='playAgain' @backHome='backHome' :users="users" />
  <Scoreboard_compo v-if="displayScoreboard" :users="users" />

  <Footer_compo :isBackActive="isBackActive" @backHome='backHome' @isLeave='isLeave' />

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
        </div>
      </template>
      <template #footer>
        <div class="modalGame__footer">
          <button class="button buttonPrimary" @click="backHome()">
            Refresh 
          </button>
        </div>
      </template>
    </Modal_compo>
  </Teleport>
  <!-- e: modal error -->

  <!-- s: modal leave -->
  <Teleport to="body">
    <Modal_compo :show="showLeave" @close="showLeave = false">
      <template #header>
        <div class="modalHead align-center">
          <h3 class="modalTitle">Meninggalkan Permainan</h3>
          <img
            src="@/assets/icon-clue.png"
            class="modalShare__icon"
            alt=""
            width="25"
            height="25"
          />
        </div>
      </template>
      <template #body>
        <div class="modalGame__body">
          <p>
            Apakah Anda yakin ingin meninggalkan permainan? <span style="font-weight: 700">Progres Anda akan hilang</span>.
          </p>
        </div>
      </template>
      <template #footer>
        <div class="modalGame__footer">
          <button class="button buttonPrimary" @click="showLeave = false">
            Batal 
          </button>
          <button class="button buttonSecondary" @click="backHome()">
            Ya, Saya Yakin 
          </button>
        </div>
      </template>
    </Modal_compo>
  </Teleport>
  <!-- e: modal leave -->

</template>

<script>
import axios from 'axios';
import { gsap, Expo, Back } from "gsap";
import Header_compo from "@/components/Header.vue";
import Menu_level from "@/components/Menu-level.vue";
import Game_compo from "@/components/Game.vue";
import Scoreboard_compo from "@/components/Score-board.vue";
import Footer_compo from "@/components/Footer.vue";
import Modal_compo from "@/components/Modal-compo.vue";
import { getAnalytics, logEvent } from "firebase/analytics";

export default {
  name: "App",
  components: {
    Header_compo,
    Menu_level,
    Game_compo,
    Scoreboard_compo,
    Footer_compo,
    Modal_compo,
  },
  data() {
    return {
      users: {
        data: {},
        error: '',
        isLogged: false,
        isMobile: false,
        isBgmPlay: process.env.VUE_APP_BGM,
        bgm: new Audio(require("@/assets/fx/kata-kita-bgm.mp3")),
        adUnit: process.env.VUE_APP_ADS_SLOT
      },
      showError: false,
      showErrorMsg: '',
      showLeave: false,
      showMenu: false,
      isHidden: false,
      isBackActive: false,
      displayScoreboard: false,
      displayGameBoard: false,
      levelChar: Number
    };
  },
  methods: {
    modalError(msg) {
      this.showError = true
      this.showErrorMsg = msg
    },
    userAgent() {
      if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
        this.users.isMobile = true
        this.users.adUnit = process.env.VUE_APP_ADS_SLOT_MOBILE
      } else {
        this.users.isMobile = false
        this.users.adUnit = process.env.VUE_APP_ADS_SLOT
      }
    },
    isLeave() {
      this.showLeave = true
    },
    backHome() {
      logEvent(getAnalytics(), 'KATAKITA_HOME');
      window.location.href = process.env.VUE_APP_BASE_URL
    },
    getCookie(cname) {
      let name = cname + "=";
      let decodedCookie = decodeURIComponent(document.cookie);
      let ca = decodedCookie.split(';');
      for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
          c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
          return c.substring(name.length, c.length);
        }
      }
      return "";
    },
    async getUsers() {
      let _this = this;
      let ermsg = 'Gagal memuat akun Anda, silakan refresh halaman ini.'
      try {
        const response = await axios.get("https://subs.kompas.com/api/v1/subscription?user_id=" + this.getCookie('kmps_usrid') + "&token=" + this.getCookie('kmp_uid') + "&loginwith=" + this.getCookie("lgn_w"));
        console.log(response.data);
        if (!response.ok) {
          const error = (response && response.message) || response.statusText;
          this.users.error = error
          // return Promise.reject(error);
        }

        if(!response.data.email) {
          this.users.isLogged = false
        } else {
          this.users.data = response.data
          this.users.kmpsid = this.getCookie('kmps_usrid')
          this.users.initial = response.data.first_name.substr(0,1).toUpperCase() + (response.data.last_name.length>0?response.data.last_name.substr(0,1).toUpperCase():'')
          this.users.isLogged = true
        }
        document.getElementById('btnstart').classList.remove('-loading')
        document.getElementById('btnscore').classList.remove('-loading')

      } catch (error) {
        _this.modalError(ermsg);
        console.log(error.response.status);
        this.users.error = error.response.status
      }
    },
    playAgain(bgm) {
      logEvent(getAnalytics(), 'KATAKITA_PLAY_PLAY_AGAIN');
      this.showResult = false
      this.isBackActive = true;
      this.displayGameBoard = false;
      this.users.isBgmPlay = bgm
      gsap.to("#logo", 0.5, {
        scale: 1,
        opacity: 1,
        ease: Expo.easeOut,
        onComplete: () => {
          this.showMenu = true;
        }
      });
      gsap.to("#headerTop", 0.5, {
        y: -90,
        opacity: 1,
        scale: 0.8,
        ease: Expo.easeOut,
      });
      gsap.to("#btnhome", 0.2, {
        display: 'none',
        ease: Expo.easeOut,
      });
      gsap.to("#btnhome2", 0.2, {
        display: 'block',
        delay: 0.2,
        ease: Expo.easeOut,
      });
    },
    displayGame(val) {
      this.levelChar = val;
      gsap.to("#headerTop", 0.5, {
        opacity: 0,
        ease: Expo.easeIn,
      });
      gsap.to("#logo", 0.5, {
        scale: 0,
        ease: Expo.easeIn,
      });
      gsap.to("#lvlWrap", 0.5, {
        y: 100,
        opacity: 0,
        ease: Expo.easeIn,
        onComplete: () => {
          this.displayGameBoard = true;
          this.showMenu = false;
          // gsap.to("#gameWrap", 1, {
          //   scale: 1,
          //   ease: Expo.easeOut,
          // });
        },
      });
      gsap.to("#btnback", 0.2, {
        display: 'none',
        ease: Expo.easeOut,
        // onComplete: () => {
        //   }
      });
      gsap.to("#btnhome2", 0.2, {
        display: 'none',
        ease: Expo.easeOut,
      });
      gsap.to("#btnhome", 0.2, {
        display: 'block',
        delay: 0.2,
        ease: Expo.easeIn,
      });
    },
    hideMenu() {
      logEvent(getAnalytics(), 'KATAKITA_KLIK_YUKMAIN');
      let _this = this
      if(!this.users.isLogged) {
        _this.openSSO()
      } else {
        gsap.to("#headerTop", 0.5, {
          y: -90,
          scale: 0.8,
          ease: Expo.easeOut,
        });
        gsap.to("#logo", 0.5, {
          scale: 1,
          ease: Expo.easeOut,
        });
        gsap.to("#ftLogo", 0.5, {
          opacity: 0,
          ease: Expo.easeIn,
        });
        gsap.to("#menuWrap", 0.5, {
          scale: 0,
          alpha: 0,
          ease: Back.easeIn,
          onComplete: () => {
            this.isHidden = true;
            this.showMenu = true;
          },
        });
        gsap.to("#btnback", 0.5, {
          display: "block",
          ease: Expo.easeOut,
        });
        this.isBackActive = !this.isBackActive;
        // console.log(this.userData);
      }
    },
    showScoreboard() {
      let _this = this
      if(!this.users.isLogged) {
        _this.openSSO()
      } else {
        gsap.to("#menuWrap", 0.5, {
          scale: 0,
          alpha: 0,
          ease: Back.easeIn,
          onComplete: () => {
            this.displayScoreboard = true;
            this.isHidden = true;
          },
        });
        gsap.to("#headerTop", 0.5, {
          opacity: 0,
          ease: Expo.easeIn,
        });
        gsap.to("#logo", 0.5, {
          scale: 0,
          ease: Expo.easeIn,
        });
        gsap.to("#btnback", 0.5, {
          display: "block",
          ease: Expo.easeOut,
        });
        this.isBackActive = !this.isBackActive;
        // console.log(this.userData);
      }
    },
    openSSO() {
      window.open('https://account.kompas.com/login/a29tcGFz/'+btoa(process.env.VUE_APP_PARENT_URL+'?login=true'), '_parent');
    },
  },
  mounted() {
    logEvent(getAnalytics(), 'KATAKITA_LOAD_GAME');
    this.userAgent()
    this.getUsers();
    gsap.to("#headerTop", 0.5, {
      y: -30,
      delay: 0.2,
      //opacity: 1,
      ease: Expo.easeOut,
    });
    gsap.to("#logo", 0.5, {
      scale: 0,
      rotation: 180,
      ease: Expo.easeOut,
    });
    gsap.to("#btnstart", 0, {
      scale: 0,
      ease: Expo.easeOut,
    });
    gsap.to("#btnscore", 0, {
      scale: 0,
      ease: Expo.easeOut,
    });
    gsap.to("#logo", 0.5, {
      scale: 1,
      rotation: 0,
      ease: Back.easeOut,
      delay: 0.6,
      onComplete: () => {
        gsap.to("#logo", 0.5, {
          scale: 0.7,
          y: -140,
          ease: Expo.easeIn,
        });
        gsap.to("#btnstart", 0.5, {
          scale: 1,
          ease: Back.easeOut,
          delay: 0.6,
        });
        gsap.to("#btnscore", 0.5, {
          scale: 1,
          ease: Back.easeOut,
          delay: 0.8,
        });
      },
    });
  },
};
</script>

<style lang="scss">
*,*:after,*:before {
  box-sizing: border-box;
}
:root {
  --cl-main: #ff512f;
  --cl-secondary: #f09819;
  --cl-white: #fff;
  --cl-black: #333333;
  --cl-correct: #7BBC49;
  --cl-wrong: #c8c8c8;
  --cl-almost: #FBAB18;
  --font-parent: "Roboto Slab", serif;
  --font-child: "Mukta", sans-serif;
}
#app {
  font-family: var(--font-parent);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: left;
  color: var(--cl-black);
  background-image: url(@/assets/bg-home.png), radial-gradient(159.72% 71.87% at 50% 50%, #91BDAD 0%, #719386 100%);
  background-repeat: repeat-x;
  background-position: top center;
  // background: radial-gradient(159.72% 71.87% at 50% 50%, #91BDAD 0%, #719386 100%);
  background-size: auto calc(100% - 56px);
  position: relative;
  width: 100%;
  max-width: 500px;
  // height: 100vh;
  // max-height: 100vh;
  // max-height: -webkit-fill-available;
  // height: 800px;
  margin: auto;
  height: -webkit-fill-available;
  height: 100vh;
  overflow: auto;
}
html,
body {
  margin: 0;
  touch-action:manipulation;
  -webkit-tap-highlight-color: rgba(0,0,0,0);
  // min-height: -webkit-fill-available;
  // max-height: -webkit-fill-available;
  height: 100vh;
  // height: -webkit-fill-available;
  overflow: hidden;
}
.button {
  cursor: pointer;
  border: 0;
  border-radius: 3px;
  font-family: var(--font-parent);
  font-weight: 500;
  font-size: 18px;
  line-height: 24px;
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  &.-active {
    color: var(--cl-white);
    background: linear-gradient(
      93.98deg,
      var(--cl-main) -19.89%,
      var(--cl-secondary) 118.82%
    );
  }
  &.-default {
    font-size: 14px;
    padding: 10px 15px;
  }
  &.-disabled {
    pointer-events: none;
    background: #F1F1F1;
    color: #757575;
    border: 1px solid #F1F1F1;
    img {
      filter: grayscale(1);
    }
    span {
      min-width: 40px;
    }
  }
  &Head {
    width: 36px;
    height: 36px;
    padding: 0;
    border: 1px solid #ED543A;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    // border-radius: 4px;
    @media screen and (max-height: 500px) {
      width: 34px;
      height: 34px;
    }
    &.-active {
      &.-audio {
        border: transparent;
        .icon-audio {
          background-image: url("data:image/svg+xml,%3Csvg width='14' height='14' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8.72.55a.5.5 0 0 0-.527.055L3.828 4H1a1.001 1.001 0 0 0-1 1v4a1.001 1.001 0 0 0 1 1h2.828l4.365 3.395A.5.5 0 0 0 9 13V1a.5.5 0 0 0-.28-.45ZM8 11.979 4.307 9.105A.5.5 0 0 0 4 9H1V5h3a.5.5 0 0 0 .307-.105L8 2.022v9.956ZM11.498 5.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 1 1 0Zm2-1v5a.5.5 0 0 1-1 0v-5a.5.5 0 0 1 1 0Z' fill='%23fff'/%3E%3C/svg%3E");
        }
      }
    }
    .buttonIcon {
      margin-right: 0;
      width: 16px;
      height: 16px;
    }
  }
  &Menu {
    width: calc(100% - 60px);
    padding: 20px;
    background: var(--cl-white);
    color: var(--cl-main);
    margin-left: 30px;
    margin-right: 30px;
    margin-bottom: 10px;
  }
  &Txt {
    // min-width: 98px;
    display: inline-flex;
    align-items: center;
    line-height: 1;
    font-size: 15px;
    // text-align: left;
  }
  &Icon {
    display: inline-block;
    margin-right: 7px;
    // vertical-align: sub;
    width: 23px;
    height: 16px;
    background-position: center center;
    background-repeat: no-repeat;
    background-size: 100%;
  }
  &Primary {
    font-family: var(--font-parent);
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
    color: var(--cl-white);
    text-decoration: none;
    background: linear-gradient(
      93.98deg,
      var(--cl-main) -19.89%,
      var(--cl-secondary) 118.82%
    );
    border: 1px solid transparent;
    border-radius: 3px;
    padding: 9px 10px;
    width: 100%;
  }
  &Secondary {
    font-family: var(--font-parent);
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
    color: var(--cl-main);
    background: var(--cl-white);
    border: 1px solid var(--cl-main);
    border-radius: 3px;
    padding: 9px 10px;
    width: 100%;
  }
  &Share {
    margin: 0;
    width: calc(50% - (5px / 2));
  }
  &.-loading {
    background: #EBEBE4;
    pointer-events: none;
    .buttonTxt {
      display: none;
    }
    .buttonIcon {
      margin-right: 0;
      vertical-align: center;
      width: 23px;
      height: 23px;
      background-position: center center;
      background-size: contain;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' style='margin:auto;background:0 0;display:block;shape-rendering:auto' width='23' height='23' viewBox='0 0 100 100' preserveAspectRatio='xMidYMid'%3E%3Ccircle cx='50' cy='50' r='0' fill='none' stroke='%23ff512f' stroke-width='12'%3E%3Canimate attributeName='r' repeatCount='indefinite' dur='1.1764705882352942s' values='0;40' keyTimes='0;1' keySplines='0 0.2 0.8 1' calcMode='spline' begin='0s'/%3E%3Canimate attributeName='opacity' repeatCount='indefinite' dur='1.1764705882352942s' values='1;0' keyTimes='0;1' keySplines='0.2 0 0.8 1' calcMode='spline' begin='0s'/%3E%3C/circle%3E%3Ccircle cx='50' cy='50' r='0' fill='none' stroke='%23f09819' stroke-width='12'%3E%3Canimate attributeName='r' repeatCount='indefinite' dur='1.1764705882352942s' values='0;40' keyTimes='0;1' keySplines='0 0.2 0.8 1' calcMode='spline' begin='-0.5882352941176471s'/%3E%3Canimate attributeName='opacity' repeatCount='indefinite' dur='1.1764705882352942s' values='1;0' keyTimes='0;1' keySplines='0.2 0 0.8 1' calcMode='spline' begin='-0.5882352941176471s'/%3E%3C/circle%3E%3C/svg%3E");
      & > img {
        display: none;
      }
    }
  }
}
.menu {
  &Wrap {
    position: absolute;
    top: 52.5%;
    left: 50%;
    transform: translate(-50%,-50%);
    z-index: 1;
    width: 100%;
  }
}
.bgMain {
    background-image: radial-gradient(159.72% 71.87% at 50% 50%, #91BDAD 0%, #719386 100%);
    &:before,
    &:after {
      pointer-events: none;
      content: '';
      position: absolute;
      z-index: 1;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: url(@/assets/bg-home.png);
      background-repeat: repeat-x;
      background-position: top center;
      background-size: auto 100%;
    }
    &:after {
      transform: rotate(180deg);
    }
}
.icon {
  &-crown {
    background-image: url("data:image/svg+xml,%3Csvg width='11' height='9' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10.728 2.26a.746.746 0 0 0-.783-.108L7.574 3.206 6.194.721a.75.75 0 0 0-1.312 0l-1.38 2.485L1.13 2.152a.75.75 0 0 0-1.035.857l1.193 5.078a.742.742 0 0 0 .632.571c.1.014.203.006.3-.02 2.17-.6 4.462-.6 6.632-.001a.757.757 0 0 0 .808-.278.742.742 0 0 0 .125-.272l1.194-5.078a.745.745 0 0 0-.251-.749ZM9.053 7.914a13.204 13.204 0 0 0-7.035.002L.825 2.837l2.372 1.054a.746.746 0 0 0 .96-.32l1.38-2.486L6.919 3.57a.746.746 0 0 0 .96.321l2.372-1.054-1.197 5.077ZM7.41 6.431a.374.374 0 0 1-.413.334 13.988 13.988 0 0 0-2.921 0 .375.375 0 0 1-.079-.746 14.736 14.736 0 0 1 3.079 0 .375.375 0 0 1 .334.412Z' fill='%23fff'/%3E%3C/svg%3E");
  }
  &-trophy {
    width: 20px;
    height: 17px;
    background-size: auto 100%;
    background-image: url("data:image/svg+xml,%3Csvg width='20' height='16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M18.125 2H16.25v-.625A1.251 1.251 0 0 0 15 .125H5a1.251 1.251 0 0 0-1.25 1.25V2H1.865a1.251 1.251 0 0 0-1.25 1.25V4.5A3.129 3.129 0 0 0 3.74 7.625h.316c.753 2.339 2.824 4.09 5.319 4.342v1.908H7.5a.625.625 0 1 0 0 1.25h5a.625.625 0 1 0 0-1.25h-1.875v-1.906a6.26 6.26 0 0 0 5.34-4.344h.285A3.128 3.128 0 0 0 19.375 4.5V3.25A1.251 1.251 0 0 0 18.125 2ZM3.74 6.375A1.877 1.877 0 0 1 1.865 4.5V3.25H3.75v2.43c0 .232.013.464.039.695H3.74Zm9.782 2.924A4.966 4.966 0 0 1 10 10.75h-.038C7.226 10.73 5 8.455 5 5.68V1.374h10V5.75a4.964 4.964 0 0 1-1.478 3.549ZM18.125 4.5a1.877 1.877 0 0 1-1.875 1.875h-.03c.02-.206.03-.415.03-.625v-2.5h1.875V4.5Z' fill='url(%23a)'/%3E%3Cdefs%3E%3ClinearGradient id='a' x1='-2.984' y1='-4.375' x2='24.637' y2='-1.974' gradientUnits='userSpaceOnUse'%3E%3Cstop stop-color='%23FF512F'/%3E%3Cstop offset='1' stop-color='%23F09819'/%3E%3C/linearGradient%3E%3C/defs%3E%3C/svg%3E");
  }
  &-game {
    width: 16px;
    height: 17px;
    background-size: 100% auto;
    background-image: url("data:image/svg+xml,%3Csvg width='17' height='20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2 19.749a1.5 1.5 0 0 1-1.5-1.5V1.75A1.5 1.5 0 0 1 2.782.47l13.498 8.25a1.5 1.5 0 0 1 0 2.559L2.782 19.529a1.5 1.5 0 0 1-.782.22ZM2 1.75v16.498L15.498 10 2 1.75Z' fill='%23fff'/%3E%3C/svg%3E");
  }
  &-enter {
    width: 24px;
    height: 24px;
    background-size: 100% auto;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M19 6a1 1 0 0 0-1 1v4a1 1 0 0 1-1 1H7.41l1.3-1.29a1 1 0 0 0-1.42-1.42l-3 3a1 1 0 0 0-.21.33 1 1 0 0 0 0 .76 1 1 0 0 0 .21.33l3 3a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42L7.41 14H17a3 3 0 0 0 3-3V7a1 1 0 0 0-1-1Z' fill='%23fff'/%3E%3C/svg%3E");
  }
  &-close {
    display: block;
    width: 16px;
    height: 16px;
    background-repeat: no-repeat;
    background-size: 100% auto;
    background-position: center center;
    background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10.942 10.058a.625.625 0 1 1-.884.884L8 8.884l-2.058 2.058a.625.625 0 0 1-.884-.884L7.116 8 5.058 5.942a.625.625 0 1 1 .884-.884L8 7.116l2.058-2.058a.625.625 0 1 1 .884.884L8.884 8l2.058 2.058ZM15.5 1.75v12.5a1.252 1.252 0 0 1-1.25 1.25H1.75A1.252 1.252 0 0 1 .5 14.25V1.75A1.251 1.251 0 0 1 1.75.5h12.5a1.252 1.252 0 0 1 1.25 1.25Zm-1.25 12.5V1.75H1.75v12.5h12.5Z' fill='%23ED543A'/%3E%3C/svg%3E");
  }
  &-back {
    width: 16px;
    height: 16px;
    background-image: url("data:image/svg+xml,%3Csvg width='16' height='14' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M15.5 7a.625.625 0 0 1-.625.625H2.635l4.557 4.558a.625.625 0 1 1-.884.884L.683 7.442a.625.625 0 0 1 0-.884L6.308.933a.625.625 0 0 1 .884.884L2.634 6.375h12.241A.625.625 0 0 1 15.5 7Z' fill='url(%23a)'/%3E%3Cdefs%3E%3ClinearGradient id='a' x1='-2.377' y1='-3' x2='19.721' y2='-1.157' gradientUnits='userSpaceOnUse'%3E%3Cstop stop-color='%23FF512F'/%3E%3Cstop offset='1' stop-color='%23F09819'/%3E%3C/linearGradient%3E%3C/defs%3E%3C/svg%3E");
  }
  &-home {
    width: 16px;
    height: 16px;
    background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath opacity='.2' d='M9.875 14.25V10.5a.625.625 0 0 0-.625-.625h-2.5a.625.625 0 0 0-.625.625v3.75a.625.625 0 0 1-.625.625H1.75a.625.625 0 0 1-.625-.625V7.023a.648.648 0 0 1 .203-.46l6.25-5.68a.625.625 0 0 1 .844 0l6.25 5.68a.618.618 0 0 1 .203.46v7.227a.625.625 0 0 1-.625.625H10.5a.625.625 0 0 1-.625-.625Z' fill='url(%23a)'/%3E%3Cpath d='M14.25 15.5H10.5a1.25 1.25 0 0 1-1.25-1.25V10.5h-2.5v3.75A1.25 1.25 0 0 1 5.5 15.5H1.75A1.25 1.25 0 0 1 .5 14.25V7.023a1.25 1.25 0 0 1 .406-.921l6.25-5.68a1.25 1.25 0 0 1 1.688 0l6.25 5.68a1.252 1.252 0 0 1 .406.921v7.227a1.25 1.25 0 0 1-1.25 1.25Zm-7.5-6.25h2.5a1.25 1.25 0 0 1 1.25 1.25v3.75h3.75V7.023L8 1.343l-6.25 5.68v7.227H5.5V10.5a1.25 1.25 0 0 1 1.25-1.25Z' fill='url(%23b)'/%3E%3Cdefs%3E%3ClinearGradient id='a' x1='-1.513' y1='-3.528' x2='18.792' y2='-2.157' gradientUnits='userSpaceOnUse'%3E%3Cstop stop-color='%23FF512F'/%3E%3Cstop offset='1' stop-color='%23F09819'/%3E%3C/linearGradient%3E%3ClinearGradient id='b' x1='-2.377' y1='-4.528' x2='19.773' y2='-3.029' gradientUnits='userSpaceOnUse'%3E%3Cstop stop-color='%23FF512F'/%3E%3Cstop offset='1' stop-color='%23F09819'/%3E%3C/linearGradient%3E%3C/defs%3E%3C/svg%3E");
  }
  &-audio {
    background-image: url("data:image/svg+xml,%3Csvg width='14' height='14' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10.499 8.5v-3a.5.5 0 1 1 1 0v3a.5.5 0 0 1-1 0Zm2.5-4.5a.5.5 0 0 0-.5.5v5a.5.5 0 1 0 1 0v-5a.5.5 0 0 0-.5-.5Zm-.629 8.164a.501.501 0 0 1-.74.672L9 9.943V13a.5.5 0 0 1-.807.395L3.828 10H1a1 1 0 0 1-1-1V5a1.001 1.001 0 0 1 1-1h2.597L1.63 1.836a.5.5 0 0 1 .74-.672l10 11ZM8 8.844 4.506 5H1v4h3a.5.5 0 0 1 .307.105L8 11.978V8.843ZM6.316 3.331 8 2.022v3.655a.5.5 0 0 0 1 0V1a.5.5 0 0 0-.807-.395l-2.49 1.938a.5.5 0 0 0 .613.789Z' fill='url(%23a)'/%3E%3Cdefs%3E%3ClinearGradient id='a' x1='-2.589' y1='-3.4' x2='17.331' y2='-1.962' gradientUnits='userSpaceOnUse'%3E%3Cstop stop-color='%23FF512F'/%3E%3Cstop offset='1' stop-color='%23F09819'/%3E%3C/linearGradient%3E%3C/defs%3E%3C/svg%3E");
  }
  &-help {
    background-image: url("data:image/svg+xml,%3Csvg width='14' height='14' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M7 .5A6.5 6.5 0 1 0 13.5 7 6.507 6.507 0 0 0 7 .5Zm0 12A5.5 5.5 0 1 1 12.5 7 5.507 5.507 0 0 1 7 12.5Zm.75-2.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm1.5-4.5A2.254 2.254 0 0 1 7.5 7.944V8a.5.5 0 0 1-1 0v-.5A.5.5 0 0 1 7 7a1.25 1.25 0 1 0-1.25-1.25.5.5 0 0 1-1 0 2.25 2.25 0 0 1 4.5 0Z' fill='url(%23a)'/%3E%3Cdefs%3E%3ClinearGradient id='a' x1='-1.994' y1='-3.4' x2='17.198' y2='-2.066' gradientUnits='userSpaceOnUse'%3E%3Cstop stop-color='%23FF512F'/%3E%3Cstop offset='1' stop-color='%23F09819'/%3E%3C/linearGradient%3E%3C/defs%3E%3C/svg%3E");
  }
  &-share {
    background-image: url("data:image/svg+xml,%3Csvg width='19' height='22' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M14.5 14a3.737 3.737 0 0 0-2.682 1.134l-4.322-2.779c.34-.871.34-1.839 0-2.71l4.322-2.779a3.745 3.745 0 1 0-.813-1.26L6.683 8.383a3.75 3.75 0 1 0 0 5.232l4.322 2.779A3.75 3.75 0 1 0 14.5 14Zm0-12a2.25 2.25 0 1 1 0 4.5 2.25 2.25 0 0 1 0-4.5ZM4 13.25a2.25 2.25 0 1 1 0-4.5 2.25 2.25 0 0 1 0 4.5ZM14.5 20a2.25 2.25 0 1 1 0-4.5 2.25 2.25 0 0 1 0 4.5Z' fill='url(%23a)'/%3E%3Cdefs%3E%3ClinearGradient id='a' x1='-3.207' y1='-5.796' x2='23.406' y2='-4.21' gradientUnits='userSpaceOnUse'%3E%3Cstop stop-color='%23FF512F'/%3E%3Cstop offset='1' stop-color='%23F09819'/%3E%3C/linearGradient%3E%3C/defs%3E%3C/svg%3E");
    background-size: auto 100%;
  }
  &-download {
    background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4.523 7.04a.627.627 0 1 1 .891-.884l2.211 2.211V1.125a.625.625 0 0 1 1.25 0v7.242l2.21-2.21a.627.627 0 0 1 .892.882L8.695 10.32a.64.64 0 0 1-.89 0L4.523 7.04Zm10.602 2.21a.625.625 0 0 0-.625.625v4.375H2V9.875a.625.625 0 0 0-1.25 0v4.375A1.25 1.25 0 0 0 2 15.5h12.5a1.25 1.25 0 0 0 1.25-1.25V9.875a.625.625 0 0 0-.625-.625Z' fill='url(%23a)'/%3E%3Cdefs%3E%3ClinearGradient id='a' x1='-2.127' y1='-4' x2='20.017' y2='-2.461' gradientUnits='userSpaceOnUse'%3E%3Cstop stop-color='%23FF512F'/%3E%3Cstop offset='1' stop-color='%23F09819'/%3E%3C/linearGradient%3E%3C/defs%3E%3C/svg%3E");
  }
  &-reload {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M212.333 224.333H12c-6.627 0-12-5.373-12-12V12C0 5.373 5.373 0 12 0h48c6.627 0 12 5.373 12 12v78.112C117.773 39.279 184.26 7.47 258.175 8.007c136.906.994 246.448 111.623 246.157 248.532C504.041 393.258 393.12 504 256.333 504c-64.089 0-122.496-24.313-166.51-64.215-5.099-4.622-5.334-12.554-.467-17.42l33.967-33.967c4.474-4.474 11.662-4.717 16.401-.525C170.76 415.336 211.58 432 256.333 432c97.268 0 176-78.716 176-176 0-97.267-78.716-176-176-176-58.496 0-110.28 28.476-142.274 72.333h98.274c6.627 0 12 5.373 12 12v48c0 6.627-5.373 12-12 12z' fill='%23fff'/%3E%3C/svg%3E");
    background-size: auto 100%;
  }
}
.center-flex {
  justify-content: center;
  align-items: center;
  display: flex;
}
.align-center {
  display: flex;
  align-items: center;
}
.text-center {
  text-align: center;
}
</style>
