import { c as defineEventHandler, g as getCookie, e as setResponseStatus } from '../../../_/nitro.mjs';
import { a as COOKIE_VALUE, s as safeFetch, E as ENV, A as ADMIN_PASS, C as COOKIE_NAME } from '../../../_/v2ex.mjs';
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

const count_get = defineEventHandler(async (event) => {
  const hasPass = Boolean(ADMIN_PASS);
  const cookieVal = getCookie(event, COOKIE_NAME);
  if (hasPass && cookieVal !== COOKIE_VALUE) {
    setResponseStatus(event, 401);
    return { error: "UNAUTHORIZED", count: 0 };
  }
  try {
    const resp = await safeFetch("https://www.v2ex.com/", ENV);
    const html = await resp.text();
    const match = html.match(/href="\/notifications"[^>]*>\s*(\d+)\s*条未读提醒/);
    return { count: match ? parseInt(match[1]) : 0 };
  } catch {
    return { count: 0 };
  }
});

export { count_get as default };
//# sourceMappingURL=count.get.mjs.map
