<template>
  <div class="headerTop" id="headerTop"></div>
  <div class="logoWrap text-center" id="logoWrap">
    <img
      src="@/assets/logo.png"
      class="headerImg"
      ref="logo"
      id="logo"
      alt="Kata Kita"
      width="482"
      height="360"
    />
  </div>
</template>

<script>
export default {
  name: "Header_compo",
};
</script>

<style lang="scss">
.header {
  &Img {
    // margin-top: 12vh;
    // margin-bottom: 8vh;
    // max-width: 160px;
    width: auto;
    height: 160px;
    transform: scale(0) rotate(180deg);
    @media screen and (max-height: 500px) {
      height: 100px;
    }
  }
  &Top {
    position: absolute;
    z-index: 1;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url(@/assets/bg-home-top.png);
    background-repeat: no-repeat;
    background-position: top center;
    background-size: 290px;
    pointer-events: none;
    //opacity: 0;
    transform: translate(0,-20%);
  }
}
.logo {
  &Wrap {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    z-index: 1;
    width: 100%;
  }
}
</style>