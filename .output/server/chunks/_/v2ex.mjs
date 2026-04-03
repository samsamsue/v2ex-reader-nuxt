import require$$1 from 'crypto';
import { ProxyAgent } from 'undici';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

function loadEnvFile() {
  try {
    const p = resolve(process.cwd(), ".env");
    if (!existsSync(p)) return;
    const raw = readFileSync(p, "utf8");
    raw.split(/\r?\n/).forEach((line) => {
      if (!line || line.trim().startsWith("#")) return;
      const idx = line.indexOf("=");
      if (idx === -1) return;
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim();
      if (key && !process.env[key]) process.env[key] = val;
    });
  } catch {
  }
}
loadEnvFile();
const SALT = 987654;
const ENV = {
  V2_COOKIE: process.env.V2_COOKIE || ""
};
const PROXY_URL = process.env.HTTP_PROXY || process.env.HTTPS_PROXY || "";
const PROXY_AGENT = PROXY_URL ? new ProxyAgent(PROXY_URL) : null;
if (!PROXY_URL) {
  console.warn("[V2EX] No HTTP_PROXY/HTTPS_PROXY found in env; requests will go direct.");
} else {
  console.log(`[V2EX] Proxy enabled -> ${PROXY_URL}`);
}
const ADMIN_PASS = process.env.PASSWORD || "";
const COOKIE_NAME = "v2_auth_token";
const COOKIE_VALUE = ADMIN_PASS ? require$$1.createHash("sha256").update(ADMIN_PASS + SALT).digest("hex") : "no_pass_fallback";
const encodeId = (numId) => (parseInt(String(numId)) ^ SALT).toString(36);
const decodeId = (code) => {
  try {
    return parseInt(code, 36) ^ SALT;
  } catch {
    return null;
  }
};
const decodeShare = (code) => {
  try {
    return parseInt(code, 36) ^ 1234567;
  } catch {
    return null;
  }
};
async function safeFetch(url, env) {
  const resp = await fetch(url, {
    dispatcher: PROXY_AGENT || void 0,
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
      Referer: "https://www.v2ex.com/",
      Cookie: env.V2_COOKIE || "",
      "Cache-Control": "max-age=0"
    }
  });
  if (resp.status === 403) throw new Error("V2EX_FORBIDDEN_403");
  if (resp.status === 302 || resp.url.includes("/signin")) throw new Error("V2EX_COOKIE_EXPIRED");
  if (!resp.ok) throw new Error("V2EX_NET_ERROR_" + resp.status);
  return resp;
}
async function fetchAndParseList(url, env) {
  const resp = await safeFetch(url, env);
  const htmlStr = await resp.text();
  const items = [];
  const itemRegex = /<div class="cell item"[^>]*>([\s\S]*?)<\/table>\s*<\/div>/g;
  let match;
  while ((match = itemRegex.exec(htmlStr)) !== null) {
    const block = match[1];
    const titleMatch = block.match(/<span class="item_title">.*?<a href="\/t\/(\d+)[^>]*>([\s\S]*?)<\/a>/);
    const authMatch = block.match(/<a href="\/member\/([^"]+)">/);
    const repliesMatch = block.match(/class="count_livid"[^>]*>(\d+)<\/a>/);
    const timeMatch = block.match(/<span title="[^"]+">([^<]+)<\/span>/) || block.match(/•\s*([^•]+(?:前|分钟|小时|天|秒|Just now))/);
    if (titleMatch) {
      items.push({
        code: encodeId(titleMatch[1]),
        title: titleMatch[2].trim(),
        author: authMatch ? authMatch[1].trim() : "Anon",
        replies: repliesMatch ? repliesMatch[1] : "0",
        time: timeMatch ? timeMatch[1].trim() : "\u521A\u521A"
      });
    }
  }
  return { items, count: items.length };
}
async function fetchAndParsePostFull(targetUrl, env) {
  const firstResp = await safeFetch(targetUrl, env);
  const firstHtml = await firstResp.text();
  const title = (firstHtml.match(/<h1>(.*?)<\/h1>/) || ["", "\u65E0\u6807\u9898"])[1].replace(" - V2EX", "");
  let content = (firstHtml.match(/<div class="topic_content">([\s\S]*?)<\/div>/) || ["", ""])[1];
  const subtleBlocks = buildSubtleBlocks(firstHtml);
  if (subtleBlocks) content += subtleBlocks;
  if (!content) {
    content = '<div class="content-empty"><svg t="1775183815751" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1098" width="64" height="64"><path d="M811.7248 136.533333l6.9632 0.375467A68.266667 68.266667 0 0 1 879.991467 204.8v623.7184l-0.341334 6.9632a68.334933 68.334933 0 0 1-60.962133 60.928l-6.9632 0.375467H238.933333l-6.9632-0.375467a68.232533 68.232533 0 0 1-60.928-60.928L170.666667 828.5184V204.8a68.266667 68.266667 0 0 1 61.303466-67.8912L238.933333 136.533333h572.791467z m0 34.133334H238.933333a34.133333 34.133333 0 0 0-34.133333 34.133333v623.7184a34.133333 34.133333 0 0 0 34.133333 34.133333h572.791467a34.133333 34.133333 0 0 0 34.133333-34.133333V204.8c0-18.8416-15.291733-34.0992-34.133333-34.133333z m-167.697067 302.353066a17.066667 17.066667 0 0 1 0 34.133334h-292.078933a17.066667 17.066667 0 0 1 0-34.133334h292.078933z m-108.032-113.7664a17.066667 17.066667 0 0 1 0 34.133334h-184.046933a17.066667 17.066667 0 0 1 0-34.133334h184.046933z" p-id="1099" fill="#cccccc"></path></svg>Empty</div>';
  }
  const opAuthorMatch = firstHtml.match(/<small class="gray"><a href="\/member\/.*?">(.*?)<\/a>/);
  const opAuthor = opAuthorMatch ? opAuthorMatch[1] : null;
  let pagesHtml = [firstHtml];
  const pageMatches = firstHtml.match(/href="\/t\/\d+\?p=(\d+)"/g);
  if (pageMatches) {
    const maxPage = Math.max(...pageMatches.map((m) => parseInt(m.match(/p=(\d+)/)[1])));
    if (maxPage > 1) {
      const fetchers = [];
      for (let i = 2; i <= Math.min(maxPage, 3); i++) {
        fetchers.push(safeFetch(`${targetUrl}?p=${i}`, env).then((r) => r.text()));
      }
      pagesHtml = pagesHtml.concat(await Promise.all(fetchers));
    }
  }
  let userMap = {};
  let allReplies = [];
  let globalIdx = 1;
  pagesHtml.forEach((html) => {
    const blocks = html.substring(html.indexOf('<div id="replies"')).match(/<td width="auto" valign="top" align="left">.*?<\/td>/gs) || [];
    blocks.forEach((b) => {
      const auth = (b.match(/strong><a href="\/member\/.*?">(.*?)<\/a><\/strong>/) || ["", "Anon"])[1];
      const timeMatch = b.match(/class="ago" title=".*?">(.*?)<\/span>/);
      const contentBlock = (b.match(/<div class="reply_content">(.*?)<\/div>/s) || ["", ""])[1];
      const replyAuthor = (contentBlock.match(/<a href="\/member\/.*?">(.*?)<\/a>/) || ["", "Anon"])[1];
      const replyHtml = contentBlock.replace(/@<a href="\/member\/.*?">(.*?)<\/a>/g, "");
      const pid = (contentBlock.match(/@<a href="\/member\/.*?">(.*?)<\/a>/) || [null, null])[1];
      const likes = (b.match(/alt="❤️" \/>\s*(\d+)/) || [0, 0])[1];
      const rObj = {
        id: globalIdx++,
        author: auth,
        replyAuthor,
        replyHtml,
        likes: parseInt(String(likes)),
        time: timeMatch ? timeMatch[1] : "",
        parent: pid && userMap[pid] ? userMap[pid] : null,
        children: []
      };
      allReplies.push(rObj);
      userMap[auth] = rObj.id;
    });
  });
  let tree = [];
  let map = {};
  allReplies.forEach((r) => map[r.id] = r);
  const getUltimateRootId = (pid) => {
    let curr = map[pid];
    let depth = 0;
    while (curr && curr.parent && map[curr.parent] && depth < 50) {
      curr = map[curr.parent];
      depth++;
    }
    return curr ? curr.id : pid;
  };
  allReplies.forEach((r) => {
    if (r.parent && map[r.parent]) {
      const rootId = getUltimateRootId(r.parent);
      map[rootId].children.push(r);
    } else {
      tree.push(r);
    }
  });
  tree.sort((a, b) => b.likes - a.likes);
  return {
    title,
    contentHtml: content,
    opAuthor,
    replies: tree,
    total: allReplies.length,
    allIds: allReplies.map((r) => r.id)
  };
}
function buildSubtleBlocks(firstHtml) {
  let out = "";
  const subtleRegex = /<div class="subtle">([\s\S]*?)<div class="topic_content">([\s\S]*?)<\/div>\s*<\/div>/g;
  let subtleMatch;
  while ((subtleMatch = subtleRegex.exec(firstHtml)) !== null) {
    const meta = (subtleMatch[1].match(/<span class="fade">(.*?)<\/span>/) || ["", "\u9644\u8A00"])[1];
    const subContent = subtleMatch[2];
    out += `<div class="subtle-block" style="margin-top: 18px; padding: 12px 16px; background: #ff2c5511; border-left: 4px solid #ff2c55; border-radius: 0 8px 8px 0;">
      <div style="font-size: 0.8rem; color: var(--meta); margin-bottom: 8px; font-weight: bold;">${meta}</div>
      <div class="topic_content" style="font-size: 0.95rem;">${subContent}</div>
    </div>`;
  }
  return out;
}
function extractTopicContentHtml(firstHtml) {
  const match = firstHtml.match(/<div class="topic_content">([\s\S]*?)<\/div>/);
  return match ? match[1] : "";
}

export { ADMIN_PASS as A, COOKIE_NAME as C, ENV as E, COOKIE_VALUE as a, fetchAndParsePostFull as b, buildSubtleBlocks as c, decodeShare as d, extractTopicContentHtml as e, fetchAndParseList as f, decodeId as g, safeFetch as s };
//# sourceMappingURL=v2ex.mjs.map
