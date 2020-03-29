<template>
  <div class="bar" :class="{ 'with-text': hasText }">
    <div v-if="!!hasText" class="bar-text-container">
      <slot name="text" />
    </div>
    <div class="bar-prepend">
      <slot name="prepend" size="2.4em" />
    </div>
    <slot />
    <div
      v-if="!!hasAppendText"
      class="bar-text-container bar-text-container-bottom"
    >
      <slot name="append-text" />
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    hasText() {
      return !!this.$slots.text;
    },
    hasAppendText() {
      return !!this.$slots["append-text"];
    },
  },
};
</script>

<style lang="stylus" scoped>
$height = $unitSize

.bar
  display flex
  flex-direction row
  justify-content center
  align-items center
  margin-top 1.4em

  &.with-text
    flex-wrap wrap

    & > .bar-text-container
      width: 100%;
      flex: 1 0 auto;

    & > .bar-text-container-bottom
      box-sizing border-box
      padding-top 0.6em

  & > *
    min-height $height

  > .bar-prepend
    width $unitSize
    margin 0 ($unitSize / 8)
    flex 0 0 auto
    min-height 0
</style>
