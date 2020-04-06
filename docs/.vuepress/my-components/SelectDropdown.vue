<template>
  <v-select
    class="gitpkg-select"
    v-bind="$attrs"
    v-on="$listeners"
    :components="{ OpenIndicator }"
  />
</template>

<script>
import VSelect from "vue-select";
import ChevronDownIcon from "mdi-vue/ChevronDown.vue";
// import "vue-select/dist/vue-select.css";

export default {
  props: ["height"],
  components: {
    VSelect,
  },
  data() {
    return {
      OpenIndicator: {
        render: h =>
          h(ChevronDownIcon, { width: this.height, height: this.height }),
      },
    };
  },
};
</script>
