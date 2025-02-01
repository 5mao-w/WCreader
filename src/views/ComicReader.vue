<template>
  <div class="comic-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading">加载中...</div>

    <!-- 漫画内容 -->
    <transition-group name="fade">
      <div v-for="(page, index) in comicPages" :key="index" class="page-container" :ref="el => setPageRef(el, index)">
        <!-- 加载占位符 -->
        <div v-if="!page" class="loading-placeholder">加载中...</div>
        <!-- 图片展示 -->
        <img v-else :src="page" :alt="`第 ${index + 1} 页`" class="comic-image" />
      </div>
    </transition-group>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import axios from 'axios'

export default {
  setup() {
    // 数据定义
    const comicId = ref(new URLSearchParams(window.location.search).get('id'))
    const totalPages = ref(0)
    const comicPages = ref([])
    const loading = ref(false)
    const currentPage = ref(0)
    const allPagesLoaded = ref(false)

    // 元素引用
    const loadTrigger = ref(null)
    const pageRefs = ref([])

    // 初始化漫画数据
    const initializeComic = () => {
      const storedComics = localStorage.getItem('comics')
      const comics = JSON.parse(storedComics)
      const comic = comics.find(c => c.id === comicId.value)

      if (comic) {
        totalPages.value = comic.pageCount
        // 初始化所有页面占位符
        comicPages.value = Array(totalPages.value).fill(null)
      }
    }

    // 设置页面元素的引用
    const setPageRef = (el, index) => {
      if (el && !el.isObserved) {
        pageRefs.value[index] = el
        observePage(el, index)
        el.isObserved = true
      }
    }

    // 观察页面元素
    const observePage = async (el, index) => {
      useIntersectionObserver(el, ([entry]) => {
        if (entry.isIntersecting) {
          loadPage(index)
        }
      }, { threshold: 0.1 })
    }

    // 加载单页
    const loadPage = async (index) => {
      if (comicPages.value[index] !== null) return // 已加载则跳过
      try {
        const url = await fetchPage(index)
        comicPages.value[index] = url
      } catch (err) {
        console.error('页面加载失败:', err)
      }
    }

    // 加载更多页面（每次5页）
    const loadMorePages = async () => {
      if (loading.value || allPagesLoaded.value) return
      loading.value = true

      try {
        const pagesToLoad = Math.min(5, totalPages.value - currentPage.value)
        const requests = Array.from({ length: pagesToLoad }, (_, i) =>
          fetchPage(currentPage.value + i)
        )

        const newPages = await Promise.all(requests)
        newPages.forEach((url, i) => {
          comicPages.value[currentPage.value + i] = url
        })

        currentPage.value += pagesToLoad
        allPagesLoaded.value = currentPage.value >= totalPages.value
      } catch (err) {
        console.error('批量加载失败:', err)
      } finally {
        loading.value = false
      }
    }

    // 获取单页数据
    const fetchPage = async (pageIndex) => {
      try {
        const res = await axios.get(
          `http://localhost:5239/api/comic/${comicId.value}/page/${pageIndex}`,
          { responseType: 'blob', timeout: 5000 }
        )

        return URL.createObjectURL(res.data)
      } catch (err) {
        console.error(`请求第 ${pageIndex} 页失败`, err)
        return ''
      }
    }

    onMounted(() => {
      initializeComic()
      loadMorePages() // 初始加载第一批
    })

    return {
      comicPages,
      loading,
      allPagesLoaded,
      loadTrigger,
      setPageRef
    }
  }
}
</script>

<style scoped>
/* 新增触发元素样式 */
.load-trigger {
  height: 1px;
  width: 100%;
  visibility: hidden;
}

/* 保持原有样式不变 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.comic-container {
  overflow-y: auto;
  max-height: 80vh;
  padding-bottom: 50px;
}

.page-container {
  margin: 20px 0;
  min-height: 300px;
  position: relative;
}

.loading-placeholder {
  height: 800px;
  background: linear-gradient(110deg, #ececec 8%, #f5f5f5 18%, #ececec 33%);
  border-radius: 5px;
  animation: loading 1.5s infinite;
}

.comic-image {
  width: 100%;
  height: auto;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  background: white;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}
</style>
