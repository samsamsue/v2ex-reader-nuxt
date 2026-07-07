<template>
  <TopicPage
    :code="decodedCode"
    :salt="salt"
    :require-auth="false"
    :show-qr="false"
    :show-share-link="false"
    :show-back="false"
    :show-open-original="false"
    :topic-api-base="topicApiBase"
    :replies-api-base="repliesApiBase"
    :page-title="pageTitle"
    :login-title="pageTitle"
    :compact-title="false"
  />
</template>

<script setup lang="ts">
const V2EX_SALT = 1234567

const route = useRoute()
const rawCode = computed(() => String(route.params.code || ''))
const decodedCode = computed(() => rawCode.value)
const topicApiBase = computed(() => '/api/v2ex/public-topic')
const repliesApiBase = computed(() => '/api/v2ex/public-replies')
const pageTitle = computed(() => 'V2EX Reader')
const salt = computed(() => V2EX_SALT)
</script>
