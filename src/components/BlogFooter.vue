<script setup>
import { computed } from 'vue'
import { siteStore } from '../stores/site'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="bf-footer">
    <div>
      Copyright © {{ siteStore.since.slice(0, 4) }} - {{ year }}
      <span style="font-weight: 600">{{ siteStore.title }}</span>
    </div>
    <div>
      Theme design inspired by
      <a href="https://butterfly.js.org/" target="_blank" rel="noopener">Butterfly</a>
      | Powered by
      <a href="https://cn.vuejs.org/" target="_blank" rel="noopener">Vue3</a> &
      <a href="https://element-plus.org/" target="_blank" rel="noopener">Element Plus</a>
      <span class="heart">❤</span>
    </div>
  </footer>
</template>
