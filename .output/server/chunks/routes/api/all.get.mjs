import { d as defineEventHandler, g as getCookie, s as setResponseStatus, a as getQuery } from '../../_/nitro.mjs';
import { C as COOKIE_NAME, a as COOKIE_VALUE, f as fetchAndParseList, A as ADMIN_PASS, E as ENV } from '../../_/v2ex.mjs';
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

const all_get = defineEventHandler(async (event) => {
  const hasPass = Boolean(ADMIN_PASS);
  const cookieVal = getCookie(event, COOKIE_NAME);
  if (hasPass && cookieVal !== COOKIE_VALUE) {
    setResponseStatus(event, 401);
    return { error: "AUTH" };
  }
  const q = getQuery(event);
  const p = parseInt(String(q.p || 0));
  const target = p === 0 ? "https://www.v2ex.com/?tab=all" : `https://www.v2ex.com/recent?p=${p}`;
  const listData = await fetchAndParseList(target, ENV);
  return { items: listData.items, count: listData.count };
});

export { all_get as default };
//# sourceMappingURL=all.get.mjs.map
