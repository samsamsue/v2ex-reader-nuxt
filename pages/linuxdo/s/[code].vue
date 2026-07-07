<script setup lang="ts">
const route = useRoute()
await navigateTo(`/s/l-${String(route.params.code || '')}`, { redirectCode: 301 })
</script>
