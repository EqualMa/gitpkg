<template>
  <div>
    <action-bar v-if="selectEntries.length > 1">
      <template #text>
        Select the correct commit name
      </template>
      <template #prepend="{ size }">
        <source-commit-icon :width="size" :height="size" />
      </template>
      <button-group
        style="flex: 1 1 0"
        :entries="selectEntries"
        v-model="selectedIndex"
        name="branch"
      />
      <template #append-text>
        You select commit <code>{{ selected.data.commit }}</code
        >, {{ selected.data.subdir ? "" : "no" }} sub folder
        <code v-if="selected.data.subdir">{{ selected.data.subdir }}</code>
      </template>
    </action-bar>
    <single-api-display :api="selected" />
  </div>
</template>

<script>
import SingleApiDisplay from "./SingleApiDisplay.vue";
import ActionBar from "./ActionBar";
import ButtonGroup from "./ButtonGroup";

import SourceCommitIcon from "mdi-vue/SourceCommit.vue";

export default {
  components: {
    SingleApiDisplay,
    ButtonGroup,
    ActionBar,
    SourceCommitIcon,
  },
  props: { apiList: Array },
  data() {
    return {
      selectedIndex: "0",
    };
  },
  computed: {
    selected() {
      return this.apiList && this.apiList[this.selectedIndex];
    },
    selectEntries() {
      return this.apiList
        ? this.apiList.map((api, i) => ({
            value: String(i),
            label: api.data.commit,
          }))
        : [];
    },
  },
};
</script>

<style></style>
