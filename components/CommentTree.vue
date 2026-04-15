<template>
  <div>
    <div v-for="node in nodes" :key="node.id" class="comment-item" :id="`c_${node.id}`" :style="nodeStyle(node)">
      <div class="comment-bar">
        <b style="color: var(--author);">{{ node.author }}</b>
        <span v-if="node.author === opAuthor" class="op-tag">OP</span>
        <template v-if="node.replyAuthor || node.replyFloor">
          <svg style="width:14px;height:14px;margin:0 0.5rem;vertical-align:middle;" width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 12L32 24L20 36V12Z" fill="#333" stroke="#333" stroke-width="3" stroke-linejoin="round"/>
          </svg>
          <span v-if="node.replyAuthor" class="reply-author">@{{ node.replyAuthor }}</span>
          <button
            v-if="node.replyFloor"
            type="button"
            class="reply-floor-btn"
            @click="jumpToFloor(node.replyFloor)"
          >
            #{{ node.replyFloor }}
          </button>
        </template>
        <span style="margin-left: 6px; opacity: 0.6;">{{ node.time }}</span>
        <span v-if="node.likes > 0" style="display:inline-flex;align-items:center;margin-left: 8px; color:#ff2c55; font-weight:bold;">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width:12px; height:12px; color:#ff2c55; vertical-align:middle; margin-right:2px;">
            <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
          </svg>
          {{ node.likes }}
        </span>
        <span style="margin-left: 6px; opacity: 0.4;">#{{ node.id }}</span>
      </div>
      <div class="reply-txt" v-html="parsedContent(node.replyHtml)"></div>
      <CommentTree
        v-if="node.children && node.children.length"
        :nodes="node.children"
        :opAuthor="opAuthor"
        :level="level + 1"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'CommentTree' })

const props = defineProps<{ nodes: any[]; opAuthor: string | null; level?: number }>()
const level = computed(() => props.level || 0)

const nodeStyle = () => {
  return level.value === 0
    ? 'padding: 18px 0; border-bottom: 1px solid var(--border);'
    : 'padding-top: 12px; padding-left: 1.2rem; border-left: 1.5px solid var(--border);'
}

const jumpToFloor = (floor: number) => {
  if (typeof window === 'undefined') return
  const handler = (window as any).jumpToFloor
  if (typeof handler === 'function') {
    handler(null, floor)
  }
}

const parsedContent = computed(() => {
  return (content: string)=>{
    return content
      .replace(/<img(.*?)src="(.*?)"/g, '<img$1src="https://2cn2.com/$2"')
      .replace(/<img(.*?)srcset=".*?"/g, '<img$1')
  }
})

</script>

<style scoped>
.reply-floor-btn {
  margin-left: 6px;
  border: none;
  background: transparent;
  color: var(--meta);
  cursor: pointer;
  padding: 0;
  font: inherit;
}

.reply-floor-btn:hover {
  color: var(--text);
}

</style>

<style>
.quote {
  background-color: var(--input-bg);
  border-left:4px solid var(--meta);
  padding:1rem;
}
.quote .title a{
  text-decoration: none;
  color: var(--text);
}
.quote .badge-category__wrapper {
  margin-left:1rem;
  color:var(--meta);
}
.quote img{
  margin: 0;
}
.quote .title{
  display: flex;
  align-items: center;
  gap:1rem;
  line-height: 1;
  font-size:1em;
}
.quote .d-icon{
  width:1em;
  height:1em;
  color: var(--meta);
}
.quote blockquote{
  font-size: 0.8em;
  color: var(--meta);
  margin:0;
  padding:1rem 1rem 0 1rem;
}

aside.onebox{
  background-color: var(--input-bg);
  border-radius: 6px;
}
aside.onebox img{
  margin:0;
}
aside.onebox header {
    align-items: center;
    display: flex;
    gap:0.4rem;
    line-height: 1;
    border-bottom: 1px solid var(--border);
    padding:0.5rem 1rem;
}
aside.onebox header a{
  text-decoration: none;
  
}
.onebox .site-icon {
    width: 16px;
    height: 16px;
    margin-right: .5em;
}
aside.onebox .onebox-body {
  padding:1rem;
  box-sizing: border-box;
  overflow: hidden;
}
aside.onebox .onebox-body p{
  font-size:0.8em;
  white-space: pre-wrap;
  margin:0;
  
}

aside.onebox header a{
  color: var(--text);
}
aside.onebox .onebox-body img{
    width: 100%;
    height: inherit;
    max-width: initial;
    max-height: initial;
    float: none;

}
aside.onebox .onebox-body h3, aside.onebox .onebox-body h4{
  width: calc(100% - 3rem);
  box-sizing: border-box;
  font-size:0.8em;
  font-weight: normal;
}
aside.onebox ~ aside.onebox{
  margin-top:1rem;
}
.hashtag-cooked {
    display: inline-block;
    font-size: .93em;
    font-weight: normal;
    color: var(--primary);
    padding: .2em .34em;
    background: var(--input-bg);
    border-radius: .6em;
    text-decoration: none;
    text-wrap: nowrap;
    line-height: 1;
    unicode-bidi: plaintext;
}
</style>
