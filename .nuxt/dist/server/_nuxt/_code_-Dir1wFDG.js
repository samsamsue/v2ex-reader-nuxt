import { _ as _sfc_main$1 } from "./TopicPage-DE4FRFLD.js";
import { v as vueExports, u as useRoute, s as serverRenderer_cjs_prodExports } from "../server.mjs";
import "./LoginBox-LsaNkmC7.js";
import "./nuxt-link-JLW_B2l9.js";
import "C:/Users/Administrator/Documents/XCode/v2/node_modules/.store/ufo@1.6.3/node_modules/ufo/dist/index.mjs";
import "C:/Users/Administrator/Documents/XCode/v2/node_modules/.store/defu@6.1.6/node_modules/defu/dist/defu.mjs";
import "qrcode";
import "./v3-Hl9gcLEc.js";
import "C:/Users/Administrator/Documents/XCode/v2/node_modules/.store/@unhead+vue@2.1.12/node_modules/@unhead/vue/dist/index.mjs";
import "C:/Users/Administrator/Documents/XCode/v2/node_modules/.store/hookable@5.5.3/node_modules/hookable/dist/index.mjs";
import "@babel/parser";
import "C:/Users/Administrator/Documents/XCode/v2/node_modules/.store/ofetch@1.5.1/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "C:/Users/Administrator/Documents/XCode/v2/node_modules/.store/unctx@2.5.0/node_modules/unctx/dist/index.mjs";
import "C:/Users/Administrator/Documents/XCode/v2/node_modules/.store/h3@1.15.11/node_modules/h3/dist/index.mjs";
import "node:stream";
const SALT = 1234567;
const _sfc_main = /* @__PURE__ */ vueExports.defineComponent({
  __name: "[code]",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const code = vueExports.computed(() => String(route.params.code || ""));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_TopicPage = _sfc_main$1;
      _push(serverRenderer_cjs_prodExports.ssrRenderComponent(_component_TopicPage, vueExports.mergeProps({
        code: vueExports.unref(code),
        salt: SALT,
        "require-auth": false,
        "show-qr": false,
        "show-share-link": false,
        "show-back": false,
        "show-open-original": false,
        "topic-api-base": "/api/public-topic",
        "replies-api-base": "/api/public-replies",
        "page-title": "V2EX Reader",
        "compact-title": false
      }, _attrs), null, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = vueExports.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/s/[code].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=_code_-Dir1wFDG.js.map
