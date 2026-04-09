import { v as vueExports, s as serverRenderer_cjs_prodExports } from "../server.mjs";
import "@babel/parser";
import "C:/Users/Administrator/Documents/XCode/v2/node_modules/.store/ofetch@1.5.1/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "C:/Users/Administrator/Documents/XCode/v2/node_modules/.store/hookable@5.5.3/node_modules/hookable/dist/index.mjs";
import "C:/Users/Administrator/Documents/XCode/v2/node_modules/.store/unctx@2.5.0/node_modules/unctx/dist/index.mjs";
import "C:/Users/Administrator/Documents/XCode/v2/node_modules/.store/h3@1.15.11/node_modules/h3/dist/index.mjs";
import "C:/Users/Administrator/Documents/XCode/v2/node_modules/.store/defu@6.1.6/node_modules/defu/dist/defu.mjs";
import "C:/Users/Administrator/Documents/XCode/v2/node_modules/.store/ufo@1.6.3/node_modules/ufo/dist/index.mjs";
import "C:/Users/Administrator/Documents/XCode/v2/node_modules/.store/cookie-es@2.0.1/node_modules/cookie-es/dist/index.mjs";
import "C:/Users/Administrator/Documents/XCode/v2/node_modules/.store/destr@2.0.5/node_modules/destr/dist/index.mjs";
import "C:/Users/Administrator/Documents/XCode/v2/node_modules/.store/ohash@2.0.11/node_modules/ohash/dist/index.mjs";
import "C:/Users/Administrator/Documents/XCode/v2/node_modules/.store/klona@2.0.6/node_modules/klona/dist/index.mjs";
import "node:stream";
const _sfc_main = /* @__PURE__ */ vueExports.defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const inputUrl = vueExports.ref("");
    const showPrompt = vueExports.ref(false);
    vueExports.ref("");
    vueExports.ref(null);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${serverRenderer_cjs_prodExports.ssrRenderAttrs(_attrs)}><div id="jumpPrompt" class="${serverRenderer_cjs_prodExports.ssrRenderClass({ show: showPrompt.value })}"><span>检测到链接</span><button id="jumpBtn">立即跳转</button></div><div id="mainContent" class="box"><h2>V2EX Reader</h2><div style="${serverRenderer_cjs_prodExports.ssrRenderStyle({ "display": "flex", "gap": "10px", "margin-bottom": "20px", "margin-top": "10px" })}"><input type="text"${serverRenderer_cjs_prodExports.ssrRenderAttr("value", inputUrl.value)} placeholder="粘贴链接或直接输入数字ID" style="${serverRenderer_cjs_prodExports.ssrRenderStyle({ "flex": "1", "margin": "0" })}"><button style="${serverRenderer_cjs_prodExports.ssrRenderStyle({ "padding": "0 24px", "border": "none", "border-radius": "12px", "background": "#1d2129", "color": "#fff", "font-weight": "600", "cursor": "pointer", "white-space": "nowrap", "transition": "transform 0.1s" })}"> 跳转 </button></div><button style="${serverRenderer_cjs_prodExports.ssrRenderStyle({ "width": "100%", "padding": "14px", "border": "none", "border-radius": "12px", "background": "var(--border)", "color": "var(--text)", "font-weight": "600", "cursor": "pointer" })}"> 查看全部列表 </button></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = vueExports.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=index-qZ6dbCXh.js.map
