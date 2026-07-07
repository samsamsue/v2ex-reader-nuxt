<script setup lang="ts">
const route = useRoute()
await navigateTo(route.query.site === 'linuxdo' ? '/linuxdo' : '/v2ex', { redirectCode: 301 })
</script>
