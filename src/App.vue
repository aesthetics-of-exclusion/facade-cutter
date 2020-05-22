<template>
  <div id="app">
    <main>
      <div class="container">
        <div class="loading" v-if="!$route.params.poiId || !db">
          <span>Loading...</span>
        </div>
        <template v-else-if="$route.name === 'edit'">
          <EditFacade :db="db" :poiId="$route.params.poiId" />
        </template>
        <template v-else-if="$route.name === 'view'">
          <ViewFacade :db="db" :poiId="$route.params.poiId" />
        </template>
        <template v-else>
          Error!
        </template>
      </div>
    </main>
    <section id="firebaseui-auth-container"></section>
  </div>
</template>

<script>
import * as firebase from 'firebase'
import * as firebaseui from 'firebaseui'
import 'firebaseui/dist/firebaseui.css'

const redirectUrl = process.env.VUE_APP_REDIRECT_URL

const uiConfig = {
  signInSuccessUrl: redirectUrl,
  signInFlow: 'popup',
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID
  ]
}

import EditFacade from './components/EditFacade'

export default {
  name: 'App',
  components: {
    EditFacade
  },
  data: function () {
    return {
      db: undefined,
      error: undefined
    }
  },
  watch: {
     '$route.params.poiId': function () {
       if (!this.$route.params.poiId) {
         this.loadScreenshot()
       }
     }
  },
  methods: {
    loadScreenshot: async function () {
      try {
        const query = this.db.collection('pois')
          .where('annotations.facade', '==', 0)
          .limit(1)

        const annotationRefs = await query.get()

        if (annotationRefs.empty) {
          throw new Error('No POIs found')
        } else {
          const poiId = annotationRefs.docs[0].id

          if (this.$route.name === 'main') {
            this.$router.push({
              name: 'edit',
              params: {
                poiId
              }
            })
          }
        }
      } catch (err) {
        console.error(err)
        this.error = err.message
      }
    }
  },
  created: function () {
    firebase.auth().onAuthStateChanged((user) => {
      this.user = user
    })
  },
  mounted: async function () {
    let ui = firebaseui.auth.AuthUI.getInstance()
    if (!ui) {
      ui = new firebaseui.auth.AuthUI(firebase.auth())
    }

    ui.start('#firebaseui-auth-container', uiConfig)
    this.ui = ui

    this.db = firebase.firestore()

    if (this.$route.name === 'main') {
      this.loadScreenshot()
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
