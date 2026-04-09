import { c as defineEventHandler, g as getCookie, e as setResponseStatus, i as getRouterParam } from '../../../_/nitro.mjs';
import { a as COOKIE_VALUE, h as decodeId, b as fetchAndParsePostFull, A as ADMIN_PASS, C as COOKIE_NAME, E as ENV } from '../../../_/v2ex.mjs';
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

const _id__get = defineEventHandler(async (event) => {
  const hasPass = Boolean(ADMIN_PASS);
  const cookieVal = getCookie(event, COOKIE_NAME);
  if (hasPass && cookieVal !== COOKIE_VALUE) {
    setResponseStatus(event, 401);
    return { error: "AUTH" };
  }
  const code = String(getRouterParam(event, "id") || "");
  const rawId = decodeId(code);
  if (!rawId) {
    setResponseStatus(event, 400);
    return { error: "ID_DECODE_FAILED" };
  }
  const postData = await fetchAndParsePostFull(`https://www.v2ex.com/t/${rawId}`, ENV);
  return { ...postData, rawId };
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map
