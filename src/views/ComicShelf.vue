<template>
  <div id="app">
    <h1>我的漫画书架</h1>

    <!-- 搜索框 -->
    <input v-model="searchTerm" placeholder="搜索漫画..." class="search-input" />

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">加载中...</div>

    <!-- 错误提示 -->
    <div v-if="error" class="error">{{ error }}</div>

    <!-- 漫画网格 -->
    <div class="comic-grid">
      <div v-for="comic in paginatedComics" :key="comic.id" class="comic-card" @click="viewDetail(comic.id)">
        <img :src="`http://localhost:5239${comic.cover}`" :alt="comic.title" class="cover-img" />
        <div class="comic-info">
          <div class="comic-title">{{ comic.title }}</div>
          <div>页数: {{ comic.pageCount }}</div>
          <div>添加时间: {{ formatDate(comic.addedAt) }}</div>
        </div>
      </div>
    </div>

    <!-- 分页控制 -->
    <div class="pagination">
      <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
        上一页
      </button>
      <span>第 {{ currentPage }} 页</span>
      <button :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">
        下一页
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'App',
  data() {
    return {
      comics: [], // 所有漫画数据
      searchTerm: '', // 搜索关键词
      loading: false, // 加载状态
      error: '', // 错误信息
      currentPage: 1, // 当前页码
      pageSize: 10 // 每页显示的漫画数量
    }
  },
  computed: {
    // 过滤后的漫画列表
    filteredComics() {
      return this.comics.filter((comic) =>
        comic.title.toLowerCase().includes(this.searchTerm.toLowerCase())
      )
    },
    // 分页后的漫画列表
    paginatedComics() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredComics.slice(start, end)
    },
    // 总页数
    totalPages() {
      return Math.ceil(this.filteredComics.length / this.pageSize)
    }
  },
  methods: {
    // 获取漫画数据
    async fetchComics() {
      this.loading = true
      this.error = ''
      try {
        const response = await axios.get('http://localhost:5239/api/comics')
        this.comics = response.data
        localStorage.setItem('comics', JSON.stringify(response.data))
      } catch (err) {
        this.error = '无法加载漫画数据，请稍后重试。'
        console.error('获取数据失败:', err)
      } finally {
        this.loading = false
      }
    },
    // 切换页码
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
      }
    },
    // 格式化日期
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString()
    },
    // 查看漫画详情
    viewDetail(id) {
      // 跳转到漫画阅读页面，并传递漫画地址
      this.$router.push({ path: '/reader', query: { id } })
    }
  },
  mounted() {
    this.fetchComics()
  }
}
</script>

<style>
/* 基础样式 */
#app {
  font-family: Arial, sans-serif;
  padding: 20px;
  background-color: #f0f2f5;
}

.search-input {
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
}

.loading {
  text-align: center;
  padding: 50px;
  font-size: 18px;
}

.error {
  color: red;
  text-align: center;
  padding: 20px;
}

.comic-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  padding: 20px;
}

.comic-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s;
  cursor: pointer;
}

.comic-card:hover {
  transform: translateY(-5px);
}

.cover-img {
  width: 100%;
  height: 300px;
  object-fit: cover;
}

.comic-info {
  padding: 15px;
}

.comic-title {
  font-weight: bold;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.pagination button {
  margin: 0 10px;
  padding: 8px 16px;
  border: none;
  background-color: #007bff;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
