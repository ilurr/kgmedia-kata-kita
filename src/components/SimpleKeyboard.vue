<template>
  <div :class="keyboardClass"></div>
</template>

<script>
import Keyboard from "simple-keyboard";
import "simple-keyboard/build/css/index.css";

export default {
  name: "SimpleKeyboard",
  props: {
    keyboardClass: {
      default: "simple-keyboard",
      type: String,
    },
    input: {
      type: String,
    },
    inputName: {
      type: String,
    },
  },
  data: () => ({
    keyboard: null,
  }),
  mounted() {
    this.keyboard = new Keyboard(this.keyboardClass, {
      onChange: this.onChange,
      onKeyPress: this.onKeyPress,
      inputName: this.inputName,
      theme: "hg-theme-default hg-layout-default myTheme",
      layout: {
        default: [
          "q w e r t y u i o p",
          "a s d f g h j k l",
          "{enter} z x c v b n m {bksp}",
        ],
      },
      display: {
        "{bksp}": " ",
        "{enter}": "enter",
      },
      buttonTheme: [
        {
          class: "hg-del",
          buttons: "{bksp}",
        },
      ],
    });
  },
  methods: {
    onChange(input) {
      this.$emit("onChange", input);
    },
    onKeyPress(button) {
      this.$emit("onKeyPress", button);
    },
  },
  watch: {
    inputName(inputName) {
      console.log("SimpleKeyboard: inputName updated", inputName);
      this.keyboard.setOptions({ inputName });
    },
    input(input) {
      console.log(
        "SimpleKeyboard: input Updated",
        this.keyboard.options.inputName,
        input
      );
      this.keyboard.setInput(input);
    },
  },
};
</script>

<style lang="scss">
.myTheme {
  background-color: transparent;
  padding: 5px 15px;
  .hg-button {
    background-color: var(--cl-white);
    display: inline-block;
    margin: 2px 1px 2px 1px;
    text-align: center;
    padding-top: 10px;
    border: 0;
    border-radius: 2px;
    color: var(--cl-main);
    text-transform: uppercase;
    font-family: var(--font-parent);
    font-weight: 500;
    font-size: 15px;
  }
  .hg-del {
    min-width: 50px;
    background-image: url(@/assets/backspace.svg);
    background-color: var(--cl-white);
    background-repeat: no-repeat;
    background-position: center;
  }
}
</style>
