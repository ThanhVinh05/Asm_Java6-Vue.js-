import { createApp } from 'vue'
import App from './App.vue'

// Import Bootstrap CSS and JS
import 'bootstrap/dist/css/bootstrap.min.css'
import * as bootstrap from 'bootstrap'

// Make Bootstrap available globally
window.bootstrap = bootstrap

// Import Font Awesome CSS
import '@fortawesome/fontawesome-free/css/all.css'

import router from './router'

const app = createApp(App)
app.use(router)
app.mount('#app')
