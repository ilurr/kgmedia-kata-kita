<template>
  <div v-if="!isHiddenLvl" id="lvlWrap" class="lvlWrap">
    <h2 class="text-center menuTitle" id="text1">Pilih Jumlah Huruf</h2>
    <ul class="listMenu">
      <li>
        <button
          class="button buttonMenu buttonMenu__lvl"
          @click="$emit('showGame', 4)"
          id="btn1"
        >
          <span><span class="buttonMenu__num">1</span>Mudah</span>
          <span class="buttonMenu__txt">4 Huruf</span>
        </button>
      </li>
      <li>
        <button
          class="button buttonMenu buttonMenu__lvl"
          @click="$emit('showGame', 5)"
          id="btn2"
        >
          <span><span class="buttonMenu__num">2</span>Sedang</span>
          <span class="buttonMenu__txt">5 Huruf</span>
        </button>
      </li>
      <li>
        <button
          class="button buttonMenu buttonMenu__lvl"
          @click="$emit('showGame', 6)"
          id="btn3"
        >
          <span><span class="buttonMenu__num">3</span>Sulit</span>
          <span class="buttonMenu__txt">6 Huruf</span>
        </button>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "Menu_level",
  data() {
    return {
      isHiddenLvl: false,
      showGame: false,
    };
  },
};
</script>

<style scoped lang="scss">
.menuTitle {
  font-family: var(--font-parent);
  font-weight: 500;
  font-size: 18px;
  line-height: 24px;
  color: var(--cl-white);
  margin-bottom: 27px;
}
.lvlWrap {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-30%);
    z-index: 1;
    width: 100%;
    @media screen and (min-height: 600px) {
      transform: translate(-50%,-20%);
    }
}
.buttonMenu {
  padding: 15px 20px;
  @media screen and (min-height: 600px) {
    padding: 24px 30px;
  }
  &__lvl {
    text-align: left;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  &__txt {
    text-transform: uppercase;
    color: #9a9a9a;
    font-size: 14px;
    line-height: 18px;
    letter-spacing: 0.05em;
  }
  &__num {
    padding: 0 8px;
    margin-right: 12px;
    border: 2px solid var(--cl-main);
  }
}
.listMenu {
  list-style: none;
  padding: 0;
}
</style>