import { v as vueExports, s as serverRenderer_cjs_prodExports } from "../server.mjs";
import { u as useHead } from "./v3-Hl9gcLEc.js";
import "@babel/parser";
import "C:/Users/Administrator/Documents/XCode/v2/node_modules/.store/ofetch@1.5.1/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "C:/Users/Administrator/Documents/XCode/v2/node_modules/.store/hookable@5.5.3/node_modules/hookable/dist/index.mjs";
import "C:/Users/Administrator/Documents/XCode/v2/node_modules/.store/unctx@2.5.0/node_modules/unctx/dist/index.mjs";
import "C:/Users/Administrator/Documents/XCode/v2/node_modules/.store/h3@1.15.11/node_modules/h3/dist/index.mjs";
import "C:/Users/Administrator/Documents/XCode/v2/node_modules/.store/defu@6.1.6/node_modules/defu/dist/defu.mjs";
import "C:/Users/Administrator/Documents/XCode/v2/node_modules/.store/ufo@1.6.3/node_modules/ufo/dist/index.mjs";
import "node:stream";
import "C:/Users/Administrator/Documents/XCode/v2/node_modules/.store/@unhead+vue@2.1.12/node_modules/@unhead/vue/dist/index.mjs";
const codeModeHtml = `
<div id="codeMode">
  <div style="margin-bottom:15px; color:var(--code-k); border-bottom:1px solid var(--border); padding-bottom:5px; font-weight:bold;">Infrastructure/Network/LoadBalancer.php</div>
  <div><span class="code-ln">1</span><span class="code-k">&lt;?php</span></div>
  <div><span class="code-ln">2</span><span class="code-k">namespace</span> App\\Infrastructure\\Network;</div>
  <div><span class="code-ln">3</span></div>
  <div><span class="code-ln">4</span><span class="code-k">class</span> <span class="code-v">LoadBalancer</span> {</div>
  <div><span class="code-ln">5</span>    <span class="code-k">private</span> <span class="code-v">$nodes</span> = [];</div>
  <div><span class="code-ln">6</span>    <span class="code-k">private</span> <span class="code-v">$healthyNodes</span> = [];</div>
  <div><span class="code-ln">7</span></div>
  <div><span class="code-ln">8</span>    <span class="code-k">public function</span> <span class="code-v">__construct</span>(<span class="code-k">array</span> <span class="code-v">$config</span>) {</div>
  <div><span class="code-ln">9</span>        <span class="code-v">$this</span>-><span class="code-v">nodes</span> = <span class="code-v">$config</span>[<span class="code-s">'cluster_endpoints'</span>];</div>
  <div><span class="code-ln">10</span>        <span class="code-v">$this</span>-><span class="code-v">checkHealth</span>();</div>
  <div><span class="code-ln">11</span>    }</div>
  <div><span class="code-ln">12</span></div>
  <div><span class="code-ln">13</span>    <span class="code-k">private function</span> <span class="code-v">checkHealth</span>() {</div>
  <div><span class="code-ln">14</span>        <span class="code-k">foreach</span> (<span class="code-v">$this</span>-><span class="code-v">nodes</span> <span class="code-k">as</span> <span class="code-v">$node</span>) {</div>
  <div><span class="code-ln">15</span>            <span class="code-v">$status</span> = <span class="code-v">curl_init</span>(<span class="code-v">$node</span> . <span class="code-s">'/health'</span>);</div>
  <div><span class="code-ln">16</span>            <span class="code-k">if</span> (<span class="code-v">curl_exec</span>(<span class="code-v">$status</span>)) {</div>
  <div><span class="code-ln">17</span>                <span class="code-v">$this</span>-><span class="code-v">healthyNodes</span>[] = <span class="code-v">$node</span>;</div>
  <div><span class="code-ln">18</span>            }</div>
  <div><span class="code-ln">19</span>        }</div>
  <div><span class="code-ln">20</span>    }</div>
  <div><span class="code-ln">21</span></div>
  <div><span class="code-ln">22</span>    <span class="code-k">public function</span> <span class="code-v">getNextNode</span>() {</div>
  <div><span class="code-ln">23</span>        <span class="code-k">return</span> <span class="code-v">$this</span>-><span class="code-v">healthyNodes</span>[<span class="code-v">array_rand</span>(<span class="code-v">$this</span>-><span class="code-v">healthyNodes</span>)];</div>
  <div><span class="code-ln">24</span>    }</div>
  <div><span class="code-ln">25</span>}</div>
  <div><span class="code-ln">26</span></div>
  <div><span class="code-ln">27</span><span class="code-c">// --- Node.js Event Loop Monitor ---</span></div>
  <div><span class="code-ln">28</span><span class="code-k">const</span> <span class="code-v">os</span> = <span class="code-k">require</span>(<span class="code-s">'os'</span>);</div>
  <div><span class="code-ln">29</span><span class="code-k">const</span> <span class="code-v">v8</span> = <span class="code-k">require</span>(<span class="code-s">'v8'</span>);</div>
  <div><span class="code-ln">30</span></div>
  <div><span class="code-ln">31</span><span class="code-k">setInterval</span>(() => {</div>
  <div><span class="code-ln">32</span>    <span class="code-k">const</span> <span class="code-v">mem</span> = <span class="code-v">process</span>.<span class="code-v">memoryUsage</span>();</div>
  <div><span class="code-ln">33</span>    <span class="code-k">if</span> (<span class="code-v">mem</span>.heapUsed > <span class="code-v">mem</span>.heapTotal * <span class="code-v">0.8</span>) {</div>
  <div><span class="code-ln">34</span>        <span class="code-v">console</span>.<span class="code-v">warn</span>(<span class="code-s">'[GC_WARN] Heap usage near limit'</span>);</div>
  <div><span class="code-ln">35</span>        <span class="code-v">v8</span>.<span class="code-v">setFlagsFromString</span>(<span class="code-s">'--expose-gc'</span>);</div>
  <div><span class="code-ln">36</span>        <span class="code-k">global</span>.<span class="code-v">gc</span> && <span class="code-k">global</span>.<span class="code-v">gc</span>();</div>
  <div><span class="code-ln">37</span>    }</div>
  <div><span class="code-ln">38</span>}, <span class="code-v">10000</span>);</div>
  <div><span class="code-ln">39</span></div>
  <div><span class="code-ln">40</span><span class="code-k">function</span> <span class="code-v">syncStream</span>(<span class="code-v">buffer</span>) {</div>
  <div><span class="code-ln">41</span>    <span class="code-k">return</span> <span class="code-k">new</span> <span class="code-v">Promise</span>((<span class="code-v">resolve</span>) => {</div>
  <div><span class="code-ln">42</span>        <span class="code-v">setTimeout</span>(() => {</div>
  <div><span class="code-ln">43</span>            <span class="code-v">console</span>.<span class="code-v">log</span>(<span class="code-s">'Stream synced successfully'</span>);</div>
  <div><span class="code-ln">44</span>            <span class="code-v">resolve</span>(<span class="code-k">true</span>);</div>
  <div><span class="code-ln">45</span>        }, <span class="code-v">500</span>);</div>
  <div><span class="code-ln">46</span>    });</div>
  <div><span class="code-ln">47</span>}</div>
  <div><span class="code-ln">48</span></div>
  <div><span class="code-ln">49</span><span class="code-c">// INFO: Listening on port 8080</span></div>
  <div><span class="code-ln">50</span><span class="code-c">// LOG: Handshaking with internal node... OK</span></div>
  <div><span class="code-ln">51</span><span class="code-c">// [REPEATED LOG BLOCKS FOR SCROLL DEPTH]</span></div>
  <div><span class="code-ln">52</span><span class="code-c">// 2026-03-31 10:45:01 Processing packet 0xAB21</span></div>
  <div><span class="code-ln">53</span><span class="code-c">// 2026-03-31 10:45:02 Processing packet 0xAB22</span></div>
  <div><span class="code-ln">54</span><span class="code-c">// 2026-03-31 10:45:03 Processing packet 0xAB23</span></div>
  <div><span class="code-ln">55</span><span class="code-c">// ... (代码将持续滚动直至 150 行)</span></div>
  <div id="extraCode"></div>
</div>
`;
const _sfc_main = /* @__PURE__ */ vueExports.defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({ title: "V2EX Reader" });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${serverRenderer_cjs_prodExports.ssrRenderAttrs(_attrs)}><div>${codeModeHtml}</div><div id="jumpPrompt"><span>检测到链接</span><button id="jumpBtn">立即跳转</button></div><div id="mainContent" class="box"><h2>V2EX Reader</h2><div style="${serverRenderer_cjs_prodExports.ssrRenderStyle({ "display": "flex", "gap": "10px", "margin-bottom": "20px", "margin-top": "10px" })}"><input type="text" id="vUrl" placeholder="粘贴链接或直接输入数字ID" style="${serverRenderer_cjs_prodExports.ssrRenderStyle({ "flex": "1", "margin": "0" })}"><button onclick="manualJump()" style="${serverRenderer_cjs_prodExports.ssrRenderStyle({ "padding": "0 24px", "border": "none", "border-radius": "12px", "background": "#1d2129", "color": "#fff", "font-weight": "600", "cursor": "pointer", "white-space": "nowrap", "transition": "transform 0.1s" })}">跳转</button></div><button onclick="location.href=&#39;/all&#39;" style="${serverRenderer_cjs_prodExports.ssrRenderStyle({ "width": "100%", "padding": "14px", "border": "none", "border-radius": "12px", "background": "var(--border)", "color": "var(--text)", "font-weight": "600", "cursor": "pointer" })}">查看全部列表</button></div></div>`);
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
//# sourceMappingURL=index-BS7JX5Lj.js.map
