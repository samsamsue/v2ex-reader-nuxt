import { v as vueExports, s as serverRenderer_cjs_prodExports } from './server.mjs';

const _sfc_main = /* @__PURE__ */ vueExports.defineComponent({
  ...{ name: "CommentTree" },
  __name: "CommentTree",
  __ssrInlineRender: true,
  props: {
    nodes: {},
    opAuthor: {},
    level: {}
  },
  setup(__props) {
    const props = __props;
    const level = vueExports.computed(() => props.level || 0);
    const nodeStyle = (node) => {
      return level.value === 0 ? "padding: 18px 0; border-bottom: 1px solid var(--border);" : "padding-top: 12px; padding-left: 1.2rem; border-left: 1.5px solid var(--border);";
    };
    const decorateText = (html) => {
      if (!html) return "";
      return html.replace(/(^|[^"'\w&;])#(\d+)\b/g, '$1<a onclick="jumpToFloor(event, $2)" style="cursor:pointer;" title="\u70B9\u51FB\u8DF3\u8F6C\u5230 $2 \u697C">#$2</a>');
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_CommentTree = _sfc_main;
      _push(`<div${serverRenderer_cjs_prodExports.ssrRenderAttrs(_attrs)}><!--[-->`);
      serverRenderer_cjs_prodExports.ssrRenderList(__props.nodes, (node) => {
        var _a;
        _push(`<div class="comment-item"${serverRenderer_cjs_prodExports.ssrRenderAttr("id", `c_${node.id}`)} style="${serverRenderer_cjs_prodExports.ssrRenderStyle(nodeStyle())}"><div class="comment-bar"><b style="${serverRenderer_cjs_prodExports.ssrRenderStyle({ "color": "var(--author)" })}">${serverRenderer_cjs_prodExports.ssrInterpolate(node.author)}</b>`);
        if (node.author === __props.opAuthor) {
          _push(`<span class="op-tag">OP</span>`);
        } else {
          _push(`<!---->`);
        }
        if (node.replyAuthor) {
          _push(`<!--[--><svg style="${serverRenderer_cjs_prodExports.ssrRenderStyle({ "width": "14px", "height": "14px", "margin": "0 0.5rem", "vertical-align": "middle" })}" width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 12L32 24L20 36V12Z" fill="#333" stroke="#333" stroke-width="3" stroke-linejoin="round"></path></svg><span class="reply-author">@${serverRenderer_cjs_prodExports.ssrInterpolate(node.replyAuthor)}</span><!--]-->`);
        } else {
          _push(`<!---->`);
        }
        _push(`<span style="${serverRenderer_cjs_prodExports.ssrRenderStyle({ "margin-left": "6px", "opacity": "0.6" })}">${serverRenderer_cjs_prodExports.ssrInterpolate(node.time)}</span>`);
        if (node.likes > 0) {
          _push(`<span style="${serverRenderer_cjs_prodExports.ssrRenderStyle({ "display": "inline-flex", "align-items": "center", "margin-left": "8px", "color": "#ff2c55", "font-weight": "bold" })}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="${serverRenderer_cjs_prodExports.ssrRenderStyle({ "width": "12px", "height": "12px", "color": "#ff2c55", "vertical-align": "middle", "margin-right": "2px" })}"><path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z"></path></svg> ${serverRenderer_cjs_prodExports.ssrInterpolate(node.likes)}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<span style="${serverRenderer_cjs_prodExports.ssrRenderStyle({ "margin-left": "6px", "opacity": "0.4" })}">#${serverRenderer_cjs_prodExports.ssrInterpolate(node.id)}</span></div><div class="reply-txt">${(_a = decorateText(node.replyHtml)) != null ? _a : ""}</div>`);
        if (node.children && node.children.length) {
          _push(serverRenderer_cjs_prodExports.ssrRenderComponent(_component_CommentTree, {
            nodes: node.children,
            opAuthor: __props.opAuthor,
            level: vueExports.unref(level) + 1
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      });
      _push(`<!--]--></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = vueExports.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/CommentTree.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=CommentTree-D5k_3yTi.mjs.map
