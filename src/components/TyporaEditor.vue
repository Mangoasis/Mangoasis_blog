<script>
/**
 * TyporaEditor —— 类 Typora 写作体验封装（Vditor IR 即时渲染模式）
 * - 所见即所得：标题/加粗/列表等语法输入即时渲染
 * - 工具栏可切换 编辑模式（ir / sv 分屏 / wysiwyg）
 * - 暗黑主题联动、字数统计、导出
 */
import Vditor from 'vditor'
import 'vditor/dist/index.css'

export default {
  name: 'TyporaEditor',
  props: {
    modelValue: { type: String, default: '' },
    theme: { type: String, default: 'light' },
    placeholder: { type: String, default: '' }
  },
  emits: ['update:modelValue', 'ready'],
  data() {
    return { vditor: null, inner: this.modelValue || '' }
  },
  mounted() {
    this.vditor = new Vditor(this.$refs.el, {
      value: this.inner,
      theme: this.theme,
      mode: 'ir',
      lang: 'zh_CN',
      placeholder: this.placeholder,
      height: '100%',
      cache: { enable: false },
      counter: { enable: true },
      preview: { theme: { current: this.theme } },
      toolbar: [
        'headings', 'bold', 'italic', 'strike', '|',
        'list', 'ordered-list', 'check', 'quote', '|',
        'code', 'inline-code', 'link', 'table', '|',
        'undo', 'redo', '|',
        'edit-mode', 'both', 'preview', 'fullscreen', '|',
        'export', 'help'
      ],
      input: (value) => {
        this.inner = value
        this.$emit('update:modelValue', value)
      },
      after: () => {
        if (this.modelValue) {
          try {
            this.vditor.setValue(this.modelValue)
          } catch (e) {
            /* ignore */
          }
        }
        this.$emit('ready')
      }
    })
  },
  watch: {
    theme: {
      handler(t) {
        try {
          this.vditor?.setTheme({ theme: t })
        } catch (e) {
          /* ignore */
        }
      }
    },
    modelValue(v) {
      if (!this.vditor || v === this.inner) return
      try {
        this.vditor.setValue(v || '')
        this.inner = v
      } catch (e) {
        /* ignore */
      }
    }
  },
  beforeUnmount() {
    try {
      this.vditor?.destroy()
    } catch (e) {
      /* ignore */
    }
  }
}
</script>

<template>
  <div ref="el" class="typora-editor"></div>
</template>

<style>
.typora-editor {
  height: 100%;
}

/* 与站点玻璃卡片融为一体 */
.typora-editor .vditor {
  border: none !important;
  background: transparent;
  --panel-bg-color: transparent;
  --textarea-background-color: transparent;
  --toolbar-background-color: transparent;
  --toolbar-icon-hover-color: var(--bf-primary);
  --border-color: transparent;
}

.typora-editor .vditor-toolbar {
  padding: 0 10px !important;
}

/* IR 模式内容排版对齐站点阅读风格 */
.typora-editor .vditor-ir .vditor-reset {
  font-family: var(--bf-font-serif);
  font-size: 16px;
  line-height: 1.9;
  color: var(--bf-text);
  padding: 18px 26px !important;
}

.typora-editor .vditor-wysiwyg .vditor-reset,
.typora-editor .vditor-sv .vditor-reset {
  font-family: var(--bf-font-mono);
  color: var(--bf-text);
}

.typora-editor .vditor-reset a {
  color: var(--bf-primary);
}

/* 暗黑下占位符与光标 */
.typora-editor .vditor-ir .vditor-reset[contenteditable]:empty::before,
.typora-editor .vditor-ir .vditor-reset[contenteditable]:focus::before {
  color: var(--bf-text-light);
}
</style>
