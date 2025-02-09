<template>
  <div class="gameWrap bgMain center-flex" id="gameWrap">
    <canvas class="gameCanvas" id="gameCanvas" width="900" height="1580"></canvas>
    <div class="gameHead center-flex">
      <div class="gameHead__wrap">
        <button class="button buttonHead -help" @click="showHelpBox()">
          <span class="buttonIcon icon-help"></span>
        </button>
        <button class="button buttonHead -audio" :class="{'-active': isLocalBgmPlay}" @click.prevent="isLocalBgmPlay ? pause(backsound, true) : play(backsound, false)">
          <span class="buttonIcon icon-audio"></span>
        </button>
      </div>
      <div class="gameHead__wrap">
        <button class="button buttonClue" :class="{'-disabled': clueLimit<1}" @click.prevent="clueLimit>0 ? dialogContekanBox() : dialogContekan = false">
          <img
            src="@/assets/icon-clue.png"
            class="gameHead__img"
            alt=""
            width="16"
            height="16"
          />
          <span v-if="clueLimit>0">Contekan ({{ clueLimit }}x)</span>
          <!-- <span v-else>Contekan Habis</span> -->
          <span v-else>{{ clueLimitCharge }}</span>
        </button>
      </div>
    </div>

    <div class="gameBoard__wrapper">
      <div class="gameBoard__toast">
        <div id="gameToast" class="gameToast" :class="{'-active': toast.show}">
          <div class="gameToast__wrapper">
            <div class="gameToast__content" v-html="toast.msg"></div>
            <button class="button gameToast__close" @click="toast.show = false"><span class="icon-close"></span></button>
          </div>
        </div>
      </div>
      <div class="gameBoard" v-if="apiQuestion.status == 200">
        <div class="gameBoard__row" v-for="i in 6" :key="i">
          <div class="gameBoard__item" v-for="j in levelChar" :key="j">
            <KeyInput
              :inputName="`inputAnswer_${i}_${j}`"
              :inputValue="ansWord[`${i - 1}`].char[`${j - 1}`]"
            >
            </KeyInput>
          </div>
        </div>
      </div>
      <div class="gameBoard" v-else-if="apiQuestion.status == 404">
        <div class="gameBoard__status">
          <p>Pertanyaan tidak ditemukan, silakan coba lagi.</p>
          <p><a class="button -active -default" href="<%= BASE_URL %>">Kembali ke Beranda</a></p>
        </div>
      </div>
      <div class="gameBoard" v-else>
        <div class="gameBoard__status">
          <p>Silakan tunggu...</p>
        </div>
      </div>
    </div>

    <div class="gameKey" v-if="apiQuestion.status == 200">
      <div class="gameKey__top">
        <div class="timerWrap">
          <img
            class="timerImg"
            src="@/assets/ph_timer.png"
            width="48"
            height="48"
            alt="Timer"
          />
          <span class="timer">{{ ansTimerDisplay }}</span>
          <!-- <span class="timer" v-else>00:00</span> -->
        </div>
        <div class="gameKey__delete">
          <KeyBtn @onKeyPress="onKeyPress" keyChar="delete" :isDelete="true">
          </KeyBtn>
        </div>
      </div>
      <div
        class="gameKey__row"
        v-for="(row, index) in keyBoardChar"
        :id="[`keyBar_${index + 1}`]"
        :key="row"
      >
        <div
          class="gameKey__item"
          v-for="item in splitChar(row.char)"
          :key="item"
        >
          <KeyBtn @onKeyPress="onKeyPress" :keyChar="item"> </KeyBtn>
        </div>
        <div class="gameKey__item" v-if="index == 2">
          <KeyBtn @onKeyPress="onEnterPress" keyChar="enter" :isEnter="true">
          </KeyBtn>
        </div>
        <!-- <div class="gameKey__item" v-if="index == 2">
        </div> -->
      </div>
    </div>
    <div class="gameKey" v-else>
    </div>
  </div>

  <!-- s: modal result -->
  <Teleport to="body">
    <Modal_compo :show="showResult" @close="showResult = false">
      <template #header>
        <div class="modalHead center-flex">
          <h3 class="modalTitle" v-if="userAns">Jawabanmu Benar!</h3>
          <h3 class="modalTitle" v-else>Jawabanmu Salah!</h3>
        </div>
      </template>
      <template #body>
        <div class="modalGame__body">
          <div class="modalGame__result" v-if="userAns">
            Yey, tebakanmu benar!
          </div>
          <div class="modalGame__result" v-else>
            Ups, kamu salah menebak kata. Jawaban yang benar adalah:
          </div>
          <div class="modalGame__word">
            <span
              class="letter"
              v-for="j in this.getQ.decryptedTitle.split('')"
              :key="j"
              >{{ j }}</span
            >
          </div>
          <div class="modalGame__explained" v-html="this.getQ.decryptedDescription">
          </div>
            <!-- <p class="modalGame__verb">nomina</p> -->
            <!-- <p>
              <span class="modalGame__misc">1</span> perkataan yg keluar sewaktu
              tidur;
            </p>
            <p>
              <span class="modalGame__misc">2</span> <b>ki</b> perkataan yg
              bukan-bukan; omong kosong; ocehan;
            </p> -->
          <div class="modalGame__result center-flex">
            <div class="modalGame__box">
              <img
                src="@/assets/result-score.png"
                class="modalGame__img"
                alt=""
                width="68"
                height="55"
              />
              Skor sesi ini
              <div class="modalGame__num" v-if="totalScore">
                {{ totalScore }}
              </div>
              <div class="modalGame__num" v-else>0</div>
            </div>
            <div class="modalGame__box">
              <img
                src="@/assets/result-total.png"
                class="modalGame__img"
                alt=""
                width="62"
                height="52"
              />
              Skor total
              <div class="modalGame__num">{{ userRank.scoreNow }}<span>+{{ totalScore }}</span></div>
            </div>
          </div>
          <div class="modalGame__rank align-center">
            Peringkat kamu pada {{ levelChar }} huruf
            <div class="modalGame__userRank">{{ userRank.rankNow.length>0 ? '#'+ userRank.rankNow : '' }}</div>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="modalGame__footer">
          <button class="button buttonPrimary" @click="$emit('playAgain', isLocalBgmPlay)">
            <!-- <button class="button buttonPrimary" @click="showResult = false, userAns = false"> -->
            <span class="buttonIcon icon-reload"></span>
            Main Lagi
          </button>
          <!-- </button> -->
          <button class="button buttonGame__share" @click="showShareBox()">
            <span class="buttonIcon icon-share"></span>
          </button>
        </div>
      </template>
    </Modal_compo>
  </Teleport>
  <!-- e: modal result -->

  <!-- s: modal help -->
  <Teleport to="body">
    <Modal_compo :show="showHelp" @close="showHelp = false">
      <template #header>
        <div class="modalHead center-flex">
          <h3 class="modalTitle">Cara Bermain</h3>
        </div>
      </template>
      <template #body>
        <div class="modalGame__body">
          <p>
            Tebak kata yang tersembunyi dengan menyatukan keenam huruf yang
            tersedia. Kata-kata ini sesuai dengan KBBI. Tekan ENTER untuk
            mengirimkan jawaban.
          </p>
          <p>
            Setelah jawaban dikirim, warna kotak akan berubah seberapa dekat
            tebakanmu dengan kata rahasia.
          </p>
          <p>
            Ketika jawaban salah, ulangi merangkai huruf hingga menjadi kata
            yang dimaksud hingga <strong>enam kali</strong> kesempatan.
          </p>
          <p>
            Contoh:
          </p>
          <div class="modalGame__word -example">
            <span class="letter -correct">M</span>
            <span class="letter">A</span>
            <span class="letter">R</span>
            <span class="letter">I</span>
            <span class="letter">N</span>
            <span class="letter">A</span>
          </div>
          <p>
            Huruf ‘M’ berada dalam kata dan berada <strong>di posisi yang benar</strong>.
          </p>
          <div class="modalGame__word -example">
            <span class="letter">M</span>
            <span class="letter">A</span>
            <span class="letter -almost">N</span>
            <span class="letter">G</span>
            <span class="letter">G</span>
            <span class="letter">A</span>
          </div>
          <p>
            Huruf ‘N’ berada dalam kata tapi <strong>tidak berada di posisi yang benar</strong>.
          </p>
          <div class="modalGame__word -example">
            <span class="letter">M</span>
            <span class="letter">A</span>
            <span class="letter">K</span>
            <span class="letter -wrong">I</span>
            <span class="letter">A</span>
            <span class="letter">N</span>
          </div>
          <p>
            Huruf ‘I’ <strong>tidak berada dalam kata</strong>.
          </p>
          <!-- Contoh: -->
        </div>
      </template>
      <template #footer>
        <div class="modalGame__footer">
          <button class="button buttonSecondary" @click="showHelp = false">
            <img
              src="@/assets/icon-close.png"
              class="modalIcon"
              alt=""
              width="15"
              height="15"
            />Tutup Bantuan
          </button>
        </div>
      </template>
    </Modal_compo>
  </Teleport>
  <!-- e: modal help -->

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
        <div class="modalGame__footer">
          <button class="button buttonSecondary" @click="$emit('backHome')">
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
  <!-- e: modal error -->

  <!-- s: modal iklan kosong -->
  <Teleport to="body">
    <Modal_compo :show="adEmpty" @close="adEmpty = false">
      <template #header>
        <div class="modalHead center-flex">
          <h3 class="modalTitle">Iklan</h3>
        </div>
      </template>
      <template #body>
        <div class="modalGame__body">
          <p>Iklan tidak tersedia, silakan coba beberapa saat lagi.</p>
        </div>
      </template>
      <template #footer>
        <div class="modalGame__footer">
          <button class="button buttonSecondary" @click="adEmpty = false">
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
  <!-- e: modal iklan kosong -->

  <!-- s: modal loading iklan -->
  <Teleport to="body">
    <Modal_compo :show="adLoading" @close="adLoading = false">
      <template #header>
        <div class="modalHead center-flex">
          <h3 class="modalTitle">Iklan</h3>
        </div>
      </template>
      <template #body>
        <div class="modalGame__body">
          <p class="text-center">Silakan tunggu...</p>
        </div>
      </template>
      <template #footer></template>
    </Modal_compo>
  </Teleport>
  <!-- e: modal loading iklan -->

  <!-- s: modal share -->
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
          <button class="button buttonSecondary buttonShare" @click="shareLink('twitter')">
            <img
              src="@/assets/share-tw.png"
              class="modalShare__icon"
              alt=""
              width="19"
              height="16"
            />Twitter
          </button>
          <button class="button buttonSecondary buttonShare" @click="downloadCanvas()">
            <img
              src="@/assets/share-ig.png"
              class="modalShare__icon"
              alt=""
              width="17"
              height="16"
            />Instagram
          </button>
          <button class="button buttonSecondary buttonShare" @click="shareLink('facebook')">
            <img
              src="@/assets/share-fb.png"
              class="modalShare__icon"
              alt=""
              width="17"
              height="16"
            />Facebook
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
  <!-- e: modal share -->

  <!-- s: modal dialog contekan -->
  <Teleport to="body">
    <Modal_compo :show="dialogContekan" @close="dialogContekan = false">
      <template #header>
        <div class="modalHead align-center">
          <h3 class="modalTitle">Gunakan Petunjuk?</h3>
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
            Anda akan menonton iklan untuk mendapatkan 1 bantuan huruf.
          </p>
        </div>
      </template>
      <template #footer>
        <div class="modalGame__footer">
          <button class="button buttonSecondary" @click="dialogContekanDismiss()">
            Batal 
          </button>
          <button id="yesContekanBtn" class="button buttonPrimary" @click="isContekan()">
            Ya, Lanjutkan 
          </button>
        </div>
      </template>
    </Modal_compo>
  </Teleport>
  <!-- e: modal dialog contekan -->

  <!-- s: modal contekan -->
  <Teleport to="body">
    <Transition name="modal">
      <Clue_compo :show="showContekan" @close="showContekan = false">
        <template #body>
          <div class="clue-timer"><span id="clueTimerDisplay">{{ clueTimerDisplay }}</span></div>
          <div class="clue-ads -full">
            <img src="https://tpc.googlesyndication.com/simgad/241969906600065835" alt="">
          </div>
          <button class="button clue-close" @click="showCloseContekan = true">
            <img
              src="@/assets/icon-close.png"
              class="modalIcon"
              alt=""
              width="15"
              height="15"
            />
          </button>
        </template>
      </Clue_compo>
    </Transition>
  </Teleport>
  <!-- e: modal contekan -->

  <!-- s: modal claim -->
  <Teleport to="body">
    <Transition name="modal">
      <Clue_compo :show="showClaim" @close="showClaim = false">
        <template #body>
          <div class="clue-ads">
            <img src="https://tpc.googlesyndication.com/simgad/241969906600065835" alt="">
          </div>
          <div class="clue-footer">
            <button class="button buttonPrimary clue-claim-button" @click="resumeGame()">
              Klaim Petunjuk
            </button>
            <div class="clue-info">{{ clueLimit }} jatah tersisa</div>
          </div>
        </template>
      </Clue_compo>
    </Transition>
  </Teleport>
  <!-- e: modal claim -->

  <!-- s: modal dialog leave contekan -->
  <Teleport to="body">
    <Modal_compo :show="showCloseContekan" @close="showCloseContekan = false">
      <template #header>
        <div class="modalHead align-center">
          <h3 class="modalTitle">Lompati Iklan?</h3>
          <img
            src="@/assets/icon-forward.png"
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
            Dengan melewatkan iklan, Anda tidak dapat mengklaim imbalan petunjuk kata.
          </p>
        </div>
      </template>
      <template #footer>
        <div class="modalGame__footer">
          <button class="button buttonSecondary" @click="resumeGame()">
            Ya, Lewati 
          </button>
          <button class="button buttonPrimary" @click="showCloseContekan = false">
            Batal 
          </button>
        </div>
      </template>
    </Modal_compo>
  </Teleport>
  <!-- e: modal dialog leave contekan -->

</template>

<script>
import KJUR  from 'jsrsasign';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { gsap, Expo, Sine } from "gsap";
import KeyInput from "./InputBoard.vue";
import KeyBtn from "./ButtonKeyboard.vue";
import Modal_compo from "@/components/Modal-compo.vue";
import Clue_compo from "@/components/Clue-compo.vue";
import { getAnalytics, logEvent } from "firebase/analytics";

export default {
  name: "Game_compo",
  components: {
    KeyInput,
    KeyBtn,
    Modal_compo,
    Clue_compo,
  },
  props: ["levelChar","users"],
  emits: ["backHome","playAgain"],
  data() {
    return {
      key: 'G4mKatKit',
      apiAnswer: {
        url: 'api/kata_kita/answer',
        post: {},
        token: {},
        status: ''
      },
      apiMyRank: {
        url: 'api/kata_kita/score',
        query: {
          myrank: {}
        },
        status: ''
      },
      apiQuestion: {
        url: 'api/kata_kita/question',
        query: {},
        status: ''
      },
      apiKBBI: {
        url: 'api/kata_kita/question',
        query: {},
        status: ''
      },
      CryptoJSAesJson: {
        stringify: function (cipherParams) {
          var j = {ct: cipherParams.ciphertext.toString(CryptoJS.enc.Base64)};
          if (cipherParams.iv) j.iv = cipherParams.iv.toString();
          if (cipherParams.salt) j.s = cipherParams.salt.toString();
          return JSON.stringify(j).replace(/\s/g, '');
        },
        parse: function (jsonStr) {
          var j = JSON.parse(jsonStr);
          var cipherParams = CryptoJS.lib.CipherParams.create({ciphertext: CryptoJS.enc.Base64.parse(j.ct)});
          if (j.iv) cipherParams.iv = CryptoJS.enc.Hex.parse(j.iv);
          if (j.s) cipherParams.salt = CryptoJS.enc.Hex.parse(j.s);
          return cipherParams;
        }
      },
      fx: {
        tap: new Audio(require("@/assets/fx/tap.mp3")),
        juggle: new Audio(require("@/assets/fx/jadi.mp3")),
        wrong: new Audio(require("@/assets/fx/wrong.mp3")),
      },
      toast: {
        show: false,
        msg: ''
      },
      isLocalBgmPlay: this.users.isBgmPlay,
      backsound: this.users.bgm,
      isBgmUser: false,
      showError: false,
      showErrorMsg: '',
      showHelp: false,
      showShare: false,
      dialogContekan: false,
      showContekan: false,
      showResult: false,
      showCloseContekan: false,
      showClaim: false,
      userAns: false,
      userRank: {
        template: {
          score: process.env.VUE_APP_BASE_URL+'bg-skor2.png'
        },
        rankNow: 0,
        rankLast: 0,
        scoreNow: 0,
        scoreLast: 0,
        status: ''
      },
      // key static
      ansWord: [
        { char: [] },
        { char: [] },
        { char: [] },
        { char: [] },
        { char: [] },
        { char: [] },
      ],
      ansEmoji: [
        { emoji: [] },
        { emoji: [] },
        { emoji: [] },
        { emoji: [] },
        { emoji: [] },
        { emoji: [] },
      ],
      shareTxt: '',
      ansChance: 0,
      ansChanceMax: 5,
      ansScore: 0,
      totalScore: 0,
      ansTimerPause: false,
      ansTimer: 0,
      ansTimerDisplay: "00:00",
      ansTimerVar: Number,
      clueTimer: 0,
      clueTimerDisplay: "",
      clueTimerVar: Number,
      clueLimit: 3,
      clueIsCount: 0,
      clueIntv: Number,
      clueLimitCharge: "Contekan Habis",
      clueInsert: '',
      isWatchedAd: false,
      isCancelAd: false,
      isReadyAd: false,
      isEmpty: false,
      ansSecVar: 300,
      ansSecMax: 600,
      ansScoreTemp: [],
      keyPressFirst: 0,
      keyBoardChar: [
        { char: "qwertyuiop" },
        { char: "asdfghjkl" },
        { char: "zxcvbnm" },
      ],
      getQ: { decryptedId: "", decryptedTitle: "", decryptedDescription: "" },
      adLoading: false,
      adEmpty: false,
      adCheck: Number
    }
  },
  beforeCreate() {
    window.googletag.cmd.push(function() {
      window.googletag.destroySlots();
    });
  },
  created() {
    window.addEventListener("keydown", this.doCommand);
  },
  unmounted() {
    window.removeEventListener("keydown", this.doCommand);
  },
  mounted() {
    let _this = this
    if(this.isLocalBgmPlay) {
      _this.play(this.backsound, false)
    }
    _this.bgmCheck(this.backsound)
    _this.cekClueLimit()
    _this.countdownClue()
    if(this.levelChar>0) {
      logEvent(getAnalytics(), 'KATAKITA_PLAY_'+this.levelChar+'HURUF');
      _this.getQuestion()
      _this.getRankBefore()
    }
  },
  methods: {
    showShareBox() {
      this.showShare = true
      logEvent(getAnalytics(), 'KATAKITA_SHARE');
    },
    showHelpBox() {
      this.showHelp = true
      logEvent(getAnalytics(), 'KATAKITA_BANTUAN');
    },
    createSlotAd() {
      console.log('createSlotAd')
      document.getElementById('yesContekanBtn').classList.add('-disabled')
      this.dialogContekan = false
      this.adLoading = true
      let _this = this
      let rewardedSlot
      this.isWatchedAd = false
      this.isCancelAd = false
      this.isReadyAd = false
      this.isEmpty = false
      let googletag = window.googletag || {cmd: []}
      googletag.cmd.push(function() {
        rewardedSlot = googletag.defineOutOfPageSlot(_this.users.adUnit, googletag.enums.OutOfPageFormat.REWARDED);
        // console.log(rewardedSlot)
        if (rewardedSlot) {
          rewardedSlot.addService(googletag.pubads());
          
          googletag.pubads().addEventListener('slotRenderEnded', function(event) {
            _this.isEmpty = event.isEmpty;
            if (_this.isEmpty) {
              console.log('kosyong')
              _this.adLoading = false
              _this.adEmpty = true
            }
          });

          googletag.pubads().addEventListener('rewardedSlotReady', function(event) {
            console.log('rewardedSlotReady')
            _this.adLoading = false
            _this.isReadyAd = true
            _this.toggleTimer('pause')
            event.makeRewardedVisible();
          });

          googletag.pubads().addEventListener('rewardedSlotClosed', function() {
            googletag.destroySlots([rewardedSlot]);
            console.log('gajadi')
            _this.isCancelAd = true
          });

          googletag.pubads().addEventListener('rewardedSlotGranted', function() {
            googletag.destroySlots([rewardedSlot]);
            _this.isWatchedAd = true
          });

          googletag.enableServices();
          googletag.display(rewardedSlot);
        } else {
          console.log('rewarded not defined')
          clearInterval(_this.adCheck)
        }
      });
      this.adCheck = setInterval(function () {
        if(_this.isEmpty) {
          _this.resumeGame()
          clearInterval(_this.adCheck)
        }
        if(_this.isWatchedAd) {
          logEvent(getAnalytics(), 'KATAKITA_REWARDED_ADS_SUCCESS');
          console.log('KATAKITA_REWARDED_ADS_SUCCESS')
          _this.resumeGame()
          clearInterval(_this.adCheck)
        }
        if(_this.isReadyAd) {
          logEvent(getAnalytics(), 'KATAKITA_REWARDED_ADS_SHOW');
          console.log('KATAKITA_REWARDED_ADS_SHOW')
          _this.isReadyAd = false
        }
        if(_this.isCancelAd) {
          logEvent(getAnalytics(), 'KATAKITA_REWARDED_ADS_FAILED');
          console.log('KATAKITA_REWARDED_ADS_FAILED')
          _this.adLoading = false
          _this.toggleTimer('play')
          clearInterval(_this.adCheck)
        }
      }, 900)
    },

    getRankBefore() {
      // let _this = this;
        axios.get(process.env.VUE_APP_API_URL + this.apiMyRank.url + '?level=' + this.levelChar + '&kgid=' + this.users.kmpsid).then((response) => {
          this.apiMyRank.status = response.data.status
          if(response.data.myrank) {
            this.userRank.scoreLast = response.data.myrank.score
            this.userRank.rankLast = response.data.myrank.position
          } else {
            this.showHelp = true
          }
        }).catch((error) => {
          this.userRank.status = error.response.status
          this.apiMyRank.status = error.response.status
        });
    },
    getRankAfter() {
      let ermsg = 'Terdapat kesalahan sistem dalam memproses jawaban Anda, silakan refresh halaman ini.'
      let _this = this;
        axios.get(process.env.VUE_APP_API_URL + this.apiMyRank.url + '?level=' + this.levelChar + '&kgid=' + this.users.kmpsid).then((response) => {
          this.apiMyRank.status = response.data.status
          if(response.data.myrank) {
            this.userRank.scoreNow = response.data.myrank.score
            this.userRank.rankNow = response.data.myrank.position
            _this.initCanvas()
          } else {
            _this.modalError(ermsg);
          }
        }).catch((error) => {
          _this.modalError(ermsg);
          this.userRank.status = error.response.status
          this.apiMyRank.status = error.response.status
        });
    },
    getQuestion() {
      let ermsg = 'Terdapat kesalahan sistem dalam memuat pertanyaan, silakan refresh halaman ini.'
      let _this = this;
        axios.get(process.env.VUE_APP_API_URL + this.apiQuestion.url + '?level=' + this.levelChar).then((response) => {
          this.apiQuestion.status = response.data.status
          if(response.data) {
            this.apiQuestion.query = response.data
            this.apiQuestion.status = response.status

            this.getQ.decryptedId = this.apiQuestion.query.data.id
            this.getQ.decryptedTitle = JSON.parse(CryptoJS.AES.decrypt(this.apiQuestion.query.data.title, this.key, {format: this.CryptoJSAesJson}).toString(CryptoJS.enc.Utf8)).toLowerCase()
            this.getQ.decryptedDescription = JSON.parse(CryptoJS.AES.decrypt(this.apiQuestion.query.data.description, this.key, {format: this.CryptoJSAesJson}).toString(CryptoJS.enc.Utf8)).replace(/&nbsp;/g, " ")
          } else {
            _this.modalError(ermsg);
          }
        }).catch((error) => {
          _this.modalError(ermsg);
          this.apiQuestion.status = error.response.status
        });
        //console.log(this.apiQuestion);
    },
    getKBBI(answer) {
      let _this = this;
        axios.get(process.env.VUE_APP_API_URL + this.apiKBBI.url + '?title=' + answer.join('')).then((response) => {
          this.apiKBBI.status = response.data.status
          _this.animateJuggle()
          _this.checkTile(answer);
        }).catch((error) => {
          this.apiKBBI.status = error.response.status
          _this.animateShake()
          _this.toastShow('Kata tidak ada di dalam kamus!', true);
          _this.toggleDisabled(document.querySelector(".keyBtn[keychar=enter]"), 'remove')
        });
        // console.log(this.apiKBBI.status);
    },

    modalError(msg) {
      this.showError = true
      this.showErrorMsg = msg
    },

    // toast 
    toastShow(msg, exp) {
      let _this = this;
      this.toast.show = true
      this.toast.msg = msg
      _this.animateZoom(document.getElementById("gameToast"))
      if(exp) {
        setTimeout(() => {
          this.toast.show = false
        }, 3000);
      }
    },

    generateJWT() {
      let sHeader = JSON.stringify({alg: 'HS256', typ: 'JWT'});
      let sPayload = JSON.stringify({
          "id_question": this.getQ.decryptedId,
          "score": this.totalScore,
          "playtime": this.ansTimer,
          "kgid": this.users.kmpsid
        });
      let sJWT = KJUR.jws.JWS.sign("HS256", sHeader, sPayload, "NdRgUkXn2r5u8x/A?D(G+KbPeShVmYq3s6v9y$B&E)H@McQfTjWnZr4u7w!z%C*F");
      return sJWT
    },

    // submit answer
    async submitAnswer() {
      let _this = this
      const token = JSON.stringify({
        "token": _this.generateJWT()
      })
      // console.log(token)
      const request = new Request(process.env.VUE_APP_API_URL + this.apiAnswer.url,
        {
          method: "POST",
          body: token
        }
      );
      const res = await fetch(request);
      const data = await res.json();
      this.apiAnswer.status = data;
      // console.log(this.apiAnswer.status)
      if(data) {
        _this.getRankAfter()
        // _this.initCanvas()
      }
    },

    //play music
    bgmCheck(audio){
      let _this = this
      document.addEventListener("visibilitychange", function() {
        if (document.visibilityState === "visible") {
          if(!_this.isBgmUser) {
            _this.play(audio, _this.isBgmUser)
          }
          // console.log("active")
        } else {
          _this.pause(audio, _this.isBgmUser)
          // console.log("inactive")
        }
      })
    },
    playFx(audio) {
      audio.currentTime = 0
      audio.play();
    },
    play(audio, user) {
      this.isLocalBgmPlay = true;
      this.isBgmUser = user;
      audio.play();
      audio.loop = true;
    },
    pause(audio, user) {
      this.isLocalBgmPlay = false;
      this.isBgmUser = user;
      audio.pause();
    },
    // fungsi general, untuk pecah string jadi array per-karakter
    splitChar(char) {
      return char.split("");
    },

    // timer for display, format 00:00
    str_pad(string, pad, length) {
      return (new Array(length + 1).join(pad) + string).slice(-length);
    },

    resumeGame() {
      let _this = this
      console.log('resumeGame')
      _this.toggleTimer('play')
      // _this.stopTimer(this.clueTimerVar)
      this.showClaim = false;
      this.showContekan = false;
      this.dialogContekan = false
      this.showCloseContekan = false
      if(this.isWatchedAd || this.isEmpty) {
        _this.insertClue()
      }
    },
    cekClueLimit() {
      let _this = this
      let cDate = new Date()
      let localClueLimit = _this.getCookie('clue_limit')
      let localClueIsCount = _this.getCookie('clue_is_count')
      let localClueCount = _this.getCookie('clue_count')

      // cooki limit exist
      if(localClueLimit.length>0) {
        // set max contekan
        if(localClueLimit>3) {
          this.clueLimit = 3
          _this.setCookie('clue_limit', 3, 365);
        } else {
          this.clueLimit = localClueLimit
        }
        // console.log('sudh ada'+localClueLimit)
      } else {
        _this.setCookie('clue_limit', this.clueLimit, 365);
        localClueLimit = this.clueLimit
        // console.log('init awal '+localClueLimit)
      }

      // status, ada countdown aktif?
      if(localClueIsCount.length>0) {
        this.clueIsCount = 1
      } else {
        _this.setCookie('clue_is_count', this.clueIsCount, 365);
        localClueIsCount = this.clueIsCount
        // console.log('init status countdown '+localClueIsCount)
      }

      // init
      if(!localClueCount && localClueLimit<3) {
        if(localClueIsCount<1) {
          _this.setCookie('clue_count', parseInt(cDate.getTime() + (0.0208333*24*60*60*1000)), 0.0208333)
          localClueCount = 1

          _this.setCookie('clue_is_count', 1, 365);
          localClueIsCount = 1
          this.clueIsCount = 1
        } else {
          this.clueLimit++
          _this.setCookie('clue_limit', this.clueLimit, 365);
          localClueLimit = this.clueLimit

          _this.setCookie('clue_is_count', 0, 365);
          localClueIsCount = 0
          this.clueIsCount = 0
        }
      }

      // console.log("lagi itung "+localClueIsCount)

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
    setCookie(cname, cvalue, exdays) {
      let d = new Date();
      d.setTime(d.getTime() + (exdays*24*60*60*1000));
      let expires = "expires=" + d.toGMTString();
      // document.cookie = cname + "=" + cvalue + ";" + expires + "; path=/;";
      document.cookie = cname + "=" + cvalue + ";" + expires + "; path=/; "+ process.env.VUE_APP_COOKIE; // live
      //console.log(d)
    },
    countdownClue() {
      let _this = this
      let localClueCount = _this.getCookie('clue_count')
      let cMin, cSec;
      // console.log(localClueCount)
      if(localClueCount) {
        this.clueIntv = setInterval(function () {
          let cDate = new Date();
          let cTimer = localClueCount - cDate.getTime()
          cMin = Math.floor(cTimer / 60000)
          cSec = ((cTimer % 60000) / 1000).toFixed(0)
  
          _this.clueLimitCharge = (cSec == 60 ? (cMin+1) + ":00" : cMin + ":" + (cSec < 10 ? "0" : "") + cSec)
          // console.log(cDate.getTime())
          // console.log(_this.clueLimitCharge)

          if (cTimer < 500) {
            _this.clueLimitCharge = "Contekan Bertambah"
            clearInterval(_this.clueIntv)
          }
        }, 1000);
      }
    },
    insertClue() {
      let _this = this
      let cDate = new Date()
      let idx
      this.clueLimit--
      if(this.clueInsert.length>0) {
        idx = this.clueInsert.substr(0,1) +''+ this.clueInsert.substr(1,1).toUpperCase()
      } else {
        idx = 1 +''+ this.getQ.decryptedTitle.substr(0,1).toUpperCase()
      }
      if(this.clueIsCount>0) {
        _this.setCookie('clue_limit', this.clueLimit, 365);
      } else {
        _this.setCookie('clue_limit', this.clueLimit, 365);
        _this.setCookie('clue_count', parseInt(cDate.getTime() + (0.0208333*24*60*60*1000)), 0.0208333);
        _this.setCookie('clue_is_count', 1, 365);
        this.clueIsCount = 1
      }
      _this.toastShow('Huruf <strong>ke-'+ idx.substr(0,1) + '</strong> adalah: <strong>' + idx.substr(1,1) +'</strong>', false);
    },
    dialogContekanBox() {
      logEvent(getAnalytics(), 'KATAKITA_REWARDED_ADS');
      this.dialogContekan = true
    },
    dialogContekanDismiss() {
      logEvent(getAnalytics(), 'KATAKITA_REWARDED_ADS_BATAL');
      this.dialogContekan = false
    },
    isContekan() {
      logEvent(getAnalytics(), 'KATAKITA_REWARDED_ADS_CLICKED');
      let _this = this
      _this.toggleTimer('pause')
      //console.log('isContekan')
      // _this.runClueTimer(process.env.VUE_APP_ADS_COUNT)
      // this.dialogContekan = false
      // this.showContekan = true

      _this.createSlotAd()
    },

    toggleTimer(status) {
      let _this = this;
      if(status=='play') {
        if(this.ansTimer>0) {
          this.ansTimerPause = false
          _this.runTimer(this.ansTimer)
        }
      } else if(status=='pause') {
        this.ansTimerPause = true
        _this.stopTimer(this.ansTimerVar)
      } else {
        if(this.ansTimerPause) {
          this.ansTimerPause = false
          _this.runTimer(this.ansTimer)
        } else {
          this.ansTimerPause = true
          _this.stopTimer(this.ansTimerVar)
        }
      }
    },

    // stop timer
    stopTimer(el) {
      clearInterval(el);
    },

    // timer func, in second
    runTimer(time) {
      let _this = this;
      let localTimer = time;

      this.ansTimerVar = setInterval(function () {
        localTimer++;
        let minutes = Math.floor(localTimer / 60);
        let seconds = localTimer - minutes * 60;
        _this.ansTimerDisplay = _this.str_pad(minutes, "0", 2) + ":" + _this.str_pad(seconds, "0", 2);
        _this.ansTimer = localTimer;
        if(minutes>58) {
          window.location.href = process.env.VUE_APP_BASE_URL
        }
      }, 1000);
    },

    // fungsi ketika user pencet huruf pada layar
    onKeyPress(e, char) {
      let _this = this;

      // effect
      _this.animateZoom(e)
      _this.playFx(this.fx.tap)

      // timer running when user start typing
      if (this.keyPressFirst == 0) {
        _this.runTimer(0);
        this.keyPressFirst = 1;
      }

      // mari menjawab
      if (this.ansChance <= this.ansChanceMax) {
        if (char !== "delete" && char !== "enter") {
          if (this.ansWord[this.ansChance].char.length < this.levelChar) {
            this.ansWord[this.ansChance].char.push(char);
          }
        } else if (char == "delete") {
          this.ansWord[this.ansChance].char.pop();
        }
      }
    },

    // fungsi press keyboard di laptop, nanti aja ya
    doCommand(e) {
      if(!this.showResult) {
        let _this = this
        let cmd = String.fromCharCode(e.keyCode).toLowerCase();
        // console.log(cmd)
        // console.log(e.keyCode)
        if(e.keyCode == 8) {
          _this.onKeyPress(document.querySelector(".keyBtn[keychar=delete]"), 'delete')
          // document.querySelector(".keyBtn[keychar=delete]").focus();
        } else if(e.keyCode == 13) {
          e.preventDefault();
          if (!document.querySelector(".keyBtn[keychar=enter]").hasAttribute('disabled')) {
            _this.onEnterPress(document.querySelector(".keyBtn[keychar=enter]"))
          }
          //document.querySelector(".keyBtn[keychar=enter]").focus(); // bugs twice call function
        } else {
          for(let u=0;u<this.keyBoardChar.length;u++) {
            this.keyBoardChar[u].char.split('').map(function(char){
              if(cmd == char) {
                _this.onKeyPress(document.querySelector(".keyBtn[keychar="+cmd+"]"), cmd)
                // document.querySelector(".keyBtn[keychar="+cmd+"]").focus();
              }
            });
          }
        }
      }
    },

    // button Enter func
    onEnterPress(e) {
      let _this = this;

      _this.toggleDisabled(e, 'add')
      this.toast.show = false

      // effect
      _this.animateZoom(e)
      // console.log("enter nih");

      if (this.ansChance <= this.ansChanceMax) {

        if (this.ansWord[this.ansChance].char.length == this.levelChar) {
          // _this.checkTile(this.ansWord[this.ansChance].char);
          _this.getKBBI(this.ansWord[this.ansChance].char);
        } else {
          _this.animateShake()
          _this.toastShow('Huruf kurang lengkap!', true);
          _this.toggleDisabled(e, 'remove')
          // console.log("Ada yang kosong kotaknya");
        }
      } else {
        _this.finalScore();
      }
      // e.classList.remove('-disabled')
    },

    toggleDisabled(e, state) {
      if(state=='add') {
        e.classList.add('-disabled')
        e.disabled = true;
      } else {
        e.classList.remove('-disabled');
        e.removeAttribute('disabled');
      }
    },

    animateZoom(e) {
      gsap.to(e.parentElement, 0.1, {
        scale: 1.25,
        ease: Expo.easeOut,
      });
      gsap.to(e.parentElement, 0.1, {
        scale: 1,
        ease: Expo.easeOut,
        delay: 0.1
      });
    },

    animateShake() {
      let _this = this

      _this.playFx(this.fx.wrong)

      gsap.fromTo(document.getElementById(
          "inputAnswer_" + (this.ansChance + 1) + "_1"
        ).parentElement.parentElement, 0.01, {x:-5}, {x:5, clearProps:"x", repeat:20})
    },

    animateJuggle() {
      let _this = this
      let andelay = 0;

      _this.playFx(this.fx.juggle)

      //Animate fx
      for (let i = 0; i < this.levelChar; i++) {
        gsap.to(document.getElementById(
          "inputAnswer_" + (this.ansChance + 1) + "_" + (i + 1)
        ).parentElement, 0.2, {
            scale: 1.25,
            ease: Sine.easeOut,
            delay: andelay
        });
        gsap.to(document.getElementById(
          "inputAnswer_" + (this.ansChance + 1) + "_" + (i + 1)
        ).parentElement, 0.2, {
            scale: 1,
            ease: Sine.easeOut,
            delay: andelay + 0.09
        });
        andelay += 0.05;
      }
    },

    // display popup result, reset variables
    onGameOver() {
      logEvent(getAnalytics(), 'KATAKITA_GAME_OVER');
      this.generateText()

      // reset score
      this.ansScore = 0;
      this.ansChance = 0;
      this.ansTimer = 0;
      this.showResult = true;
    },

    // final scoring
    finalScore() {
      let _this = this;
      let valid = false;
      console.log("Level User: " + this.levelChar);
      console.log("Total Kesempatan Jawab: " + this.ansChance);
      console.log("Total Huruf Tertebak: " + this.ansScore);
      console.log("Total Waktu: " + this.ansTimer);

      _this.stopTimer(this.ansTimerVar);

      // under 10 seconds, penalti 10 detik hahaha, masak sih bisa jawab under 10 detik, yg bener aja gan
      // if (this.ansTimer < 10) {
      //   this.ansTimer = 10;
      // }

      // max timer (10 minutes)
      if (this.ansTimer > this.ansSecMax) {
        this.ansTimer = this.ansSecMax;
      }

      // Rumus : (((1 - (Response Time / Variabel Detik) / 2) * 940) / Kesempatan Jawab ) + Huruf Tertebak
      if(this.ansScore > 0) {
        this.totalScore = (((1 - (this.ansTimer / this.ansSecVar) / 2) * 940) / this.ansChance) + (this.ansScore * 10);
      } else {
        this.totalScore = 0
      }
      this.totalScore = Math.round(this.totalScore);
      if (this.totalScore>-1) {

        this.apiAnswer.post = {
          "id_question": this.getQ.decryptedId,
          "score": this.totalScore,
          "playtime": this.ansTimer,
          "kgid": this.users.kmpsid
        } 

        // return _this.submitAnswer()
        valid = _this.submitAnswer()
      }

      if (valid) {
        return _this.onGameOver();
      }
    },

    // scoring per letter
    tempScore(temp) {
      if (this.ansScoreTemp.indexOf(temp) === -1) {
        this.ansScoreTemp.push(temp);
        this.ansScoreTemp.sort();
      }
    },

    // coloring response
    colorIt(idEl, classEl, colorEl, bgEl) {
      document.querySelector(classEl).style.backgroundColor = bgEl;
      document.querySelector(classEl).style.color = colorEl;
      document.getElementById(idEl).style.backgroundColor = bgEl;
      document.getElementById(idEl).style.color = colorEl;
    },

    // checking one by one tile answer
    checkTile(answer) {
      let _this = this;
      // console.log("answer " + answer);
      let localScore = 0;
      let localClue = 0;

      let soal = this.getQ.decryptedTitle.split("");
      //console.log("soal " + soal);

      answer.map(function (char, index) {
        setTimeout(() => {
        if (char == soal[index]) {
          // green
          _this.colorIt("inputAnswer_" + (_this.ansChance + 1) + "_" + (index + 1), ".keyBtn[keychar="+char+"]", "#fff", "var(--cl-correct)")
          _this.tempScore(index + char);
          _this.ansEmoji[_this.ansChance].emoji.push('c')
          localScore++;
        } else {
          // grey
          _this.colorIt("inputAnswer_" + (_this.ansChance + 1) + "_" + (index + 1), ".keyBtn[keychar="+char+"]", "#000", "var(--cl-wrong)")
          _this.ansEmoji[_this.ansChance].emoji.push('w')
          if(localClue==0) {
            _this.clueInsert = (index+1)+soal[index]
            localClue++
          }
          for (let j = 0; j < _this.levelChar; j++) {
            if (soal[j] == char) {
              // yellow
              _this.colorIt("inputAnswer_" + (_this.ansChance + 1) + "_" + (index + 1), ".keyBtn[keychar="+char+"]", "#fff", "var(--cl-almost)")
              _this.ansEmoji[_this.ansChance].emoji.pop()
              _this.ansEmoji[_this.ansChance].emoji.push('a')
            }
          }
        }
        }, 100)
      });

      setTimeout(() => {
        // overall chance
        this.ansChance++;
        console.log(this.ansChance);

        // scoring letter
        this.ansScore = this.ansScoreTemp.length;

        // all true in a row
        if (localScore == this.levelChar) {
          this.userAns = true;
          _this.finalScore();
        }

        // max chance 
        if (this.ansChance > this.ansChanceMax) {
          _this.finalScore();
        }

        _this.toggleDisabled(document.querySelector(".keyBtn[keychar=enter]"), 'remove')

      }, 150*this.levelChar)

    },

    generateText() {
      this.shareTxt = 'Kata Kita '+(this.userAns?this.ansChance:'X')+'/6\n\n'
      for(let i=0; i<this.ansChance; i++) {
        if(this.ansEmoji[i].emoji.length>0) {
          for(let j=0; j<this.ansEmoji[i].emoji.length; j++) {
            if(this.ansEmoji[i].emoji[j]=='c') {
              this.shareTxt += "🟩";
            } else if(this.ansEmoji[i].emoji[j]=='a') {
              this.shareTxt += "🟨";
            } else {
              this.shareTxt += "⬜️";
            }            
          }
          this.shareTxt += '\n'
        }
        // this.shareTxt += i+'\n'
      }
      this.shareTxt += '\n'+ process.env.VUE_APP_SHORT_TW
      //console.log(this.shareTxt)
    },

    shareLink(site) {
      let encodeURI = this.shareTxt.replace(/\n/g, "%0A");
      if(site=='twitter') {
        let stw = `https://twitter.com/intent/tweet?text=${encodeURI}`;
        window.open(stw, "_blank");
      }
      if(site=='facebook') {
        let sfb = `https://www.facebook.com/sharer/sharer.php?u=`+process.env.VUE_APP_SHORT_FB;
        window.open(sfb, "_blank");
      }
    },

    initCanvas() {
      let _ = this
      let img
      let cn = document.getElementById('gameCanvas');
      let cx = cn.getContext('2d');

      img = new Image();
      img.onload = function () {
        cx.drawImage(img, 0, 0);
        let w = cn.width
        let h = cn.height

        // initial
        cx.font = "500 55px Roboto Slab";
        cx.fillStyle = "#fff";
        cx.textAlign = "center";
        cx.fillText(_.users.initial.toUpperCase(), w/3 - 170, h/4 + 110);

        // name
        cx.font = "700 45px Mukta";
        cx.fillStyle = "#fff";
        cx.textAlign = "left";
        cx.fillText((_.users.data.first_name+(_.users.data.last_name.length>0?' '+_.users.data.last_name:'')), w/2 - 205, h/3 - 60);

        //score text
        cx.font = "700 39px Mukta";
        cx.fillStyle = "#333333";
        cx.textAlign = "left";
        cx.fillText(_.levelChar+" huruf", w/2 + 8, h/2 + 315);

        //score
        cx.font = "500 55px Roboto Slab";
        cx.fillStyle = "#ff512f";
        cx.textAlign = "right";
        cx.fillText((_.userRank.rankLast.length>0?"#"+_.userRank.rankLast:'-'), w - 80, h/2 + 317);

        cx.font = "500 70px Roboto Slab";
        cx.fillStyle = "#333333";
        cx.textAlign = "center";
        cx.fillText(_.totalScore, w/2 - 215, h/2 + 140);

        cx.font = "500 70px Roboto Slab";
        cx.fillStyle = "#333333";
        cx.textAlign = "center";
        cx.fillText(_.userRank.scoreNow, w/2 + 215, h/2 + 128);

        cx.font = "500 35px Roboto Slab";
        cx.fillStyle = "#ff512f";
        cx.textAlign = "center";
        cx.fillText("+"+_.totalScore, w/2 + 215, h/2 + 169);

      };
      img.src = this.userRank.template.score;
      img.setAttribute('crossorigin', 'anonymous'); // works for me
    },
    downloadCanvas() {
      let filesArray
      let url = document.getElementById('gameCanvas').toDataURL();
      // if(save==true) {
        fetch(url)
          .then(function (response) {
              return response.blob()
          })
          .then(function (blob) {
              let file = new File([blob], "kata-kita-score.jpg", {
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
      // } else {
      //   let tab = window.open('about:blank', '_blank');
      //   tab.document.write('<img src="'+url+'" style="height: 100%"/>');
      // }
    },

  },
};
</script>

<style scoped lang="scss">
.input {
  &Wrap {
    display: flex;
    justify-content: center;
  }
}

.game {
  &Canvas {
    position: absolute;
    // z-index: 9;
    visibility: hidden;
    opacity: 0;
    width: 100%;
    height: 100%;
  }
  &Board {
    position: relative;
    padding: 0;
    min-height: 235px;
    @media screen and (min-height: 700px) {
      min-height: 310px;
    }
    &__wrapper {
      position: relative;
      // min-height: 350px;
    }
    &__toast {
      position: relative;
      min-height: 38px;
      padding: 2px 10px;
      will-change: transform;
      @media screen and (min-height: 700px) {
        min-height: 50px;
      }
    }
    &__row {
      position: relative;
      display: flex;
      justify-content: center;
      will-change: transform;
    }
    &__item {
      position: relative;
      will-change: transform;
    }
    &__status {
      position: relative;
      padding: 20px 30px;
      text-align: center;
      // display: flex;
      // justify-content: center;
      margin: 0 auto;
      color: #fff;
    }
  }
  &Toast {
    position: relative;
    border-radius: 5px;
    overflow: hidden;
    height: 34px;
    background: #fff;
    visibility: hidden;
    opacity: 0;
    will-change: transform;
    transition: all .2s ease;
    @media screen and (min-height: 700px) {
      height: 40px;
    }
    &.-active {
      opacity: 1;
      visibility: visible;
    }
    &__wrapper {
      padding: 0;
      position: relative;
      display: flex;
      justify-content: space-around;
      align-items: center;
      border-left: 5px solid var(--cl-almost);
      height: 34px;
      padding-right: 40px;
      @media screen and (min-height: 700px) {
        height: 40px;
      }
    }
    &__content {
      font-weight: 400;
      font-size: 16px;
      font-family: var(--font-child);
      flex-basis: 0;
      flex-grow: 1;
      padding: 0 10px;
      overflow: hidden;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      // max-height: 20px;
      -webkit-line-clamp: 1;
      text-overflow: ellipsis;
      overflow-wrap: break-word;
      min-width: 180px;
    }
    &__close {
      width: 40px;
      height: 34px;
      flex-basis: 40px;
      flex-grow: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0;
      position: absolute;
      top: 0;
      right: 0;
      z-index: 1;
      @media screen and (min-height: 700px) {
        height: 40px;
      }
      .icon-close {
        background-size: 16px;
      }
    }
  }
  &Wrap {
    position: absolute;
    top: 0;
    width: 100%;
    height: calc(100% - 56px);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding-bottom: 20px;
    z-index: 2;
    @media screen and (min-height: 700px) {
      padding-bottom: 40px;
    }
    & > * {
      z-index: 2;
    }
  }
  &Head {
    // margin-top: 40px;
    // margin-bottom: 50px;
    justify-content: space-between;
    width: 100%;
    &__wrap {
      padding: 5px 15px;
      display: flex;
      gap: 10px;
      justify-content: flex-start;
      @media screen and (min-height: 700px) {
        padding: 35px 15px 10px;
      }
    }
    &__img {
      vertical-align: middle;
      margin-right: 7px;
    }
  }
  &Key {
    position: relative;
    gap: 5px;
    display: flex;
    justify-content: center;
    flex-direction: column;
    &__row {
      position: relative;
      display: flex;
      justify-content: center;
      gap: 5px;
    }
    &__item {
      will-change: transform;
      position: relative;
    }
    &__top {
      position: relative;
      margin: 5px 0 2px;
      display: flex;
      // width: 100vw;
      // padding: 0 20px;
      justify-content: space-between;
      align-items: center;
      @media screen and (min-height: 700px) {
        margin: 10px 0;
      }
    }
    &__delete {
      position: relative;
    }
  }
}

.button {
  &Clue {
    background: var(--cl-white);
    border-radius: 3px;
    padding: 7px 12px;
    font-family: var(--font-child);
    font-weight: 700;
    font-size: 14px;
    line-height: 20px;
    color: var(--cl-main);
    border: 1px solid var(--cl-main);
  }
  &Game {
    &__share {
      border-radius: 3px;
      border: 1px solid var(--cl-secondary);
      padding: 10px 20px;
      height: 40px;
      .buttonIcon {
        width: 18px;
        height: 20px;
        margin-right: 0;
      }
    }
  }
}

.timer {
  &Wrap {
    font-size: 14px;
    color: var(--cl-white);
    text-align: center;
  }
  &Img {
    width: 20px;
    height: auto;
    margin-right: 5px;
    vertical-align: middle;
  }
}
.modal {
  &Game {
    &__explained {
      position: relative;
      padding: 5px 0 0;
      &:deep(p) {
        margin: 5px 0;
      }
    }
    &__verb {
      color: var(--cl-main);
    }
    &__misc {
      color: var(--cl-main);
      position: relative;
      top: -4px;
      font-size: 10px;
    }
    &__result {
      flex-wrap: wrap;
      margin: 15px 0 5px;
      gap: 5px;
      width: 100%;
      align-items: stretch;
      // margin-left: -7px;
      // margin-right: -7px;
    }
    &__box {
      background: var(--cl-white);
      border: 1px solid #e2e2e2;
      border-radius: 5px;
      margin: 0;
      padding: 14px 20px;
      width: calc(50% - (5px / 2));
      text-align: center;
    }
    &__rank {
      background: var(--cl-white);
      border: 1px solid #e2e2e2;
      padding: 11px 15px;
      border-radius: 5px;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    &__userRank {
      font-family: var(--font-parent);
      font-size: 30px;
      color: var(--cl-main);
    }
    &__img {
      display: block;
      margin: 0 auto 10px;
    }
    &__num {
      font-family: var(--font-parent);
      font-size: 32px;
      line-height: 40px;
      span {
        position: relative;
        top: -8px;
        left: 5px;
        font-size: 18px;
        line-height: 24px;
        color: var(--cl-main);
      }
    }
    &__word {
      font-family: var(--font-parent);
      font-size: 21px;
      line-height: 32px;
      color: var(--cl-white);
      .letter {
        background: var(--cl-correct);
        border-radius: 5px;
        padding: 0;
        width: 40px;
        height: 48px;
        justify-content: center;
        align-items: center;
        display: inline-flex;
        text-transform: uppercase;
        margin: 5px 2px;
      }
      &.-example {
        & > .letter {
          background: #fff;
          border: 1px solid var(--cl-black);
          color: var(--cl-black);
          &.-correct {
            background: var(--cl-correct);
            color: #fff;
          }
          &.-wrong {
            background: var(--cl-wrong);
          }
          &.-almost {
            color: #fff;
            background: var(--cl-almost);
          }
        }
      }
    }
  }
}
</style>