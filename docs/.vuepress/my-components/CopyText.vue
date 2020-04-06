<template>
  <action-bar>
    <template #text>
      <slot name="text" />
    </template>
    <template #append-text>
      <slot name="append-text" />
    </template>
    <template #prepend="data">
      <slot name="prepend" v-bind="data" />
    </template>
    <input
      ref="textInput"
      class="copy-text-input gitpkg-input with-right"
      :class="{ success: copyState === true }"
      type="text"
      :value="text"
      readonly
    />
    <button
      class="gitpkg-button icon with-left"
      :class="{
        success: copyState === true,
        error: copyState === false,
      }"
      type="button"
      v-clipboard:copy="text"
      v-clipboard:success="copySuccess"
      v-clipboard:error="copyError"
    >
      <content-copy width="16" height="16" />
    </button>
  </action-bar>
</template>

<script>
import ContentCopy from "mdi-vue/ContentCopy.vue";
import ActionBar from "./ActionBar";

export default {
  components: {
    ContentCopy,
    ActionBar,
  },
  props: {
    text: String,
  },
  data() {
    return {
      copyState: undefined,
      resetTask: undefined,
    };
  },
  methods: {
    copyEnd(success) {
      this.copyState = !!success;

      if (this.resetTask !== undefined) clearTimeout(this.resetTask);
      this.resetTask = setTimeout(() => {
        this.copyState = undefined;
        this.resetTask = undefined;
      }, 1000);
    },
    copySuccess() {
      this.copyEnd(true);
      this.$refs.textInput.focus();
    },
    copyError() {
      this.copyEnd(false);
    },
  },
};
</script>

<style lang="stylus" scoped>
.copy-text-input
  flex 1 1 auto
</style>
