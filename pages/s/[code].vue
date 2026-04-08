<template>
  <TopicPage
    :code="code"
    :salt="SALT"
    :require-auth="false"
    :show-qr="false"
    :show-share-link="false"
    :show-back="false"
    :show-open-original="false"
    topic-api-base="/api/public-topic"
    replies-api-base="/api/public-replies"
    page-title="V2EX Reader"
    :compact-title="false"
  />
</template>

<script setup lang="ts">
const SALT = 1234567
const route = useRoute()
const code = computed(() => String(route.params.code || ''))
</script>
