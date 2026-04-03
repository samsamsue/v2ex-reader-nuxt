import { t as tryUseNuxtApp, v as vueExports } from "../server.mjs";
import { useHead as useHead$1, headSymbol } from "C:/Users/Administrator/Documents/XCode/v2/node_modules/.store/@unhead+vue@2.1.12/node_modules/@unhead/vue/dist/index.mjs";
function injectHead(nuxtApp) {
  const nuxt = nuxtApp || tryUseNuxtApp();
  return nuxt?.ssrContext?.head || nuxt?.runWithContext(() => {
    if (vueExports.hasInjectionContext()) {
      return vueExports.inject(headSymbol);
    }
  });
}
function useHead(input, options = {}) {
  const head = injectHead(options.nuxt);
  if (head) {
    return useHead$1(input, { head, ...options });
  }
}
export {
  useHead as u
};
//# sourceMappingURL=v3-Hl9gcLEc.js.map
