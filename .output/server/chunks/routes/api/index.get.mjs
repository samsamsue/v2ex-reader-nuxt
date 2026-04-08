import { d as defineEventHandler, g as getCookie, s as setResponseStatus } from '../../_/nitro.mjs';
import { a as COOKIE_VALUE, s as safeFetch, E as ENV, e as encodeId, A as ADMIN_PASS, C as COOKIE_NAME } from '../../_/v2ex.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'undici';
import 'node:url';
import 'crypto';
import 'fs';
import 'path';

const index_get = defineEventHandler(async (event) => {
  const hasPass = Boolean(ADMIN_PASS);
  const cookieVal = getCookie(event, COOKIE_NAME);
  if (hasPass && cookieVal !== COOKIE_VALUE) {
    setResponseStatus(event, 401);
    return { error: "UNAUTHORIZED", items: [] };
  }
  try {
    const resp = await safeFetch("https://www.v2ex.com/notifications", ENV);
    const html = await resp.text();
    const items = [];
    const cellRegex = /<div class="cell" id="n_\d+">([\s\S]*?)<\/table>\s*<\/div>/g;
    let match;
    while ((match = cellRegex.exec(html)) !== null) {
      const block = match[1];
      const topicMatch = block.match(/href="\/t\/(\d+)[^"]*"/);
      const fadeMatch = block.match(/<span class="fade">([\s\S]*?)<\/span>/);
      const payloadMatch = block.match(/<div class="payload">([\s\S]*?)<\/div>/);
      const timeMatch = block.match(/<span class="snow">([^<]+)<\/span>/);
      if (topicMatch) {
        const pureDesc = fadeMatch ? fadeMatch[1].replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim() : "\u65B0\u63D0\u9192";
        items.push({
          encodedId: encodeId(topicMatch[1]),
          desc: pureDesc,
          payload: payloadMatch ? payloadMatch[1].trim() : "",
          time: timeMatch ? timeMatch[1].trim() : ""
        });
      }
    }
    return { items };
  } catch {
    return { items: [] };
  }
});

export { index_get as default };
//# sourceMappingURL=index.get.mjs.map
