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
    :login-title="pageTitle"
    :compact-title="true"
  />
</template>

<script setup lang="ts">
const V2EX_SALT = 987654
const V2EX_SHARE_SALT = 1234567
const LINUXDO_SALT = 987654
const LINUXDO_SHARE_SALT = 1234567
const LINUXDO_PREFIX = 'l-'

const route = useRoute()
const rawCode = computed(() => String(route.params.code || ''))
const isLinuxdo = computed(() => rawCode.value.startsWith(LINUXDO_PREFIX))
const decodedCode = computed(() => isLinuxdo.value ? rawCode.value.slice(LINUXDO_PREFIX.length) : rawCode.value)
const fromPath = computed(() => route.fullPath || '/all')
const backTo = computed(() => isLinuxdo.value ? '/all?site=linuxdo' : '/all')
const topicApiBase = computed(() => isLinuxdo.value ? '/api/topic' : '/api/v2ex/topic')
const repliesApiBase = computed(() => isLinuxdo.value ? '/api/replies' : '/api/v2ex/replies')
const pageTitle = computed(() => isLinuxdo.value ? 'linux.do Reader' : 'V2EX Reader')
const shareCodePrefix = computed(() => isLinuxdo.value ? LINUXDO_PREFIX : '')
const openOriginalTemplate = computed(() => isLinuxdo.value ? 'https://linux.do/t/topic/{id}' : 'https://www.v2ex.com/t/{id}')
const salt = computed(() => isLinuxdo.value ? LINUXDO_SALT : V2EX_SALT)
const shareSalt = computed(() => isLinuxdo.value ? LINUXDO_SHARE_SALT : V2EX_SHARE_SALT)
</script>
