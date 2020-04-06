<template>
  <action-bar>
    <div class="script-actions">
      <g-select
        v-model="value.type"
        :options="scriptTypes"
        :clearable="false"
        :searchable="false"
        class="relaxed"
        style="flex: 0 0 auto;"
      />
      <input
        class="script-action gitpkg-input"
        style="flex: 1 1 60px; width: 60px;"
        v-model="value.name"
        placeholder="name"
      />
      <input
        class="script-action gitpkg-input"
        style="flex: 1 1 auto;"
        v-model="value.script"
        placeholder="script content"
      />
      <button
        class="script-action gitpkg-button icon"
        style="flex: 0 1 auto;"
        type="button"
        @click="removeSelf"
      >
        <close-icon width="16" height="16" />
      </button>
    </div>
  </action-bar>
</template>
<script>
import ActionBar from "./ActionBar.vue";
import GSelect from "./SelectDropdown.vue";
import CloseIcon from "mdi-vue/Close.vue";

export default {
  components: {
    ActionBar,
    GSelect,
    CloseIcon,
  },
  props: {
    value: Object,
  },
  data() {
    return {
      scriptTypes: ["replace", "prepend", "append"],
    };
  },
  methods: {
    removeSelf() {
      this.$emit("remove");
    },
  },
};
</script>

<style lang="stylus" scoped>
.script-actions
  display flex
  flex-wrap wrap
  flex 1 1 auto

  > .script-action
    border 0

    &:not(:hover):not(:focus)
      box-shadow 0px 0 1px 0 black
</style>
