<template>
  <div
    class="gitpkg-container"
    :class="{
      'gitpkg-preview': preview,
    }"
  >
    <div class="input-container">
      <action-bar>
        <template #text>
          Just paste your github url and copy the commands:
        </template>
        <template #prepend="{ size }">
          <github-icon :width="size" :height="size" />
        </template>
        <input
          class="gitpkg-input main-input with-right"
          :class="{ error }"
          autofocus
          v-model="url"
          :placeholder="placeholder"
        />
        <button
          class="gitpkg-button icon with-left"
          type="button"
          @click="url = ''"
        >
          <close-icon width="16" height="16" />
        </button>
      </action-bar>
    </div>
    <custom-scripts v-model="customScripts" />
    <api-choices-display
      v-if="api.type === 'choice'"
      :apiList="api.possibleApis"
    />
    <single-api-display
      v-else
      :api="api"
      style="min-height: 20em; margin-top: 1.4em;"
    />
  </div>
</template>

<script>
import CloseIcon from "mdi-vue/Close.vue";
import GithubIcon from "mdi-vue/Github.vue";
import { apiFromUrl } from "../api-from-url";
import ApiChoicesDisplay from "../my-components/ApiChoicesDisplay.vue";
import SingleApiDisplay from "../my-components/SingleApiDisplay.vue";
import CustomScripts from "../my-components/CustomScripts.vue";
import ActionBar from "../my-components/ActionBar.vue";

export default {
  components: {
    ApiChoicesDisplay,
    SingleApiDisplay,
    CustomScripts,
    CloseIcon,
    GithubIcon,
    ActionBar,
  },
  data() {
    return {
      // github tree url
      url: "",
      placeholder: "https://github.com/<user>/<repo>/tree/<commit>/<subdir>",
      customScripts: [],
    };
  },
  computed: {
    api() {
      return apiFromUrl(this.url || this.placeholder, this.customScripts);
    },
    preview() {
      return !this.url;
    },
    error() {
      return this.api.data.originalUrl && this.api.type === "error";
    },
  },
};
</script>

<style lang="stylus" scoped>
.gitpkg-container
  max-width 40em
  margin 1em auto

  &.gitpkg-preview > :not(.input-container),
  &.gitpkg-preview > :not(.input-container) >>> *
    color lightgrey

.input-container
  display flex
  align-items center

  .main-input
    flex 1 1 auto
</style>
