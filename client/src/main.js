import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

import 'katex/dist/katex.min.css'
import './styles/main.css'

import { useAuthStore } from './stores/auth'
import { useThemeStore } from './stores/theme'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

pinia.use(({ store }) => {
  if (store.$id === 'exam') {
    store.$subscribe((mutation, state) => {
      localStorage.setItem('examState', JSON.stringify(state))
    })
  }
})

app.use(router)

const authStore = useAuthStore()
authStore.initAuth()

const themeStore = useThemeStore()
themeStore.initTheme()

app.mount('#app')
