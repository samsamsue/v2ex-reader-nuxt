import { _ as __nuxt_component_0 } from './LoginBox-LsaNkmC7.mjs';
import { _ as __nuxt_component_0$1 } from './nuxt-link-JLW_B2l9.mjs';
import { _ as _export_sfc, v as vueExports, u as useRoute, s as serverRenderer_cjs_prodExports } from './server.mjs';
import { u as useHead } from './v3-Hl9gcLEc.mjs';
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
  __name: "all",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const needLogin = vueExports.ref(false);
    const items = vueExports.ref([]);
    const loading = vueExports.ref(true);
    const lastViewedCode = vueExports.ref(null);
    const isModeCode = vueExports.ref(false);
    const dynamicLogs = vueExports.ref([]);
    const codeLines = [
      { class: "code-k", content: "&lt;?php" },
      { class: "", content: '<span class="code-k">namespace</span> App\\Infrastructure\\Network;' },
      { class: "", content: "" },
      { class: "", content: '<span class="code-k">class</span> <span class="code-v">LoadBalancer</span> {' },
      { class: "", content: '&nbsp;&nbsp;&nbsp;&nbsp;<span class="code-k">private</span> <span class="code-v">$nodes</span> = [];' }
    ];
    const showNotif = vueExports.ref(false);
    const unreadCount = vueExports.ref(0);
    const notifs = vueExports.ref([]);
    const notifLoading = vueExports.ref(false);
    vueExports.watch(showNotif, (val) => {
    });
    vueExports.ref(parseInt(String(route.query.p || 0)));
    vueExports.ref(false);
    vueExports.ref(null);
    const loaderText = vueExports.ref("\u52A0\u8F7D\u4E2D...");
    const fromPath = vueExports.computed(() => route.fullPath || "/all");
    const saveLastViewed = (code) => sessionStorage.setItem("v2_last_code", code);
    useHead({ title: "V2EX Reader" });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_LoginBox = __nuxt_component_0;
      const _component_NuxtLink = __nuxt_component_0$1;
      _push(`<div${serverRenderer_cjs_prodExports.ssrRenderAttrs(vueExports.mergeProps({ class: "page-container" }, _attrs))} data-v-0e5999e2>`);
      if (vueExports.unref(needLogin)) {
        _push(serverRenderer_cjs_prodExports.ssrRenderComponent(_component_LoginBox, { from: vueExports.unref(fromPath) }, null, _parent));
      } else {
        _push(`<!--[-->`);
        if (vueExports.unref(isModeCode)) {
          _push(`<div id="codeMode" data-v-0e5999e2><div class="code-header" data-v-0e5999e2>Infrastructure/Network/LoadBalancer.php</div><!--[-->`);
          serverRenderer_cjs_prodExports.ssrRenderList(codeLines, (line, index) => {
            var _a;
            _push(`<div data-v-0e5999e2><span class="code-ln" data-v-0e5999e2>${serverRenderer_cjs_prodExports.ssrInterpolate(index + 1)}</span><span class="${serverRenderer_cjs_prodExports.ssrRenderClass(line.class)}" data-v-0e5999e2>${(_a = line.content) != null ? _a : ""}</span></div>`);
          });
          _push(`<!--]--><!--[-->`);
          serverRenderer_cjs_prodExports.ssrRenderList(vueExports.unref(dynamicLogs), (log, idx) => {
            _push(`<div data-v-0e5999e2><span class="code-ln" data-v-0e5999e2>${serverRenderer_cjs_prodExports.ssrInterpolate(codeLines.length + idx + 1)}</span><span class="code-c" data-v-0e5999e2>${serverRenderer_cjs_prodExports.ssrInterpolate(log)}</span></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div id="mainContent" style="${serverRenderer_cjs_prodExports.ssrRenderStyle(!vueExports.unref(isModeCode) ? null : { display: "none" })}" data-v-0e5999e2><div class="fab-group" data-v-0e5999e2><div class="fab" style="${serverRenderer_cjs_prodExports.ssrRenderStyle({ "position": "relative" })}" title="\u6D88\u606F\u63D0\u9192" data-v-0e5999e2><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-0e5999e2><path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" data-v-0e5999e2></path><path d="M8 12h.01" data-v-0e5999e2></path><path d="M12 12h.01" data-v-0e5999e2></path><path d="M16 12h.01" data-v-0e5999e2></path></svg>`);
        if (vueExports.unref(unreadCount) > 0) {
          _push(`<div class="badge" data-v-0e5999e2>${serverRenderer_cjs_prodExports.ssrInterpolate(vueExports.unref(unreadCount) > 99 ? "99+" : vueExports.unref(unreadCount))}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="fab" data-v-0e5999e2><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-0e5999e2><path d="m18 15-6-6-6 6" data-v-0e5999e2></path></svg></div><div class="${serverRenderer_cjs_prodExports.ssrRenderClass([{ "loading-rotate": vueExports.unref(loading) }, "fab"])}" data-v-0e5999e2><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-0e5999e2><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" data-v-0e5999e2></path><path d="M3 3v5h5" data-v-0e5999e2></path><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" data-v-0e5999e2></path><path d="M16 16h5v5" data-v-0e5999e2></path></svg></div></div><div id="list" data-v-0e5999e2>`);
        if (vueExports.unref(loading) && !vueExports.unref(items).length) {
          _push(`<div class="list-skeleton" data-v-0e5999e2><!--[-->`);
          serverRenderer_cjs_prodExports.ssrRenderList(5, (i) => {
            _push(`<div class="${serverRenderer_cjs_prodExports.ssrRenderClass(["skeleton-line", `w-${40 + i * 10}`])}" data-v-0e5999e2></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--[-->`);
        serverRenderer_cjs_prodExports.ssrRenderList(vueExports.unref(items), (item) => {
          _push(`<div${serverRenderer_cjs_prodExports.ssrRenderAttr("id", `item_${item.code}`)} class="${serverRenderer_cjs_prodExports.ssrRenderClass([{ "flash-highlight": vueExports.unref(lastViewedCode) === item.code }, "item"])}" data-v-0e5999e2>`);
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
          _push(`<div class="meta" data-v-0e5999e2>@${serverRenderer_cjs_prodExports.ssrInterpolate(item.author)} \u2022 ${serverRenderer_cjs_prodExports.ssrInterpolate(item.time)} \u2022 ${serverRenderer_cjs_prodExports.ssrInterpolate(item.replies)}\u56DE\u590D</div></div>`);
        });
        _push(`<!--]--></div><div id="loader" class="loader-text" data-v-0e5999e2>`);
        if (vueExports.unref(items).length) {
          _push(`<!--[-->${serverRenderer_cjs_prodExports.ssrInterpolate(vueExports.unref(loaderText))}<!--]-->`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><div id="notifOverlay" class="${serverRenderer_cjs_prodExports.ssrRenderClass({ open: vueExports.unref(showNotif) })}" data-v-0e5999e2></div><div id="notifModal" class="${serverRenderer_cjs_prodExports.ssrRenderClass({ open: vueExports.unref(showNotif) })}" data-v-0e5999e2><div class="notif-header" data-v-0e5999e2><h3 data-v-0e5999e2>\u6700\u65B0\u63D0\u9192</h3><button class="close-btn" aria-label="\u5173\u95ED" data-v-0e5999e2>\xD7</button></div>`);
        if (vueExports.unref(notifLoading)) {
          _push(`<div class="notif-state" data-v-0e5999e2><p data-v-0e5999e2>\u6B63\u5728\u83B7\u53D6\u6D88\u606F...</p></div>`);
        } else if (vueExports.unref(notifs).length === 0) {
          _push(`<div class="notif-state" data-v-0e5999e2><p data-v-0e5999e2>\u6682\u65E0\u65B0\u6D88\u606F</p></div>`);
        } else {
          _push(`<div class="notif-list" data-v-0e5999e2><!--[-->`);
          serverRenderer_cjs_prodExports.ssrRenderList(vueExports.unref(notifs), (n) => {
            var _a;
            _push(`<div class="notif-item" data-v-0e5999e2><div class="notif-body" data-v-0e5999e2><div class="notif-title" data-v-0e5999e2>${serverRenderer_cjs_prodExports.ssrInterpolate(n.desc)}</div><div class="notif-meta" data-v-0e5999e2><span class="time" data-v-0e5999e2>${serverRenderer_cjs_prodExports.ssrInterpolate(n.time)}</span></div>`);
            if (n.payload) {
              _push(`<div class="notif-payload" data-v-0e5999e2>${(_a = n.payload) != null ? _a : ""}</div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div><div class="notif-arrow" data-v-0e5999e2><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-v-0e5999e2><path d="m9 18 6-6-6-6" data-v-0e5999e2></path></svg></div></div>`);
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
const all = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-0e5999e2"]]);

export { all as default };
//# sourceMappingURL=all-DJlPLwhN.mjs.map
