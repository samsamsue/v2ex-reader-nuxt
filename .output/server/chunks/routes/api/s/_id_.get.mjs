import { d as defineEventHandler, c as getRouterParam, s as setResponseStatus } from '../../../_/nitro.mjs';
import { g as decodeShare, b as fetchAndParsePostFull, E as ENV } from '../../../_/v2ex.mjs';
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
  const code = String(getRouterParam(event, "id") || "");
  const rawId = decodeShare(code);
  if (!rawId) {
    setResponseStatus(event, 400);
    return { error: "ID_DECODE_FAILED" };
  }
  const postData = await fetchAndParsePostFull(`https://www.v2ex.com/t/${rawId}`, ENV);
  return { ...postData, rawId };
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map
