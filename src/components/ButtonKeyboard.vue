<template>
  <button
    class="keyBtn"
    tabindex="-1"
    :class="{ '-enter': isEnter, '-delete': isDelete }"
    :keyChar="keyChar"
    @click="$emit('onKeyPress', $event.target, keyChar)"
  >
    <span class="icon-enter" v-if="keyChar == 'enter'">
    </span>
    <span v-else-if="keyChar == 'delete'">
      <img
        src="@/assets/backspace.svg"
        alt=""
      />
    </span>
    <span v-else>
      {{keyChar}}
    </span>
  </button>
</template>

<script>
export default {
  name: "KeyBtn",
  props: {
    keyChar: String,
    isEnter: Boolean,
    isDelete: Boolean
  },
  methods: {

  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.key {
  &Btn {
    min-width: 25px;
    height: 35px;
    background-color: var(--cl-white);
    color: #000;
    font-family: var(--font-parent);
    font-size: 14px;
    font-weight: 500;
    margin: 0;
    text-align: center;
    text-transform: uppercase;
    border: 0;
    border-radius: 4px;
    padding: 0 6px;
    display: flex;
    justify-content: center;
    align-items: center;
    // @media screen and (max-height: 650px) {
    //   height: 35px;
    // }
    @media screen and (min-height: 600px) {
      min-width: 28px;
      height: 40px;
    }
    & > span {
      display: block;
      pointer-events: none;
      img {
        vertical-align: top;
      }
    }
    &.-enter {
      background-color: var(--cl-main);
      color: var(--cl-white);
    }
    &.-delete {
      padding: 0 12px;
      height: 34px;
      @media screen and (max-height: 500px) {
        height: 26px;
      }
    }
    &.-disabled {
      pointer-events: none;
      background: #F1F1F1;
      color: #757575;
      // border: 1px solid #F1F1F1;
      img {
        filter: grayscale(1);
      }
    }
  }
}
</style>