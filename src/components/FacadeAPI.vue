<script>
import axios from 'axios'

const apiUrl = process.env.VUE_APP_API_URL

export default {
  data: function () {
    return {
      data: undefined,
      done: false,
      error: undefined
    }
  },
  methods: {
    saveAnnotation: function (poiId, annotationType, data, annotationId) {
      let url
      if (annotationId) {
        url = `${apiUrl}/${poiId}/${annotationType}/${annotationId}`
      } else {
        url = `${apiUrl}/${poiId}/${annotationType}`
      }

      return axios.post(url, data)
    },
    loadAnnotations: async function (poiId) {
      let url
      if (poiId) {
        url = `${apiUrl}/${poiId}`
      } else {
        url = `${apiUrl}/next/facade`
      }

      try {
        const response = await axios.get(url)
        this.data = response.data
      } catch (err) {
        if (err.response && err.response.status === 404) {
          this.done = true
        } else {
          this.error = err.message
        }
      }
    }



//  loadScreenshot: async function () {
//       try {
//         const query = this.db.collection('pois')
//           .where('annotations.facade', '==', 0)
//           .limit(1)

//         const annotationRefs = await query.get()

//         if (annotationRefs.empty) {
//           throw new Error('No POIs found')
//         } else {
//           const poiId = annotationRefs.docs[0].id

//           if (this.$route.name === 'main') {
//             this.$router.push({
//               name: 'edit',
//               params: {
//                 poiId
//               }
//             })
//           }
//         }
//       } catch (err) {
//         console.error(err)
//         this.error = err.message
//       }
//     }
//   },




//     loadData: async function (poiId) {
//       try {
//         const query = this.db.collection('pois')
//           .doc(poiId)
//           .collection('annotations')
//           .where('type', 'in', ['osm', 'screenshot', 'facade'])

//         const annotationRefs = await query.get()

//         if (annotationRefs.empty) {
//           throw new Error(`No screenshot annotation found for POI with ID ${this.poiId}`)
//         } else {
//           this.annotations = annotationRefs.docs.map((doc) => doc.data())

//           if (this.facadeAnnotation) {
//             const facadeAnnotationRefs = annotationRefs.docs.filter((doc) => doc.data().type === 'facade')
//             this.facadeAnnotationRef = facadeAnnotationRefs[0]
//           } else {
//             this.facadeAnnotationRef = this.db
//               .collection('pois')
//               .doc(poiId)
//               .collection('annotations')
//               .doc()
//           }
//         }
//       } catch (err) {
//         console.error(err)
//         this.error = err.message
//       }
//     },
//     saveAnnotation: async function (annotationId, type, data) {
//       let dateCreated = new Date()
//       if (this.facadeAnnotation) {
//         dateCreated = this.facadeAnnotation.dateCreated
//       }

//       const poiRef = this.getPoiRef(this.poiId)
//       const updatedPoiRef = await poiRef.collection('annotations').doc(annotationId).set({
//         poiId: this.poiId,
//         type,
//         data,
//         dateCreated,
//         dateUpdated: new Date()
//       })

//       return updatedPoiRef
//     },
//     getPoiRef: function (poiId) {
//       return this.db.collection('pois').doc(poiId)
//     }
  }
}
</script>
