<script setup lang="ts">
const route = useRoute()
await navigateTo(`/t/${String(route.params.code || '')}`, { redirectCode: 301 })
</script>
