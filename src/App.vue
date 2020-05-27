<template>
  <div id="app">
    <main>
      <div class="container">
        <div class="loading" v-if="!$route.params.poiId">
          <span>Loading...</span>
        </div>
        <template v-else-if="data && $route.name === 'edit'">
          <EditFacade :data="data" :saveAnnotation="saveAnnotation" />
        </template>
      </div>
    </main>
  </div>
</template>

<script>
import EditFacade from './components/EditFacade'
import FacadeAPI from './components/FacadeAPI'

export default {
  name: 'App',
  mixins: [FacadeAPI],
  components: {
    EditFacade
  },
  data: function () {
    return {
    }
  },
  watch: {
    '$route.params.poiId': function () {
      this.loadAnnotations(this.$route.params.poiId)
    },
    poiId: function (newPoiId) {
      if (newPoiId === this.$route.params.poiId) {
        return
      }

      this.$router.push({
        name: 'edit',
        params: {
          poiId: newPoiId
        }
      })
    }
  },
  computed: {
    poiId: function () {
      return this.data && this.data.id
    }
  },
  mounted: async function () {
    if (this.$route.name === 'main') {
      this.loadAnnotations()
    } else {
      this.loadAnnotations(this.$route.params.poiId)
    }
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
