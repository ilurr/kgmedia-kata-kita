<template>
  <Transition name="modal">
    <div v-if="show" class="clue-mask">
      <div class="clue-wrapper">
        <div class="clue-container">
			<slot name="body"></slot>
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
.clue-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  display: table;
  transition: opacity 0.3s ease;
}

.clue-wrapper {
  display: table-cell;
  vertical-align: top;
}

.clue-default-button {
  float: right;
}

/*
 * The following styles are auto-applied to elements with
 * transition="clue" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the clue transition by editing
 * these styles.
 */

.clue-enter-from {
  opacity: 0;
}

.clue-leave-to {
  opacity: 0;
}

.clue-enter-from .clue-container,
.clue-leave-to .clue-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}

.clue {
  &-container {
    position: relative;
    width: 100%;
		height: calc(100% - 40px);
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
  }
	&-ads {
		position: relative;
		width: 100%;
		height: auto;
		// height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
  }
	&-timer {
		position: absolute;
		color: #fff;
		z-index: 2;
		right: 0;
		top: 0;
		font-weight: 400;
		font-family: var(--font-child);
		padding: 10px;
	}
	&-footer {
		position: relative;
		padding: 20px 10px 10px;
	}
	&-info {
		text-align: center;
		font-weight: 400;
		font-family: var(--font-child);
		font-size: 16px;
		color: #fff;
		padding-top: 10px;
	}
	&-close {
		position: absolute;
		bottom: -30px;
		right: 10px;
		z-index: 2;
		width: 40px;
		height: 40px;
		img {
			margin-right: 0;
		}
	} 
}
</style>