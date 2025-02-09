<template>
  <div class="footer center-flex">
    <img
      src="@/assets/present.png"
      alt="KG Media Present"
      class="footerPresent"
      id="ftLogo"
      width="103"
      height="16"
    />
    <div :class="{ active: isBackActive }" class="footerWrap center-flex">
      <div class="footerItem" id="btnback">
        <button class="button footerBack__btn" @click="$emit('backHome')">
          <span class="buttonIcon icon-back"></span>
          <span class="buttonTxt">Kembali</span>
        </button>
      </div>
      <div class="footerItem" id="btnhome">
        <button class="button footerBack__btn" @click="$emit('isLeave')">
          <span class="buttonIcon icon-home"></span>
          <span class="buttonTxt">Beranda</span>        
        </button>
      </div>
      <div class="footerItem" id="btnhome2">
        <button class="button footerBack__btn" @click="$emit('backHome')">
          <span class="buttonIcon icon-home"></span>
          <span class="buttonTxt">Beranda</span>        
        </button>
      </div>
      <div class="footerItem -play">
        <img
          src="@/assets/logokomplay.png"
          alt="Kompas Play"
          width="148"
          height="18"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Footer_compo",
  props: ["isBackActive"],
};
</script>

<style scoped lang="scss">
.footer {
  flex-direction: column;
  position: absolute;
  bottom: 0;
  width: 100%;
  padding-top: 15px;
  padding-bottom: 15px;
  background: var(--cl-white);
  &Wrap {
    width: calc(100% - 40px);
    padding: 0 20px;
    min-height: 26px;
    &.active {
      justify-content: space-between;
    }
  }
  &Present {
    position: absolute;
    top: -70px;
  }
  &Item {
    position: relative;
    display: none;
    height: 18px;
    &.-play {
      display: flex;
      a {
        display: inline-flex;
      }
    }
  }
  &Back {
    vertical-align: sub;
    margin-right: 10px;
    &__btn {
      font-family: var(--font-child);
      font-weight: 400;
      font-size: 14px;
      color: var(--cl-secondary);
      text-decoration: none;
    }
  }
}
</style>