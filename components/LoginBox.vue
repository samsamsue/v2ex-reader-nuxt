<template>
  <div class="login-wrap">
    <div class="box">
      <h2>V2EX Reader</h2>
      <form @submit.prevent="submit">
        <input v-model="password" type="password" placeholder="请输入访问密钥" autofocus required />
        <p v-if="error" class="err">密钥错误</p>
        <button type="submit">确认</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ from?: string }>()
const password = ref('')
const error = ref(false)

const submit = async () => {
  error.value = false
  const res = await $fetch('/api/login', {
    method: 'POST',
    body: { password: password.value }
  }).catch(() => null)

  if (!res || (res as any).error) {
    error.value = true
    return
  }
  window.location.href = props.from || '/'
}
</script>

<style scoped>
.login-wrap{display:flex;justify-content:center;align-items:center;height:100vh;}
.box{text-align:center;width:90%;max-width:320px;}
input{width:100%;padding:14px;margin:20px 0;border:1px solid var(--border);border-radius:12px;box-sizing:border-box;outline:none;text-align:center;background:var(--input-bg);color:var(--text);font-size:16px;}
button{width:100%;padding:14px;background:#1d2129;color:#fff;border:none;border-radius:12px;font-weight:600;cursor:pointer;}
.err{color:#ff2c55;font-size:0.85rem;}
</style>
