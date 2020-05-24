<script>
export default {
  props: {
    db: Object,
    poiId: String
  },
  data: function () {
    return {
      annotations: [],
      facadeAnnotationRef: undefined,
      mask: [],
      error: undefined
    }
  },
  watch: {
    poiId: function () {
      this.loadData(this.poiId)
    }
  },
  mounted: function () {
    this.loadData(this.poiId)
  },
  computed: {
    screenshotUrl: function () {
      if (this.screenshotAnnotation) {
        return this.screenshotAnnotation.data.screenshotUrl
      } else {
        return ''
      }
    },
    osmAnnotation: function () {
      return this.annotationsOfType(this.annotations, 'osm')[0]
    },
    facadeAnnotation: function () {
      return this.annotationsOfType(this.annotations, 'facade')[0]
    },
    screenshotAnnotation: function () {
      return this.annotationsOfType(this.annotations, 'screenshot')[0]
    }
  },
  methods: {
    annotationsOfType: function (annotations, type) {
      return annotations.filter((annotation) => annotation.type === type)
    },
    loadData: async function (poiId) {
      try {
        const query = this.db.collection('pois')
          .doc(poiId)
          .collection('annotations')
          .where('type', 'in', ['osm', 'screenshot', 'facade'])

        const annotationRefs = await query.get()

        if (annotationRefs.empty) {
          throw new Error(`No screenshot annotation found for POI with ID ${this.poiId}`)
        } else {
          this.annotations = annotationRefs.docs.map((doc) => doc.data())

          if (this.facadeAnnotation) {
            const facadeAnnotationRefs = annotationRefs.docs.filter((doc) => doc.data().type === 'facade')
            this.facadeAnnotationRef = facadeAnnotationRefs[0]
          } else {
            this.facadeAnnotationRef = this.db
              .collection('pois')
              .doc(poiId)
              .collection('annotations')
              .doc()
          }
        }
      } catch (err) {
        console.error(err)
        this.error = err.message
      }
    },
    saveAnnotation: async function (annotationId, type, data) {
      let dateCreated = new Date()
      if (this.facadeAnnotation) {
        dateCreated = this.facadeAnnotation.dateCreated
      }

      const poiRef = this.getPoiRef(this.poiId)
      const updatedPoiRef = await poiRef.collection('annotations').doc(annotationId).set({
        poiId: this.poiId,
        type,
        data,
        dateCreated,
        dateUpdated: new Date()
      })

      return updatedPoiRef
    },
    getPoiRef: function (poiId) {
      return this.db.collection('pois').doc(poiId)
    }
  }
}
</script>
