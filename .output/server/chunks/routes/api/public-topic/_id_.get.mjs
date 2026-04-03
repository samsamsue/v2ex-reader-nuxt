import { c as defineEventHandler, i as getRouterParam, e as setResponseStatus } from '../../../_/nitro.mjs';
import MarkdownIt from 'markdown-it';
import { s as safeFetch, E as ENV, e as extractTopicContentHtml, c as buildSubtleBlocks } from '../../../_/v2ex.mjs';
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
  const id = String(getRouterParam(event, "id") || "");
  if (!/^[0-9]+$/.test(id)) {
    setResponseStatus(event, 400);
    return { error: "ID_INVALID" };
  }
  const apiUrl = `https://www.v2ex.com/api/topics/show.json?id=${id}`;
  const resp = await safeFetch(apiUrl, ENV);
  const json = await resp.json();
  const topic = Array.isArray(json) ? json[0] : json;
  if (!topic) {
    setResponseStatus(event, 404);
    return { error: "NOT_FOUND" };
  }
  const md = new MarkdownIt({ html: true, linkify: true, breaks: true });
  let contentHtml = topic.content_rendered || (topic.content ? md.render(topic.content) : "");
  try {
    const htmlResp = await safeFetch(`https://www.v2ex.com/t/${id}`, ENV);
    const htmlText = await htmlResp.text();
    if (!contentHtml) {
      const fallback = extractTopicContentHtml(htmlText);
      if (fallback) contentHtml = fallback;
    }
    const subtles = buildSubtleBlocks(htmlText);
    if (subtles) contentHtml += subtles;
  } catch {
  }
  return {
    id: topic.id,
    title: topic.title,
    content: contentHtml || "",
    content_rendered: contentHtml || "",
    member: topic.member || null,
    created: topic.created,
    last_modified: topic.last_modified
  };
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map
