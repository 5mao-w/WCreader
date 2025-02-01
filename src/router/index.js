import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ComicShelf from '../views/ComicShelf.vue'
import ComicReader from '@/views/ComicReader.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  },
  {
    path: '/shelf',
    name: 'shelf',
    component: ComicShelf
  },
  {
    path: '/reader',
    name: 'reader',
    component: ComicReader,
    props: (route) => ({ comicUrl: route.query.comicUrl }) // 将 URL 参数作为 props 传递
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
