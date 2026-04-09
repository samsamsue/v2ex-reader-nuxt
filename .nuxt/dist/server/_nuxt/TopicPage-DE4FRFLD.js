import { _ as __nuxt_component_0 } from "./LoginBox-LsaNkmC7.js";
import { _ as __nuxt_component_0$1 } from "./nuxt-link-JLW_B2l9.js";
import { v as vueExports, s as serverRenderer_cjs_prodExports } from "../server.mjs";
import "qrcode";
import { u as useHead } from "./v3-Hl9gcLEc.js";
import "C:/Users/Administrator/Documents/XCode/v2/node_modules/.store/hookable@5.5.3/node_modules/hookable/dist/index.mjs";
const _sfc_main$1 = /* @__PURE__ */ vueExports.defineComponent({
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
      return html.replace(/(^|[^"'\w&;])#(\d+)\b/g, '$1<a onclick="jumpToFloor(event, $2)" style="cursor:pointer;" title="点击跳转到 $2 楼">#$2</a>');
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_CommentTree = _sfc_main$1;
      _push(`<div${serverRenderer_cjs_prodExports.ssrRenderAttrs(_attrs)}><!--[-->`);
      serverRenderer_cjs_prodExports.ssrRenderList(__props.nodes, (node) => {
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
        _push(`<span style="${serverRenderer_cjs_prodExports.ssrRenderStyle({ "margin-left": "6px", "opacity": "0.4" })}">#${serverRenderer_cjs_prodExports.ssrInterpolate(node.id)}</span></div><div class="reply-txt">${decorateText(node.replyHtml) ?? ""}</div>`);
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
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = vueExports.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/CommentTree.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const SCROLL_KEY = "v2_floor_pos";
const _sfc_main = /* @__PURE__ */ vueExports.defineComponent({
  __name: "TopicPage",
  __ssrInlineRender: true,
  props: {
    code: {},
    salt: {},
    topicApiBase: {},
    repliesApiBase: {},
    requireAuth: { type: Boolean, default: false },
    fromPath: { default: "/all" },
    showQr: { type: Boolean, default: false },
    shareSalt: { default: void 0 },
    showShareLink: { type: Boolean, default: false },
    showBack: { type: Boolean, default: false },
    backTo: { default: "/all" },
    showOpenOriginal: { type: Boolean, default: false },
    pageTitle: { default: "V2EX Reader" },
    pollBase: {},
    compactTitle: { type: Boolean, default: false }
  },
  setup(__props) {
    const props = __props;
    useHead({ title: props.pageTitle });
    const needLogin = vueExports.ref(false);
    const loadingTopic = vueExports.ref(true);
    const loadingReplies = vueExports.ref(true);
    const topicTitle = vueExports.ref("");
    const topicContent = vueExports.ref("");
    const opAuthor = vueExports.ref(null);
    const replies = vueExports.ref([]);
    const total = vueExports.ref(0);
    const allIds = vueExports.ref([]);
    const notifyVisible = vueExports.ref(false);
    const historyFloor = vueExports.ref(null);
    const showHistoryPrompt = vueExports.ref(false);
    const qrVisible = vueExports.ref(false);
    const qrDataUrl = vueExports.ref("");
    const isModeCode = vueExports.ref(false);
    const extraCodeHtml = vueExports.ref("");
    const codeParam = vueExports.computed(() => props.code || "");
    const rawId = vueExports.computed(() => {
      try {
        return parseInt(codeParam.value, 36) ^ props.salt;
      } catch {
        return 0;
      }
    });
    const shareUrl = vueExports.computed(() => {
      if (!props.shareSalt) return "";
      const raw = rawId.value || 0;
      const code = (raw ^ props.shareSalt).toString(36);
      return `/s/${code}`;
    });
    const topicReady = vueExports.computed(() => !!topicContent.value || !loadingTopic.value);
    const repliesReady = vueExports.computed(() => replies.value.length > 0 || total.value > 0 || !loadingReplies.value);
    const getFloor = (id) => {
      if (!id) return null;
      const data = JSON.parse(localStorage.getItem(SCROLL_KEY) || "{}");
      return data[id] ? data[id].f : null;
    };
    const checkHistory = () => {
      const saved = getFloor(codeParam.value);
      if (saved) {
        historyFloor.value = saved;
        showHistoryPrompt.value = true;
      }
    };
    const fetchTopic = async () => {
      loadingTopic.value = true;
      try {
        const res = await $fetch(`${props.topicApiBase}/${rawId.value}`, { query: { _t: Date.now() } });
        if (props.requireAuth && res?.error === "AUTH") {
          needLogin.value = true;
          return;
        }
        if (res?.title) {
          topicTitle.value = res.title;
          topicContent.value = res.content || res.contentHtml || "";
        }
      } catch {
      } finally {
        loadingTopic.value = false;
      }
    };
    const fetchReplies = async (silent = false) => {
      if (!silent) loadingReplies.value = true;
      let hasNewReplies = false;
      try {
        const res = await $fetch(`${props.repliesApiBase}/${rawId.value}`, { query: { _t: Date.now() } });
        if (props.requireAuth && res?.error === "AUTH") {
          needLogin.value = true;
          return false;
        }
        const prevIds = allIds.value.slice();
        replies.value = res?.replies || [];
        opAuthor.value = res?.opAuthor || null;
        total.value = res?.total || 0;
        allIds.value = res?.allIds || [];
        if (silent && prevIds.length) {
          const newIds = allIds.value.filter((id) => !prevIds.includes(id));
          if (newIds.length > 0) {
            hasNewReplies = true;
            vueExports.nextTick(() => {
              const firstNewEl = (void 0).getElementById("c_" + newIds[0]);
              if (firstNewEl) {
                (void 0).scrollTo({ top: firstNewEl.offsetTop - 80, behavior: "smooth" });
              }
              newIds.forEach((id) => {
                const el = (void 0).getElementById("c_" + id);
                if (el) {
                  el.classList.remove("flash-highlight");
                  void el.offsetWidth;
                  el.classList.add("flash-highlight");
                }
              });
            });
          }
        }
      } catch {
      } finally {
        if (!silent) loadingReplies.value = false;
      }
      return hasNewReplies;
    };
    vueExports.watch(() => rawId.value, async (next, prev) => {
      if (!next || next === prev) return;
      loadingTopic.value = true;
      loadingReplies.value = true;
      await Promise.allSettled([fetchTopic(), fetchReplies()]);
      checkHistory();
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_LoginBox = __nuxt_component_0;
      const _component_NuxtLink = __nuxt_component_0$1;
      const _component_CommentTree = _sfc_main$1;
      _push(`<div${serverRenderer_cjs_prodExports.ssrRenderAttrs(_attrs)}>`);
      if (__props.requireAuth && needLogin.value) {
        _push(serverRenderer_cjs_prodExports.ssrRenderComponent(_component_LoginBox, { from: __props.fromPath }, null, _parent));
      } else {
        _push(`<!--[--><div id="codeMode" style="${serverRenderer_cjs_prodExports.ssrRenderStyle(isModeCode.value ? null : { display: "none" })}"><div style="${serverRenderer_cjs_prodExports.ssrRenderStyle({ "margin-bottom": "15px", "color": "var(--code-k)", "border-bottom": "1px solid var(--border)", "padding-bottom": "5px", "font-weight": "bold" })}">Infrastructure/Network/LoadBalancer.php</div><div><span class="code-ln">1</span><span class="code-k">&lt;?php</span></div><div><span class="code-ln">2</span><span class="code-k">namespace</span> App\\Infrastructure\\Network;</div><div><span class="code-ln">3</span></div><div><span class="code-ln">4</span><span class="code-k">class</span> <span class="code-v">LoadBalancer</span> {</div><div><span class="code-ln">5</span> <span class="code-k">private</span> <span class="code-v">$nodes</span> = [];</div><div><span class="code-ln">6</span> <span class="code-k">private</span> <span class="code-v">$healthyNodes</span> = [];</div><div><span class="code-ln">7</span></div><div><span class="code-ln">8</span> <span class="code-k">public function</span> <span class="code-v">__construct</span>(<span class="code-k">array</span> <span class="code-v">$config</span>) {</div><div><span class="code-ln">9</span> <span class="code-v">$this</span>-&gt;<span class="code-v">nodes</span> = <span class="code-v">$config</span>[<span class="code-s">&#39;cluster_endpoints&#39;</span>];</div><div><span class="code-ln">10</span> <span class="code-v">$this</span>-&gt;<span class="code-v">checkHealth</span>();</div><div><span class="code-ln">11</span> }</div><div><span class="code-ln">12</span></div><div><span class="code-ln">13</span> <span class="code-k">private function</span> <span class="code-v">checkHealth</span>() {</div><div><span class="code-ln">14</span> <span class="code-k">foreach</span> (<span class="code-v">$this</span>-&gt;<span class="code-v">nodes</span> <span class="code-k">as</span> <span class="code-v">$node</span>) {</div><div><span class="code-ln">15</span> <span class="code-v">$status</span> = <span class="code-v">curl_init</span>(<span class="code-v">$node</span> . <span class="code-s">&#39;/health&#39;</span>);</div><div><span class="code-ln">16</span> <span class="code-k">if</span> (<span class="code-v">curl_exec</span>(<span class="code-v">$status</span>)) {</div><div><span class="code-ln">17</span> <span class="code-v">$this</span>-&gt;<span class="code-v">healthyNodes</span>[] = <span class="code-v">$node</span>;</div><div><span class="code-ln">18</span> }</div><div><span class="code-ln">19</span> }</div><div><span class="code-ln">20</span> }</div><div><span class="code-ln">21</span></div><div><span class="code-ln">22</span> <span class="code-k">public function</span> <span class="code-v">getNextNode</span>() {</div><div><span class="code-ln">23</span> <span class="code-k">return</span> <span class="code-v">$this</span>-&gt;<span class="code-v">healthyNodes</span>[<span class="code-v">array_rand</span>(<span class="code-v">$this</span>-&gt;<span class="code-v">healthyNodes</span>)];</div><div><span class="code-ln">24</span> }</div><div><span class="code-ln">25</span>}</div><div><span class="code-ln">26</span></div><div><span class="code-ln">27</span><span class="code-c">// --- Node.js Event Loop Monitor ---</span></div><div><span class="code-ln">28</span><span class="code-k">const</span> <span class="code-v">os</span> = <span class="code-k">require</span>(<span class="code-s">&#39;os&#39;</span>);</div><div><span class="code-ln">29</span><span class="code-k">const</span> <span class="code-v">v8</span> = <span class="code-k">require</span>(<span class="code-s">&#39;v8&#39;</span>);</div><div><span class="code-ln">30</span></div><div><span class="code-ln">31</span><span class="code-k">setInterval</span>(() =&gt; {</div><div><span class="code-ln">32</span> <span class="code-k">const</span> <span class="code-v">mem</span> = <span class="code-v">process</span>.<span class="code-v">memoryUsage</span>();</div><div><span class="code-ln">33</span> <span class="code-k">if</span> (<span class="code-v">mem</span>.heapUsed &gt; <span class="code-v">mem</span>.heapTotal * <span class="code-v">0.8</span>) {</div><div><span class="code-ln">34</span> <span class="code-v">console</span>.<span class="code-v">warn</span>(<span class="code-s">&#39;[GC_WARN] Heap usage near limit&#39;</span>);</div><div><span class="code-ln">35</span> <span class="code-v">v8</span>.<span class="code-v">setFlagsFromString</span>(<span class="code-s">&#39;--expose-gc&#39;</span>);</div><div><span class="code-ln">36</span> <span class="code-k">global</span>.<span class="code-v">gc</span> &amp;&amp; <span class="code-k">global</span>.<span class="code-v">gc</span>();</div><div><span class="code-ln">37</span> }</div><div><span class="code-ln">38</span>}, <span class="code-v">10000</span>);</div><div><span class="code-ln">39</span></div><div><span class="code-ln">40</span><span class="code-k">function</span> <span class="code-v">syncStream</span>(<span class="code-v">buffer</span>) {</div><div><span class="code-ln">41</span> <span class="code-k">return</span> <span class="code-k">new</span> <span class="code-v">Promise</span>((<span class="code-v">resolve</span>) =&gt; {</div><div><span class="code-ln">42</span> <span class="code-v">setTimeout</span>(() =&gt; {</div><div><span class="code-ln">43</span> <span class="code-v">console</span>.<span class="code-v">log</span>(<span class="code-s">&#39;Stream synced successfully&#39;</span>);</div><div><span class="code-ln">44</span> <span class="code-v">resolve</span>(<span class="code-k">true</span>);</div><div><span class="code-ln">45</span> }, <span class="code-v">500</span>);</div><div><span class="code-ln">46</span> });</div><div><span class="code-ln">47</span>}</div><div><span class="code-ln">48</span></div><div><span class="code-ln">49</span><span class="code-c">// INFO: Listening on port 8080</span></div><div><span class="code-ln">50</span><span class="code-c">// LOG: Handshaking with internal node... OK</span></div><div><span class="code-ln">51</span><span class="code-c">// [REPEATED LOG BLOCKS FOR SCROLL DEPTH]</span></div><div><span class="code-ln">52</span><span class="code-c">// 2026-03-31 10:45:01 Processing packet 0xAB21</span></div><div><span class="code-ln">53</span><span class="code-c">// 2026-03-31 10:45:02 Processing packet 0xAB22</span></div><div><span class="code-ln">54</span><span class="code-c">// 2026-03-31 10:45:03 Processing packet 0xAB23</span></div><div><span class="code-ln">55</span><span class="code-c">// ... (代码将持续滚动直至 150 行)</span></div><div id="extraCode">${extraCodeHtml.value ?? ""}</div></div><div id="mainContent" style="${serverRenderer_cjs_prodExports.ssrRenderStyle(!isModeCode.value ? null : { display: "none" })}"><div id="newMsgNotify" class="${serverRenderer_cjs_prodExports.ssrRenderClass({ show: notifyVisible.value })}">`);
        if (loadingReplies.value) {
          _push(`<svg class="loading-rotate" style="${serverRenderer_cjs_prodExports.ssrRenderStyle({ "width": "1rem", "height": "1rem" })}" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path><path d="M16 16h5v5"></path></svg>`);
        } else {
          _push(`<!---->`);
        }
        _push(` 检测到新回复 </div>`);
        if (showHistoryPrompt.value && historyFloor.value && replies.value.length) {
          _push(`<div id="historyPrompt"><span>上次看到 <b>#${serverRenderer_cjs_prodExports.ssrInterpolate(historyFloor.value)}</b> 楼</span><button>去这里</button><span class="close">×</span></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="fab-group">`);
        if (__props.showQr) {
          _push(`<div id="qrBtn" class="fab" title="获取分享二维码"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="5" height="5" x="3" y="3" rx="1"></rect><rect width="5" height="5" x="16" y="3" rx="1"></rect><rect width="5" height="5" x="3" y="16" rx="1"></rect><path d="M21 16h-3a2 2 0 0 0-2 2v3"></path><path d="M12 7v3a2 2 0 0 1-2 2H7"></path><path d="M12 21v-1"></path></svg></div>`);
        } else {
          _push(`<!---->`);
        }
        if (__props.showQr) {
          _push(`<div id="qrPopup" style="${serverRenderer_cjs_prodExports.ssrRenderStyle(qrVisible.value ? null : { display: "none" })}">`);
          if (qrDataUrl.value) {
            _push(`<img${serverRenderer_cjs_prodExports.ssrRenderAttr("src", qrDataUrl.value)} alt="QR" width="140" height="140">`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        if (__props.showOpenOriginal) {
          _push(`<div class="fab" title="在 V2EX 原站打开"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m10 16 4-4-4-4"></path><path d="M3 12h11"></path><path d="M3 8V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3"></path></svg></div>`);
        } else {
          _push(`<!---->`);
        }
        if (__props.showBack) {
          _push(`<div id="backBtn" class="fab"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"></path></svg></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="fab"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"></path></svg></div><div id="reBtn" class="${serverRenderer_cjs_prodExports.ssrRenderClass([{ "loading-rotate": loadingReplies.value }, "fab"])}"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path><path d="M16 16h5v5"></path></svg></div></div><h1 class="${serverRenderer_cjs_prodExports.ssrRenderClass(__props.compactTitle ? "content-title" : "")}">${serverRenderer_cjs_prodExports.ssrInterpolate(topicTitle.value || " ")}</h1>`);
        if (topicReady.value) {
          _push(`<div class="content">${topicContent.value ?? ""}</div>`);
        } else if (loadingTopic.value && !topicContent.value) {
          _push(`<div class="content skeleton-block"><div class="skeleton-line w-90"></div><div class="skeleton-line w-80"></div><div class="skeleton-line w-60"></div><div class="skeleton-line w-85"></div><div class="skeleton-line w-70"></div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (__props.showShareLink && shareUrl.value && !loadingTopic.value) {
          _push(serverRenderer_cjs_prodExports.ssrRenderComponent(_component_NuxtLink, {
            to: shareUrl.value,
            class: "end-link"
          }, {
            default: vueExports.withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`—— END ——`);
              } else {
                return [
                  vueExports.createTextVNode("—— END ——")
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        if (repliesReady.value && total.value > 0) {
          _push(`<div class="comments"><div class="comments-title">讨论 (<span id="count">${serverRenderer_cjs_prodExports.ssrInterpolate(total.value)}</span>)</div><div id="comments">`);
          _push(serverRenderer_cjs_prodExports.ssrRenderComponent(_component_CommentTree, {
            nodes: replies.value,
            opAuthor: opAuthor.value
          }, null, _parent));
          _push(`</div></div>`);
        } else {
          _push(`<!---->`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/TopicPage.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as _
};
//# sourceMappingURL=TopicPage-DE4FRFLD.js.map
