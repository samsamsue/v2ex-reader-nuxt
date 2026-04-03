import { _ as _export_sfc, v as vueExports, s as serverRenderer_cjs_prodExports } from './server.mjs';

const _sfc_main = /* @__PURE__ */ vueExports.defineComponent({
  __name: "LoginBox",
  __ssrInlineRender: true,
  props: {
    from: {}
  },
  setup(__props) {
    const password = vueExports.ref("");
    const error = vueExports.ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${serverRenderer_cjs_prodExports.ssrRenderAttrs(vueExports.mergeProps({ class: "login-wrap" }, _attrs))} data-v-46c615b8><div class="box" data-v-46c615b8><h2 data-v-46c615b8>V2EX Reader</h2><form data-v-46c615b8><input${serverRenderer_cjs_prodExports.ssrRenderAttr("value", vueExports.unref(password))} type="password" placeholder="\u8BF7\u8F93\u5165\u8BBF\u95EE\u5BC6\u94A5" autofocus required data-v-46c615b8>`);
      if (vueExports.unref(error)) {
        _push(`<p class="err" data-v-46c615b8>\u5BC6\u94A5\u9519\u8BEF</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button type="submit" data-v-46c615b8>\u786E\u8BA4</button></form></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = vueExports.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/LoginBox.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-46c615b8"]]);

export { __nuxt_component_0 as _ };
//# sourceMappingURL=LoginBox-LsaNkmC7.mjs.map
