import { v as vueExports, s as serverRenderer_cjs_prodExports } from './server.mjs';
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
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'vue/server-renderer';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'vue';
import 'unhead/plugins';
import 'node:stream';

const _sfc_main = /* @__PURE__ */ vueExports.defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const inputUrl = vueExports.ref("");
    const showPrompt = vueExports.ref(false);
    vueExports.ref("");
    vueExports.ref(null);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${serverRenderer_cjs_prodExports.ssrRenderAttrs(_attrs)}><div id="jumpPrompt" class="${serverRenderer_cjs_prodExports.ssrRenderClass({ show: showPrompt.value })}"><span>\u68C0\u6D4B\u5230\u94FE\u63A5</span><button id="jumpBtn">\u7ACB\u5373\u8DF3\u8F6C</button></div><div id="mainContent" class="box"><h2>V2EX Reader</h2><div style="${serverRenderer_cjs_prodExports.ssrRenderStyle({ "display": "flex", "gap": "10px", "margin-bottom": "20px", "margin-top": "10px" })}"><input type="text"${serverRenderer_cjs_prodExports.ssrRenderAttr("value", inputUrl.value)} placeholder="\u7C98\u8D34\u94FE\u63A5\u6216\u76F4\u63A5\u8F93\u5165\u6570\u5B57ID" style="${serverRenderer_cjs_prodExports.ssrRenderStyle({ "flex": "1", "margin": "0" })}"><button style="${serverRenderer_cjs_prodExports.ssrRenderStyle({ "padding": "0 24px", "border": "none", "border-radius": "12px", "background": "#1d2129", "color": "#fff", "font-weight": "600", "cursor": "pointer", "white-space": "nowrap", "transition": "transform 0.1s" })}"> \u8DF3\u8F6C </button></div><button style="${serverRenderer_cjs_prodExports.ssrRenderStyle({ "width": "100%", "padding": "14px", "border": "none", "border-radius": "12px", "background": "var(--border)", "color": "var(--text)", "font-weight": "600", "cursor": "pointer" })}"> \u67E5\u770B\u5168\u90E8\u5217\u8868 </button></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = vueExports.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-qZ6dbCXh.mjs.map
