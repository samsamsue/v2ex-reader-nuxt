<script setup lang="ts">
const route = useRoute()
await navigateTo(`/s/${String(route.params.code || '')}`, { redirectCode: 301 })
</script>
