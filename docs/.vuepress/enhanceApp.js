import "normalize.css/normalize.css";
import VueClipboard from "vue-clipboard2";

// https://vuepress.vuejs.org/guide/basic-config.html#app-level-enhancements
export default ({ Vue }) => {
  Vue.use(VueClipboard);
};
