<template>
  <div id="app">
    <header>
      <router-link v-if="currentIndex > 1 && loaded" :to="{
        name: 'facade',
        params: {
          index: currentIndex - 1,
          id: pois[currentIndex - 2].id
        }
      }" >⟵ Previous</router-link>
      <a v-else>
      </a>

      <router-link :to="{name: 'main'}" class="main-link">
        Aesthetics of Exclusion - Facade Cutter
      </router-link>

      <router-link v-if="currentIndex < pois.length && loaded" :to="{
        name: 'facade',
        params: {
          index: currentIndex + 1,
          id: pois[currentIndex].id
        }
      }" >Next ⟶</router-link>
      <a v-else>
      </a>
    </header>
    <main>
      <div class="loading" v-if="!loaded">
        <span>Loading</span>
      </div>
      <template v-if="$route.name === 'main'">
        <List :apiUrl="apiUrl" :pois="pois" />
      </template>
      <template v-else-if="$route.name === 'facade'">
        <Facade :apiUrl="apiUrl" :id="$route.params.id" />
      </template>
      <template v-else>
        Error!
      </template>
    </main>
  </div>
</template>

<script>
import axios from 'axios'

import List from './components/List'
import Facade from './components/Facade'

export default {
  name: 'App',
  components: {
    List,
    Facade
  },
  data: function () {
    return {
      apiUrl: 'https://facade-cutter-api.glitch.me/',
      pois: []
    }
  },
  computed: {
    loaded: function () {
      return this.pois.length > 0
    },
    currentIndex: function () {
      return parseInt(this.$route.params.index)
    }
  },
  mounted: async function () {
    const url = `${this.apiUrl}facades`
    const response = await axios.get(url)
    this.pois = response.data
  }
}
</script>

<style>
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  top: 0;
  position: absolute;
  font-family: monospace;
  font-size: 16px;
}

#app {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.loading {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  width: 100%;
  height: 100%;
}

a, a:visited {
  color: black;
}

header {
  background-color: #ff86e1;
  padding: 5px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.main-link {
  font-weight: bold;
  padding: 0 1em;
}

header a {
  text-decoration: none;
  min-width: 110px;
}

header a:last-child {
  text-align: right;
}

main {
  width: 100%;
  height: 100%;
}
</style>
