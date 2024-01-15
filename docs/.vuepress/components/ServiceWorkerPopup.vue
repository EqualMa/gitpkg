<template>
  <SWUpdatePopup v-slot="{ enabled, reload, message, buttonText }">
    <div v-if="enabled" class="gitpkg-sw-update-popup">
      {{ message }}<br />
      <button @click="reload">{{ buttonText }}</button>
    </div>
  </SWUpdatePopup>
</template>

<script>
import SWUpdatePopup from "@vuepress/plugin-pwa/lib/SWUpdatePopup.vue";

export default {
  components: { SWUpdatePopup },
};
</script>
<style lang="stylus" scoped>
.gitpkg-sw-update-popup
  position fixed
  text-align center
  right 1em
  bottom 1em
  padding 1em
  color black
  background white
  border 2px solid $accentColor
  box-shadow 0.5em 0.5em 2em rgba(0, 0, 0, 0.6)
  transition all ease 0.2s 0s, box-shadow ease-out 0.4s 0s
  z-index 2

.gitpkg-sw-update-popup button
  margin-top 0.5em
  padding 0.4em 1.8em
  border-width 0
  color white
  background-color $accentColor
  box-shadow 0.5em 0.5em 1.5em rgba(0, 0, 0, 0.4)

&:not(:hover):not(:focus)
  box-shadow 0px 0 1px 0 black
</style>
