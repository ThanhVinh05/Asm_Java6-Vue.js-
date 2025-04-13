import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// Import Bootstrap và Font Awesome
import 'bootstrap/dist/css/bootstrap.min.css'
import * as bootstrap from 'bootstrap'
import '@fortawesome/fontawesome-free/css/all.min.css'

// Make Bootstrap available globally
window.bootstrap = bootstrap

const app = createApp(App)

app.use(router)
app.use(store)

app.mount('#app')
