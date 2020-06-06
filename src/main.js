import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import VueAnalytics from 'vue-analytics'

require('dotenv').config();

Vue.config.productionTip = false
const isProd = process.env.VUE_APP_ENV === 'prod'

Vue.use(VueAnalytics, {
  id: 'UA-71023042-2',
  router,
  debug: {
    enabled: false //!isProd
  }
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
