<template>
  <div id="app">
    <header>
      <router-link v-if="loaded && currentIndex > 1" :to="{
        name: $route.name,
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

      <router-link v-if="loaded && currentIndex < pois.length" :to="{
        name: $route.name,
        params: {
          index: currentIndex + 1,
          id: pois[currentIndex].id
        }
      }" >Next ⟶</router-link>
      <a v-else>
      </a>
    </header>
    <main>
      <div class="container">
        <div class="loading" v-if="!loaded">
          <span>Loading...</span>
        </div>
        <template v-if="$route.name === 'main'">
          <ListFacades :apiUrl="apiUrl" :pois="pois" />
        </template>
        <template v-else-if="$route.name === 'edit'">
          <EditFacade :apiUrl="apiUrl" :id="$route.params.id" />
        </template>
        <template v-else-if="$route.name === 'view'">
          <ViewFacade :apiUrl="apiUrl" :id="$route.params.id" />
        </template>
        <template v-else>
          Error!
        </template>
      </div>
    </main>

    <footer>
      <router-link v-if="loaded && $route.name === 'edit'" :to="{
        name: 'view',
        params: {
          index: currentIndex,
          id: pois[currentIndex - 1].id
        }
      }">
        View facade
      </router-link>
      <router-link v-else-if="loaded && $route.name === 'view'" :to="{
        name: 'edit',
        params: {
          index: currentIndex,
          id: pois[currentIndex - 1].id
        }
      }">
        Edit facade
      </router-link>
      <div v-else>-</div>
    </footer>
  </div>
</template>

<script>
import axios from 'axios'

import ListFacades from './components/ListFacades'
import EditFacade from './components/EditFacade'
import ViewFacade from './components/ViewFacade'

export default {
  name: 'App',
  components: {
    ListFacades,
    EditFacade,
    ViewFacade
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
      return this.$route.params.index && parseInt(this.$route.params.index)
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
* {
  box-sizing: border-box;
}

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

section {
  padding: 1em;
}

.loading {
  width: 100%;
  height: 100%;
  flex-shrink: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

a, a:visited {
  color: black;
}

header, footer {
  background-color: #ff86e1;
  padding: 5px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

footer {
  justify-content: center;
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
  flex-grow: 1;
  overflow-y: auto;
}

.container {
  margin: 0 auto;
  width: 800px;
  height: 100%;
  min-height: 100%;
  max-width: 100%;
}
</style>
