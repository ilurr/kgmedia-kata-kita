<template>
  <Transition name="modal">
    <div v-if="show" class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">
          <div class="modal-header">
            <slot name="header">default header</slot>
          </div>

          <div class="modal-body">
            <slot name="body">default body</slot>
          </div>

          <div class="modal-footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script>
export default {
  props: {
    show: Boolean,
  },
};
</script>

<style lang="scss">
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: table;
  transition: opacity 0.3s ease;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-default-button {
  float: right;
}

/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.modal-enter-from {
  opacity: 0;
}

.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}

.modal {
  &-container {
    position: relative;
    // padding: 20px;
    width: calc(100% - 20px);
    max-width: 360px;
    margin: 0px auto;
    background-color: var(--cl-white);
    border-radius: 10px;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
  }
  &-body {
    font-family: var(--font-child);
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    color: var(--cl-black);
    background: #fafafa;
    min-height: 70px;
    max-height: 60vh;
    overflow-y: auto;
  }
  &-footer {
    padding: 14px 15px;
    position: relative;
    box-shadow: 0px -5px 10px rgba(51, 51, 51, 0.05);
    &:empty {
      box-shadow: none;
      padding: 5px;
      background: #fafafa;
      border-radius: 0 0 10px 10px;
    }
  }
  &Head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 15px;
  }
  &Title {
    font-family: var(--font-parent);
    font-weight: 500;
    font-size: 18px;
    line-height: 24px;
    margin: 5px 0;
  }
  &Game {
    &__icon {
      margin-right: 10px;
    }
    &__body {
      position: relative;
      background: #fafafa;
      padding: 1px 15px;
      p {
        margin-top: 10px;
        margin-bottom: 10px;
      }
    }
    &__footer {
      position: relative;
      justify-content: space-between;
      background: var(--cl-white);
      border-bottom-left-radius: 10px;
      border-bottom-right-radius: 10px;
      display: flex;
      gap: 5px;
    }
  }
  &Share {
    &__content {
      position: relative;
      padding: 10px 15px;
    }
    &__icon {
      vertical-align: text-bottom;
      margin-right: 7px;
    }
    &__list {
      position: relative;
      flex-wrap: wrap;
      padding: 15px 15px 25px;
      gap: 5px;
      justify-content: center;
      // margin-top: 15px;
      // margin-left: -7px;
      // margin-right: -7px;
    }
    &__footer {
      position: relative;
      // border-top: 1px solid #e2e2e2;
      // padding-top: 15px;
    }
  }
  &Icon {
      vertical-align: middle;
      margin-right: 10px;
  }
}
</style>