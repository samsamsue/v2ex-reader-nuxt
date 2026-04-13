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
      <div class="reply-txt" v-html="node.replyHtml"></div>
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
