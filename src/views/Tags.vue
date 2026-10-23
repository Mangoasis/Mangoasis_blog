<script setup>
import PageBanner from '../components/PageBanner.vue'
import AsideBox from '../components/AsideBox.vue'
import { tags } from '../stores/posts'

const fontSizes = [13, 15, 17, 20, 24]

function fontSize(count) {
  const max = Math.max(...tags.value.map((t) => t.count), 1)
  const ratio = count / max
  return fontSizes[Math.min(fontSizes.length - 1, Math.floor(ratio * fontSizes.length))]
}
</script>

<template>
  <div>
    <PageBanner title="标签" subtitle="标签是文章的关键词" />

    <div class="bf-container">
      <main class="bf-main">
        <div class="bf-card tag-card" v-reveal>
          <div class="cloud">
            <router-link
              v-for="t in tags"
              :key="t.name"
              :to="`/tags/${t.name}`"
              :style="{ fontSize: fontSize(t.count) + 'px' }"
            >
              {{ t.name }}
              <sup>{{ t.count }}</sup>
            </router-link>
          </div>
          <el-empty v-if="!tags.length" description="暂无标签" />
        </div>
      </main>
      <AsideBox />
    </div>
  </div>
</template>

<style scoped>
.tag-card {
  padding: 30px;
}

.cloud {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 16px;
  line-height: 2.4;
}

.cloud a {
  color: var(--bf-text-sub);
  transition: all 0.2s;
}

.cloud a:hover {
  color: var(--bf-hover);
  transform: scale(1.1);
}

.cloud sup {
  color: var(--bf-primary);
  font-size: 0.65em;
  margin-left: 1px;
}
</style>
