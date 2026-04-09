import { _ as _sfc_main$1 } from './TopicPage-DE4FRFLD.mjs';
import { v as vueExports, u as useRoute, s as serverRenderer_cjs_prodExports } from './server.mjs';
import './LoginBox-LsaNkmC7.mjs';
import './nuxt-link-JLW_B2l9.mjs';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'undici';
import 'node:url';
import './v3-Hl9gcLEc.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'vue/server-renderer';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'vue';
import 'unhead/plugins';
import 'node:stream';

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

export { _sfc_main as default };
//# sourceMappingURL=_code_-Dir1wFDG.mjs.map
