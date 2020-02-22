<template>
  <div
    class="yarn-icon"
    v-if="name === 'yarn'"
    :style="{ width: size, height: size }"
  >
    <span class="mdi" :role="role" aria-label="yarn icon">
      <svg
        x="0"
        y="0"
        fill="currentColor"
        viewBox="0 0 583.5 518"
        :xmlns="xmlns"
        :width="size"
        :height="size"
        v-html="yarnSvgContent"
      />
    </span>
  </div>
  <div
    class="npm-icon"
    v-else-if="name === 'npm'"
    :style="{ width: size, height: size }"
  >
    <npm-icon :width="size" :height="size" />
  </div>
  <div v-else>{{ name }}</div>
</template>
<script>
import NpmIcon from "mdi-vue/Npm.vue";
import yarnSvgContent from "../yarn-svg-content";

export default {
  components: {
    NpmIcon,
  },
  props: {
    name: String,
    size: [String, Number],
    viewBox: {
      type: [String],
      default: "0 0 24 24",
    },
    xmlns: {
      type: String,
      default: 'xmlns="http://www.w3.org/2000/svg"',
    },
    ariaLabel: {
      type: String,
      default: "icon",
    },
    role: {
      type: String,
      default: "img",
    },
  },
  data() {
    return {
      yarnSvgContent,
    };
  },
};
</script>

<style lang="stylus" scoped>
.yarn-icon
  color #2c8ebb
.npm-icon
  color #cb0000
</style>
