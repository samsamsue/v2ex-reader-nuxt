import { c as defineEventHandler, r as readBody, e as setResponseStatus, h as setCookie } from '../../_/nitro.mjs';
import { A as ADMIN_PASS, a as COOKIE_VALUE, C as COOKIE_NAME } from '../../_/v2ex.mjs';
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

const login_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const password = body == null ? void 0 : body.password;
  if (!ADMIN_PASS) {
    setResponseStatus(event, 400);
    return { error: "NO_PASSWORD_SET" };
  }
  if (password && password === ADMIN_PASS) {
    setCookie(event, COOKIE_NAME, COOKIE_VALUE, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      // httpOnly: true,
      sameSite: "lax"
    });
    return { ok: true };
  }
  setResponseStatus(event, 401);
  return { error: "BAD_PASSWORD" };
});

export { login_post as default };
//# sourceMappingURL=login.post.mjs.map
