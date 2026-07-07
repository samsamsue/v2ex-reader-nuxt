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
const LINUXDO_SALT = 1234567
const LINUXDO_PREFIX = 'l-'

const route = useRoute()
const rawCode = computed(() => String(route.params.code || ''))
const isLinuxdo = computed(() => rawCode.value.startsWith(LINUXDO_PREFIX))
const decodedCode = computed(() => isLinuxdo.value ? rawCode.value.slice(LINUXDO_PREFIX.length) : rawCode.value)
const topicApiBase = computed(() => isLinuxdo.value ? '/api/public-topic' : '/api/v2ex/public-topic')
const repliesApiBase = computed(() => isLinuxdo.value ? '/api/public-replies' : '/api/v2ex/public-replies')
const pageTitle = computed(() => isLinuxdo.value ? 'linux.do Reader' : 'V2EX Reader')
const salt = computed(() => isLinuxdo.value ? LINUXDO_SALT : V2EX_SALT)
</script>
