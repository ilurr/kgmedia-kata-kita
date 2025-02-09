<template>
  <input
    :id="inputName"
    :value="inputValue"
    @focus="onInputFocus"
    @input="onInputChange"
    class="inputTxt"
  />
</template>

<script>
export default {
  name: "InputKeyboard",
  props: {
    inputs: {
      type: Object,
    },
    inputName: {
      type: String,
    },
    key_parent: {},
  },
  methods: {
    onInputChange(input) {
      this.$emit("onInputChange", input);
    },
    onInputFocus(input) {
      this.$emit("onInputFocus", input);
    },
  },
  computed: {
    inputValue: function () {
      return this.inputs[this.inputName];
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.input {
  &Txt {
    width: 40px;
    height: 16px;
    background-color: var(--cl-white);
    margin: 5px;
    text-align: center;
    text-transform: uppercase;
    border: 0;
    border-radius: 4px;
    padding: 14px 2px;
  }
}
</style>