<template>
  <div v-if="api.type === 'error'">
    <action-bar v-if="api.errorType === 'platform-not-supported'">
      <span class="error">Only github.com is supported currently</span>
    </action-bar>
  </div>
  <div v-else>
    <action-bar>
      <template #text>
        Select dependency type
      </template>
      <template #prepend="{ size }">
        <developer-board-icon :width="size" :height="size" />
      </template>
      <button-group
        style="flex: 1 1 0"
        v-model="selectedDependencyType"
        :entries="dependencyTypes"
        name="dependencyType"
      />
    </action-bar>
    <copy-text
      v-for="manager of commands.managerNames"
      :key="manager"
      :text="commands.commands[manager][selectedDependencyType]"
    >
      <template #prepend="{ size }">
        <pm-icon :name="manager" :size="size" />
      </template>
    </copy-text>

    <action-bar v-if="api.type === 'warn' && api.warnType === 'suggest-to-use'">
      <template #text>
        It seems that no sub folder or custom scripts are specified so you don't
        need to use GitPkg.
      </template>
      <button
        class="gitpkg-button"
        style="flex: 1 1 0"
        type="button"
        @click="showSuggested = !showSuggested"
      >
        {{
          showSuggested
            ? "See GitPkg API (not recommended)"
            : "Show recommended commands"
        }}
      </button>
    </action-bar>
    <copy-text v-if="warnForWindows" :text="pkgJsonForWindows">
      <template #text>
        <div class="warning" style="margin-bottom: 0.6em;">
          If you use windows, errors may occur when running
          <code>npm install ...</code> or <code>yarn add ...</code>
          because the url contains
          <code>{{ "&" }}</code>
          . In such cases, you will have to add
        </div>
      </template>
      <template #append-text>
        <span class="warning">
          to "dependencies / devDependencies" of your package.json and run
          <code>npm install</code> or <code>yarn install</code>
          manually to install the dependency
        </span>
      </template>
      <template #prepend="{ size }">
        <alert-icon :width="size" :height="size" class="warning" />
      </template>
    </copy-text>
  </div>
</template>

<script>
import CopyText from "./CopyText.vue";
import PmIcon from "./PmIcon.vue";
import ActionBar from "./ActionBar.vue";
import ButtonGroup from "./ButtonGroup.vue";
import { installCommands } from "../install-command";

import GraphOutlineIcon from "mdi-vue/GraphOutline.vue";
import DeveloperBoardIcon from "mdi-vue/DeveloperBoard.vue";
import AlertIcon from "mdi-vue/AlertCircleOutline.vue";

export default {
  components: {
    CopyText,
    PmIcon,
    ActionBar,
    ButtonGroup,

    GraphOutlineIcon,
    DeveloperBoardIcon,
    AlertIcon,
  },
  props: { api: Object },
  data() {
    return {
      showSuggested: true,
      selectedDependencyType: "dependency",
    };
  },
  computed: {
    installUrl() {
      const url =
        this.showSuggested && this.api.suggestion
          ? this.api.suggestion.apiUrl
          : this.api.apiUrl;
      return url;
    },
    commands() {
      const url = this.installUrl;
      return installCommands(url);
    },
    warnForWindows() {
      return this.installUrl.includes("&");
    },
    pkgJsonForWindows() {
      return `"{package-name}": "${this.installUrl}"`;
    },
    dependencyTypes() {
      return this.commands.dependencyTypes.map(d => ({ label: d, value: d }));
    },
  },
};
</script>

<style lang="stylus" scoped>
.error
  color $errorColor

.warning
  color $warningColor
</style>
