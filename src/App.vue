<template>
  <div id="app">
    <main>
      <div class="container">
        <template v-if="done">
          <p class="text">Done! All work is done.</p>
        </template>
        <template v-else-if="error">
          <p class="text error">{{ error }}</p>
        </template>
        <template v-else-if="!$route.params.poiId">
          <span class="text loading">Loading…</span>
        </template>
        <template v-else-if="data && $route.name === 'edit'">
          <EditFacade :data="data" :saveAnnotation="saveAnnotation" />
        </template>
      </div>
    </main>
  </div>
</template>

<script>
import EditFacade from './components/EditFacade'
import API from './components/API'

export default {
  name: 'App',
  mixins: [API],
  components: {
    EditFacade
  },
  data: function () {
    return {
    }
  },
  watch: {
    '$route.params.poiId': function () {
      this.loadAnnotations(this.$route.params.poiId, this.$route.query.source)
    },
    poiId: function (newPoiId) {
      if (newPoiId === this.$route.params.poiId) {
        return
      }

      this.$router.push({
        name: 'edit',
        params: {
          poiId: newPoiId
        },
        query: this.$route.query
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
      this.loadAnnotations(undefined, this.$route.query.source)
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

html, body {
  font-family: proxima-nova, sans-serif;
  font-size: 62.5%;
}

@media screen and (max-width: 569px) {
  html {
    font-size: 37.5%;
  }
}

@media screen and (min-width: 570px) {
  html {
    font-size: 45%;
  }
}

@media screen and (min-width: 620px) {
  html{
    font-size: 47.5%;
  }
}
@media screen and (min-width: 680px) {
  html {
    font-size: 50%;
  }
}

@media screen and (min-width: 720px){
  html{
    font-size: 52.5%;
  }
}
@media screen and (min-width: 800px) {
  html {
    font-size: 55%;
  }
}

@media screen and (min-width: 860px){
  html {
    font-size: 57.5%;
  }
}

@media screen and (min-width: 920px) {
  html {
    font-size: 60%;
  }
}

@media screen and (min-width: 1000px) {
  html {
    font-size: 62.5%;
  }
}

body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  top: 0;
  position: absolute;
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

.text {
  width: 100%;
  height: 100%;
  flex-shrink: 1;
  font-size: 2.6rem;
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
  display: flex;
}

.container {
  margin: 0 auto;
  width: 800px;
  max-width: 100%;
  display: flex;
  justify-content: center;
}
</style>
