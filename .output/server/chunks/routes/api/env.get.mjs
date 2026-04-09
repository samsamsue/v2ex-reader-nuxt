import { c as defineEventHandler } from '../../_/nitro.mjs';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'undici';
import 'node:url';

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
const env_get = defineEventHandler(() => {
  return {
    httpProxy: process.env.HTTP_PROXY || "",
    httpsProxy: process.env.HTTPS_PROXY || "",
    hasV2Cookie: Boolean(process.env.V2_COOKIE),
    hasPassword: Boolean(process.env.PASSWORD)
  };
});

export { env_get as default };
//# sourceMappingURL=env.get.mjs.map
