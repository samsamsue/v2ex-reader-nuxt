<template>
  <TopicPage
    :code="decodedCode"
    :salt="salt"
    :share-salt="shareSalt"
    :require-auth="true"
    :show-qr="true"
    :show-share-link="true"
    :show-back="true"
    :show-open-original="true"
    :from-path="fromPath"
    :back-to="backTo"
    :topic-api-base="topicApiBase"
    :replies-api-base="repliesApiBase"
    :page-title="pageTitle"
    :share-base-path="'/s'"
    :share-code-prefix="shareCodePrefix"
    :open-original-template="openOriginalTemplate"
    :external-floor-template="externalFloorTemplate"
    :reply-api="replyApi"
    :login-title="pageTitle"
    :compact-title="true"
  />
</template>

<script setup lang="ts">
const V2EX_SALT = 987654
const V2EX_SHARE_SALT = 1234567

const route = useRoute()
const rawCode = computed(() => String(route.params.code || ''))
const decodedCode = computed(() => rawCode.value)
const fromPath = computed(() => route.fullPath || '/v2ex')
const backTo = computed(() => '/v2ex')
const topicApiBase = computed(() => '/api/v2ex/topic')
const repliesApiBase = computed(() => '/api/v2ex/replies')
const pageTitle = computed(() => 'V2EX Reader')
const shareCodePrefix = computed(() => '')
const openOriginalTemplate = computed(() => 'https://www.v2ex.com/t/{id}')
const externalFloorTemplate = computed(() => 'https://www.v2ex.com/t/{id}#{floor}')
const replyApi = computed(() => '/api/v2ex/reply')
const salt = computed(() => V2EX_SALT)
const shareSalt = computed(() => V2EX_SHARE_SALT)
</script>
