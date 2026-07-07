<script setup lang="ts">
const route = useRoute()
await navigateTo(`/t/l-${String(route.params.code || '')}`, { redirectCode: 301 })
</script>
