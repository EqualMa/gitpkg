<template>
  <action-bar>
    <template #prepend="{ size }">
      <wrench-outline-icon :width="size" :height="size" />
    </template>
    <template #text>
      Custom Scripts
      <div style="margin-bottom: 1.4em;">
        <custom-script-edit
          v-for="(cs, i) in customScripts"
          :key="cs.__key"
          v-model="customScripts[i]"
          @remove="removeCustomScript(i)"
        />
      </div>
    </template>
    <button
      class="gitpkg-button"
      style="flex: 1 1 0;"
      type="button"
      @click="addCustomScript"
    >
      Add a custom script
    </button>
    <button
      class="gitpkg-button icon with-left"
      type="button"
      @click="seeCustomScriptHelp"
    >
      <help-icon width="16" height="16" />
    </button>
  </action-bar>
</template>

<script>
import ActionBar from "./ActionBar.vue";
import CustomScriptEdit from "./CustomScriptEdit.vue";
import WrenchOutlineIcon from "mdi-vue/WrenchOutline.vue";
import HelpIcon from "mdi-vue/Help.vue";

export default {
  components: {
    ActionBar,
    CustomScriptEdit,

    WrenchOutlineIcon,
    HelpIcon,
  },
  props: {
    customScripts: { type: Array, default: [] },
  },
  model: {
    prop: "customScripts",
  },
  methods: {
    addCustomScript() {
      if (this.customScripts.length > 0) {
        const last = this.customScripts[this.customScripts.length - 1];
        if (last.name === "" && last.script === "") return;
      }
      this.customScripts.push({
        name: "",
        script: "",
        type: "replace",
        __key: new Date().getTime().toString() + "-" + Math.random().toString(),
      });
    },
    removeCustomScript(i) {
      this.customScripts.splice(i, 1);
    },
    seeCustomScriptHelp() {
      window.open("/guide/#custom-scripts");
    },
  },
};
</script>
