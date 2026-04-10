import { _ as __nuxt_component_0 } from "./LoginBox-D0kzN80v.js";
import { _ as __nuxt_component_0$1 } from "./nuxt-link-JLW_B2l9.js";
import { v as vueExports, u as useRoute, s as serverRenderer_cjs_prodExports, _ as _export_sfc } from "../server.mjs";
import "C:/Users/Administrator/Documents/XCode/v2/node_modules/.store/hookable@5.5.3/node_modules/hookable/dist/index.mjs";
import { u as useHead } from "./v3-Hl9gcLEc.js";
import "C:/Users/Administrator/Documents/XCode/v2/node_modules/.store/ufo@1.6.3/node_modules/ufo/dist/index.mjs";
import "C:/Users/Administrator/Documents/XCode/v2/node_modules/.store/defu@6.1.6/node_modules/defu/dist/defu.mjs";
import "@babel/parser";
import "C:/Users/Administrator/Documents/XCode/v2/node_modules/.store/ofetch@1.5.1/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "C:/Users/Administrator/Documents/XCode/v2/node_modules/.store/unctx@2.5.0/node_modules/unctx/dist/index.mjs";
import "C:/Users/Administrator/Documents/XCode/v2/node_modules/.store/h3@1.15.11/node_modules/h3/dist/index.mjs";
import "C:/Users/Administrator/Documents/XCode/v2/node_modules/.store/cookie-es@2.0.1/node_modules/cookie-es/dist/index.mjs";
import "C:/Users/Administrator/Documents/XCode/v2/node_modules/.store/destr@2.0.5/node_modules/destr/dist/index.mjs";
import "C:/Users/Administrator/Documents/XCode/v2/node_modules/.store/ohash@2.0.11/node_modules/ohash/dist/index.mjs";
import "C:/Users/Administrator/Documents/XCode/v2/node_modules/.store/klona@2.0.6/node_modules/klona/dist/index.mjs";
import "node:stream";
import "C:/Users/Administrator/Documents/XCode/v2/node_modules/.store/@unhead+vue@2.1.12/node_modules/@unhead/vue/dist/index.mjs";
const _sfc_main = /* @__PURE__ */ vueExports.defineComponent({
  __name: "all",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const needLogin = vueExports.ref(false);
    const items = vueExports.ref([]);
    const loading = vueExports.ref(false);
    const showNotif = vueExports.ref(false);
    const unreadCount = vueExports.ref(0);
    const notifs = vueExports.ref([]);
    const notifLoading = vueExports.ref(false);
    vueExports.watch(showNotif, (val) => {
    });
    vueExports.ref(parseInt(String(route.query.p || 0)));
    vueExports.ref(false);
    vueExports.ref(false);
    vueExports.ref(null);
    const loaderText = vueExports.ref("加载中...");
    const lastViewedCode = vueExports.ref(null);
    const fromPath = vueExports.computed(() => route.fullPath || "/all");
    const saveLastViewed = (code) => sessionStorage.setItem("v2_last_code", code);
    useHead({ title: "V2EX Reader" });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_LoginBox = __nuxt_component_0;
      const _component_NuxtLink = __nuxt_component_0$1;
      _push(`<div${serverRenderer_cjs_prodExports.ssrRenderAttrs(vueExports.mergeProps({ class: "page-container" }, _attrs))} data-v-a4b70620>`);
      if (vueExports.unref(needLogin)) {
        _push(serverRenderer_cjs_prodExports.ssrRenderComponent(_component_LoginBox, { from: vueExports.unref(fromPath) }, null, _parent));
      } else {
        _push(`<!--[--><div id="mainContent" data-v-a4b70620><div class="fab-group" data-v-a4b70620><div class="fab" style="${serverRenderer_cjs_prodExports.ssrRenderStyle({ "position": "relative" })}" title="消息提醒" data-v-a4b70620><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-a4b70620><path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" data-v-a4b70620></path><path d="M8 12h.01" data-v-a4b70620></path><path d="M12 12h.01" data-v-a4b70620></path><path d="M16 12h.01" data-v-a4b70620></path></svg>`);
        if (vueExports.unref(unreadCount) > 0) {
          _push(`<div class="badge" data-v-a4b70620>${serverRenderer_cjs_prodExports.ssrInterpolate(vueExports.unref(unreadCount) > 99 ? "99+" : vueExports.unref(unreadCount))}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="fab" data-v-a4b70620><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-a4b70620><path d="m18 15-6-6-6 6" data-v-a4b70620></path></svg></div><div class="${serverRenderer_cjs_prodExports.ssrRenderClass([{ "loading-rotate": vueExports.unref(loading) }, "fab"])}" data-v-a4b70620><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-a4b70620><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" data-v-a4b70620></path><path d="M3 3v5h5" data-v-a4b70620></path><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" data-v-a4b70620></path><path d="M16 16h5v5" data-v-a4b70620></path></svg></div></div><div id="list" data-v-a4b70620>`);
        if (vueExports.unref(loading) && !vueExports.unref(items).length) {
          _push(`<div class="list-skeleton" data-v-a4b70620><!--[-->`);
          serverRenderer_cjs_prodExports.ssrRenderList(5, (i) => {
            _push(`<div class="${serverRenderer_cjs_prodExports.ssrRenderClass(["skeleton-line", `w-${40 + i * 10}`])}" data-v-a4b70620></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--[-->`);
        serverRenderer_cjs_prodExports.ssrRenderList(vueExports.unref(items), (item) => {
          _push(`<div${serverRenderer_cjs_prodExports.ssrRenderAttr("id", `item_${item.code}`)} class="${serverRenderer_cjs_prodExports.ssrRenderClass([{ "flash-highlight": vueExports.unref(lastViewedCode) === item.code }, "item"])}" data-v-a4b70620>`);
          _push(serverRenderer_cjs_prodExports.ssrRenderComponent(_component_NuxtLink, {
            to: `/t/${item.code}`,
            onClick: ($event) => saveLastViewed(item.code)
          }, {
            default: vueExports.withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${serverRenderer_cjs_prodExports.ssrInterpolate(item.title)}`);
              } else {
                return [
                  vueExports.createTextVNode(vueExports.toDisplayString(item.title), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`<div class="meta" data-v-a4b70620>@${serverRenderer_cjs_prodExports.ssrInterpolate(item.author)} • ${serverRenderer_cjs_prodExports.ssrInterpolate(item.time)} • ${serverRenderer_cjs_prodExports.ssrInterpolate(item.replies)}回复</div></div>`);
        });
        _push(`<!--]--></div><div id="loader" class="loader-text" data-v-a4b70620>`);
        if (vueExports.unref(items).length) {
          _push(`<!--[-->${serverRenderer_cjs_prodExports.ssrInterpolate(vueExports.unref(loaderText))}<!--]-->`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><div id="notifOverlay" class="${serverRenderer_cjs_prodExports.ssrRenderClass({ open: vueExports.unref(showNotif) })}" data-v-a4b70620></div><div id="notifModal" class="${serverRenderer_cjs_prodExports.ssrRenderClass({ open: vueExports.unref(showNotif) })}" data-v-a4b70620><div class="notif-header" data-v-a4b70620><h3 data-v-a4b70620>最新提醒</h3><button class="close-btn" aria-label="关闭" data-v-a4b70620>×</button></div>`);
        if (vueExports.unref(notifLoading) && !vueExports.unref(notifs).length) {
          _push(`<div class="notif-state" data-v-a4b70620><p data-v-a4b70620>正在获取消息...</p></div>`);
        } else if (vueExports.unref(notifs).length === 0) {
          _push(`<div class="notif-state" data-v-a4b70620><p data-v-a4b70620>暂无新消息</p></div>`);
        } else {
          _push(`<div class="notif-list" data-v-a4b70620><!--[-->`);
          serverRenderer_cjs_prodExports.ssrRenderList(vueExports.unref(notifs), (n) => {
            _push(`<div class="notif-item" data-v-a4b70620><div class="notif-body" data-v-a4b70620><div class="notif-title" data-v-a4b70620>${serverRenderer_cjs_prodExports.ssrInterpolate(n.desc)}</div><div class="notif-meta" data-v-a4b70620><span class="time" data-v-a4b70620>${serverRenderer_cjs_prodExports.ssrInterpolate(n.time)}</span></div>`);
            if (n.payload) {
              _push(`<div class="notif-payload" data-v-a4b70620>${n.payload ?? ""}</div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div><div class="notif-arrow" data-v-a4b70620><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-v-a4b70620><path d="m9 18 6-6-6-6" data-v-a4b70620></path></svg></div></div>`);
          });
          _push(`<!--]--></div>`);
        }
        _push(`</div><!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = vueExports.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/all.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const all = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-a4b70620"]]);
export {
  all as default
};
//# sourceMappingURL=all-CNhL_KRu.js.map
