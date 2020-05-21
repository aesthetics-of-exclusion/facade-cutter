import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'

import * as firebase from 'firebase/app'

const firebaseConfig = {
  apiKey: 'AIzaSyD9uv2hUKypY3QmQCpjpktTDvpPcEXzStY',
  authDomain: 'streetswipe-aoe.firebaseapp.com',
  databaseURL: 'https://streetswipe-aoe.firebaseio.com',
  projectId: 'streetswipe-aoe',
  storageBucket: 'streetswipe-aoe.appspot.com',
  messagingSenderId: '755260135363',
  appId: '1:755260135363:web:5cf3d4e7403532b38b0f76'
}

firebase.initializeApp(firebaseConfig)

Vue.use(VueRouter)

Vue.config.productionTip = false

const router = new VueRouter({
  routes: [
    {
      name: 'main',
      path: '/',
      component: App
    },
    {
      name: 'edit',
      path: '/edit/:poiId',
      component: App
    }
  ]
})

new Vue({
  render: h => h(App),
  router
}).$mount('#app')
