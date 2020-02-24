<template>
  <div class="buttons-wrapper">
    <label
      v-for="(e, i) of entries"
      :key="e.value"
      class="gitpkg-button group-button-entry with-right"
      :class="{
        checked: selectedValue === e.value,
      }"
    >
      <span>{{ e.label }}</span>
      <input
        type="radio"
        :name="name"
        :value="e.value"
        v-model="selectedValue"
        @change="selectEntry(e)"
      />
    </label>
  </div>
</template>
<script>
export default {
  props: {
    name: String,
    entries: Array,
    value: String,
  },
  data() {
    return {
      selectedValue: this.value,
    };
  },
  methods: {
    selectEntry(entry) {
      this.$emit("input", entry.value);
    },
  },
};
</script>
<style lang="stylus" scoped>
.buttons-wrapper
  display flex
  flex-direction row
  flex-wrap wrap
  // border-right 1px solid
  // margin-right -1px

.group-button-entry
  user-select none
  padding 0 0.2em
  min-width $unitSize
  text-align center
  border 0
  flex 1 1 auto

  &:not(:hover):not(:focus)
    box-shadow 0px 0 1px 0 black

  &.checked
    background-color $accentColor
    color white

  &:before
    content ""
    display inline-block
    height 100%
    vertical-align middle

  > input[type="radio"]
    display none
</style>
