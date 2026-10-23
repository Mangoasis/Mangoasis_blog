<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import PageBanner from '../components/PageBanner.vue'
import PostRow from '../components/PostRow.vue'
import AsideBox from '../components/AsideBox.vue'
import { postsByCategory } from '../stores/posts'

const route = useRoute()
const name = computed(() => decodeURIComponent(route.params.name))
const list = computed(() => postsByCategory(name.value))
</script>

<template>
  <div>
    <PageBanner title="分类" :subtitle="`「 ${name} 」分类下共 ${list.length} 篇文章`" />

    <div class="bf-container">
      <main class="bf-main">
        <PostRow v-for="p in list" :key="p.id" :post="p" />
        <el-empty v-if="!list.length" description="该分类下暂无文章" />
      </main>
      <AsideBox />
    </div>
  </div>
</template>
