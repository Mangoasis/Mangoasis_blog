<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import PageBanner from '../components/PageBanner.vue'
import AsideBox from '../components/AsideBox.vue'
import { resources, resourceCats, addResource, deleteResource } from '../stores/gallery'

const route = useRoute()
const activeCat = ref('全部')
const keyword = ref('')
const showAdd = ref(false)
const form = ref({ name: '', desc: '', url: '', cat: '工具' })

// 支持 /resources?cat=前端 与 mrzym.top 风格链接 /resources/front、/resources/back
watch(
  () => route.query.cat,
  (c) => {
    if (c && resourceCats.includes(c)) activeCat.value = c
  },
  { immediate: true }
)

const filtered = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  return resources.filter((r) => {
    const catOk = activeCat.value === '全部' || r.cat === activeCat.value
    const kwOk =
      !k ||
      r.name.toLowerCase().includes(k) ||
      (r.desc || '').toLowerCase().includes(k) ||
      (r.url || '').toLowerCase().includes(k)
    return catOk && kwOk
  })
})

const catIcons = { 前端: 'Monitor', 后端: 'Coin', 工具: 'Suitcase', 学习: 'Reading' }

function submitAdd() {
  const { name, url } = form.value
  if (!name.trim() || !url.trim()) {
    ElMessage.warning('名称和链接为必填项')
    return
  }
  addResource({ ...form.value, name: name.trim(), url: url.trim() })
  showAdd.value = false
  form.value = { name: '', desc: '', url: '', cat: '工具' }
  ElMessage.success('资源已添加')
}

async function onDelete(r) {
  try {
    await ElMessageBox.confirm(`删除资源「${r.name}」？`, '提示', { type: 'warning' })
    deleteResource(r.id)
    ElMessage.success('已删除')
  } catch (e) {
    /* 取消 */
  }
}
</script>

<template>
  <div>
    <PageBanner title="资源" subtitle="收藏的开发资源与学习网站" />

    <div class="bf-container">
      <main class="bf-main">
        <div class="bf-card res-card" v-reveal>
          <!-- 分类 tab + 搜索 + 添加 -->
          <div class="res-toolbar">
            <div class="cat-tabs">
              <button
                v-for="c in resourceCats"
                :key="c"
                class="album-chip"
                :class="{ active: activeCat === c }"
                @click="activeCat = c"
              >
                {{ c }}
              </button>
            </div>
            <el-input v-model="keyword" placeholder="搜索资源" clearable style="max-width: 220px" :prefix-icon="Search" />
            <el-button class="bf-write-btn" size="small" round @click="showAdd = true">
              <el-icon style="margin-right: 4px"><Plus /></el-icon>添加
            </el-button>
          </div>

          <!-- 资源网格 -->
          <div class="res-grid">
            <a
              v-for="(r, i) in filtered"
              :key="r.id"
              class="res-item" v-reveal="(i % 8) * 50"
              :href="r.url"
              target="_blank"
              rel="noopener"
            >
              <div class="res-icon" :class="r.cat">
                <el-icon :size="22"><component :is="catIcons[r.cat] || 'Link'" /></el-icon>
              </div>
              <div class="res-info">
                <div class="res-name">
                  {{ r.name }}
                  <el-tag size="small" effect="plain" round>{{ r.cat }}</el-tag>
                </div>
                <div class="res-desc">{{ r.desc }}</div>
              </div>
              <button class="res-del" title="删除" @click.prevent="onDelete(r)">
                <el-icon><Delete /></el-icon>
              </button>
            </a>
          </div>

          <el-empty v-if="!filtered.length" description="没有找到相关资源" />
        </div>
      </main>

      <AsideBox />
    </div>

    <!-- 添加资源对话框 -->
    <el-dialog v-model="showAdd" title="添加资源" width="min(460px, 92%)" :close-on-click-modal="false">
      <el-form label-position="top">
        <el-form-item label="名称" required>
          <el-input v-model="form.name" placeholder="资源名称" maxlength="30" />
        </el-form-item>
        <el-form-item label="链接" required>
          <el-input v-model="form.url" placeholder="https://..." />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.desc" placeholder="一句话介绍（可选）" maxlength="50" />
        </el-form-item>
        <el-form-item label="分类">
          <el-radio-group v-model="form.cat">
            <el-radio-button v-for="c in resourceCats.filter((x) => x !== '全部')" :key="c" :value="c">
              {{ c }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAdd = false">取消</el-button>
        <el-button type="primary" @click="submitAdd">添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.res-card {
  padding: 20px 22px 24px;
}

.res-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
}

.cat-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1;
}

.album-chip {
  border: none;
  cursor: pointer;
  padding: 6px 16px;
  border-radius: 16px;
  font-size: 13.5px;
  color: var(--bf-text-sub);
  background: var(--bf-tag-bg);
  transition: all 0.25s;
  font-family: var(--bf-font-ui);
}

.album-chip:hover {
  color: var(--bf-primary);
}

.album-chip.active {
  background: linear-gradient(135deg, var(--bf-primary), #6fc3f7);
  color: #fff;
  box-shadow: 0 3px 10px rgba(73, 177, 245, 0.35);
}

.res-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

@media (max-width: 640px) {
  .res-grid {
    grid-template-columns: 1fr;
  }
}

.res-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: var(--bf-radius);
  background: var(--bf-tag-bg);
  color: var(--bf-text);
  transition: all 0.25s;
  position: relative;
}

.res-item:hover {
  background: var(--bf-card-bg);
  box-shadow: var(--bf-shadow-hover);
  transform: translateY(-3px);
  color: var(--bf-text);
}

.res-icon {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.res-icon.前端 {
  background: linear-gradient(135deg, #49b1f5, #82c8f8);
}

.res-icon.后端 {
  background: linear-gradient(135deg, #6f42c1, #a78bfa);
}

.res-icon.工具 {
  background: linear-gradient(135deg, #ff9f43, #ffcb80);
}

.res-icon.学习 {
  background: linear-gradient(135deg, #00b96b, #7fe0b0);
}

.res-info {
  flex: 1;
  min-width: 0;
}

.res-name {
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 3px;
}

.res-item:hover .res-name {
  color: var(--bf-primary);
}

.res-desc {
  font-size: 13px;
  color: var(--bf-text-sub);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.res-del {
  position: absolute;
  top: 8px;
  right: 8px;
  border: none;
  background: transparent;
  color: var(--bf-text-light);
  width: 26px;
  height: 26px;
  border-radius: 50%;
  cursor: pointer;
  display: none;
  align-items: center;
  justify-content: center;
}

.res-item:hover .res-del {
  display: flex;
}

.res-del:hover {
  color: var(--bf-hover);
  background: rgba(255, 114, 66, 0.1);
}
</style>
