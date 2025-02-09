<template>
  <input
    class="inputTxt"
    tabindex="-1"
    readonly="readonly"
    :id="inputName"
    :value="inputValue"
  />
</template>

<script>
export default {
  name: "InputBoard",
	props: {
    inputName: String,
    inputValue: String
	}
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.input {
  &Txt {
    width: 35px;
    height: 35px;
    color: #454545;
    background-color: var(--cl-white);
    margin: 2px;
    text-align: center;
    text-transform: uppercase;
    border: 0;
    border-radius: 4px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-parent);
    font-size: 18px;
    font-weight: 500;
    outline: none;
    // @media screen and (max-height: 650px) {
    //   height: 43px;
    // }
    // @media screen and (max-height: 670px) {
    //   height: 45px;
    // }
    @media screen and (min-height: 600px) {
      height: 43px;
      width: 40px;
    }
    @media screen and (min-height: 700px) {
      height: 46px;
    }
  }
}
</style>