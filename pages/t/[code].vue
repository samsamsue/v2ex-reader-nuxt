<template>
  <TopicPage
    :code="code"
    :salt="SALT"
    :share-salt="SHARE_SALT"
    :require-auth="true"
    :show-qr="true"
    :show-share-link="true"
    :show-back="true"
    :show-open-original="true"
    :from-path="fromPath"
    topic-api-base="/api/topic"
    replies-api-base="/api/replies"
    page-title="V2EX Reader"
    :compact-title="true"
  />
</template>

<script setup lang="ts">
const SALT = 987654
const SHARE_SALT = 1234567
const route = useRoute()
const code = computed(() => String(route.params.code || ''))
const fromPath = computed(() => route.fullPath || '/all')
</script>
