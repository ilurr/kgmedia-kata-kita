<template>
  <div class="scoreContent__wrap" v-if="apiRank.query.data.length">
    <div class="scoreContent__title">
      Total <span class="playerCount">{{ apiRank.query.total }}</span> pemain
    </div>
    <div class="playerUser -show align-center" v-if="apiRank.query.myrank">
      <div class="align-center">
        <div class="playerAva" :data-initial="users.initial"></div>
        <div class="playerUser__content">
          Anda <br />
          <span>Skor: {{ apiRank.query.myrank.score }}</span>
        </div>
      </div>
      <div class="playerUser__rank">#{{ apiRank.query.myrank.position }}</div>
    </div>
    <ul class="playerList">
      <li v-for="(player, index) in apiRank.query.data" :key="index" class="playerItem" :class="{ '-top' : index === 0 }">
        <div class="align-center">
          <div
            class="playerAva"
            :data-initial="player.initial"
            :style="{ backgroundColor: randomColor(index) }"
          >
            <span class="playerInitial">{{ player.name.split(' ')[1] ? player.name.split(' ')[0].substr(0,1).toUpperCase() + '' + player.name.split(' ')[1].substr(0,1).toUpperCase() : player.name.split(' ')[0].substr(0,1).toUpperCase() }}</span>
            <div class="playerTop" v-if="index === 0">
              <span class="playerTopIcon icon-crown"></span>
            </div>
          </div>
          <div class="playerInfo">
            <div class="playerName">{{ player.name }}</div>
            <div class="playerScore">Skor: {{ player.score }}</div>
          </div>
          <div class="playerRank">#{{ index+1 }}</div>
        </div>
      </li>
    </ul>
  </div>
  <div class="scoreContent__wrap text-center" v-else>
    <p>Data masih kosong</p>
  </div>    
</template>

<script>
import axios from 'axios';

export default {
  props: [
    "users"
  ],
  data() {
    return {
      ranks: {},
      page: 1,
      apiRank: {
        url: 'api/kata_kita/score',
        query: {
          data: {}
        },
        status: ''
      },
      players: [],
      user: "Ilma Akrimatunnisa",
      userAva: "IA",
      userRank: "90",
      id: null,
      colorCache: {},
    }
  },
  mounted() {
    // let _this = this
    if(this.users.kmpsid.length>0) {
      this.getRank()
    }
  },
  methods: {
    async getRank() {
      try {
        const response = await axios.get(process.env.VUE_APP_API_URL + this.apiRank.url + '?level=5&kgid=' + this.users.kmpsid + '&page=' + this.page);
        // console.log(response);
        if (!response.ok) {
          const error = (response && response.message) || response.statusText;
          this.apiRank.status = error
          // return Promise.reject(error);
        }

        if(response.data) {
          this.apiRank.query = response.data
          this.apiRank.status = response.status
          // console.log(this.apiRank.query);
        }

      } catch (error) {
        console.log(error.response.status);
        this.apiRank.status = error.response.status
      }
    },
    randomColor(id) {
      const r = () => Math.floor(256 * Math.random());

      return (
        this.colorCache[id] ||
        (this.colorCache[id] = `rgba(${r()}, ${r()}, ${r()}, .5)`)
      );
    },
  }
}
</script>

<style scoped lang="scss">
.score {
  &Content {
    &__wrap {
      position: relative;
      height: 100%;
    }
    &__title {
      font-family: var(--font-parent);
      font-weight: 500;
      font-size: 18px;
      line-height: 24px;
      padding-bottom: 10px;
      border-bottom: 1px solid #E2E2E2;
    }
  }
}

.player {
  &Count {
    color: var(--cl-main);
    text-decoration: underline;
  }
  &List {
    list-style: none;
    padding: 0 10px 0 0;
    margin: 0 -10px 0 0;
    max-height: calc(100% - 30px);
    overflow-y: auto;
  }
  &Rank {
    font-weight: 500;
    font-size: 20px;
    line-height: 30px;
    margin-right: 5px;
    min-width: 18px;
    text-align: center;
    color: var(--cl-main);
  }
  &Info {
    font-family: var(--font-child);
    font-weight: 400;
    margin-left: 10px;
    flex: 1;
  }
  &Score {
    font-size: 14px;
    line-height: 20px;
    color: #757575;
  }
  &Name {
    font-size: 16px;
    line-height: 24px;
  }
  &Ava {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: var(--cl-secondary);
    position: relative;
    font-family: var(--font-parent);
    &:after {
      content: attr(data-initial);
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 20px;
    }
  }
  &Initial {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 20px;
  }
  &Top {
    position: absolute;
    bottom: -2px;
    right: -2px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #ED543A;
    display: flex;
    align-items: center;
    justify-content: center;
    &Icon {
      display: block;
      width: 11px;
      height: 11px;
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center center;
    }
  }
  &User {
    position: absolute;
    bottom: 40px;
    left: 0;
    padding: 12px 10px;
    background: var(--cl-white);
    font-family: var(--font-child);
    font-size: 16px;
    line-height: 24px;
    width: 100%;
    justify-content: space-between;
    border: 1px solid var(--cl-main);
    border-radius: 5px;
    z-index: 1;
    // box-shadow: 0px -5px 10px rgba(51, 51, 51, 0.05);
    visibility: hidden;
    @media screen and (max-height: 650px) {
      bottom: -5px;
    }
    &.-show {
      visibility: visible;
      & ~ .playerList {
        max-height: calc(100% - 175px - 35px);
        @media screen and (max-height: 650px) {
          max-height: calc(100% - 130px);
        }
      }
    }
    &:before {
      top: -35px;
    }
    &:after {
      bottom: -35px;
    }
    &:before,
    &:after {
      content: '';
      position: absolute;
      pointer-events: none;
      height: 20px;
      width: 80px;
      left: calc(50% - (80px / 2));
      background-image: url("data:image/svg+xml,%3Csvg width='80' height='21' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='m31.201.667-8.817 5.06L13.652.703 0 8.053l3.734 1.265 9.782-5.27 8.868 5.081 8.817-5.045 8.783 5.052 8.8-5.06 8.816 5.06 8.851-5.089 9.804 5.271L80 8.053 66.315.703 57.6 5.719 48.784.674l-8.8 5.045L31.2.667Zm0 11.37-8.817 5.038-8.732-5.002L.008 19.402l3.73 1.265 9.796-5.264 8.851 5.075 8.817-5.039 8.783 5.039 8.8-5.039 8.816 5.039 8.851-5.075 9.821 5.264 3.711-1.265-13.668-7.329-8.715 5.002-8.816-5.038-8.8 5.038-8.783-5.038Z' fill='%23E2E2E2'/%3E%3C/svg%3E");
      @media screen and (max-height: 650px) {
        opacity: 0;
      }
    }
    &__rank {
      font-family: var(--font-parent);
      font-size: 28px;
      line-height: 36px;
      color: var(--cl-main);
    }
    &__content {
      margin-left: 10px;
      font-weight: 700;
      span {
        font-weight: 400;
        color: #757575;
      }
    }
  }
  &Item {
    margin-top: 10px;
    margin-bottom: 10px;
    &.-top {
      .playerAva {
        border: 2px solid var(--cl-main);
      }
      .playerName {
        font-weight: 700;
        color: var(--cl-main);
      }
    }
  }
}

</style>
