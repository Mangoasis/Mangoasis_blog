<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import PageBanner from '../components/PageBanner.vue'
import PostRow from '../components/PostRow.vue'
import AsideBox from '../components/AsideBox.vue'
import { postsByTag } from '../stores/posts'

const route = useRoute()
const name = computed(() => decodeURIComponent(route.params.name))
const list = computed(() => postsByTag(name.value))
</script>

<template>
  <div>
    <PageBanner title="标签" :subtitle="`「 ${name} 」标签下共 ${list.length} 篇文章`" />

    <div class="bf-container">
      <main class="bf-main">
        <PostRow v-for="p in list" :key="p.id" :post="p" />
        <el-empty v-if="!list.length" description="该标签下暂无文章" />
      </main>
      <AsideBox />
    </div>
  </div>
</template>
