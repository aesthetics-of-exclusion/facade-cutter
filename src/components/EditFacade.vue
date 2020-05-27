<template>
  <div v-if="screenshotAnnotation" class="edit">
    <h2>{{ name }} </h2>
    <div class="facade">
      <img :src="screenshotUrl" />
      <svg ref="svg"
        viewBox="0 0 2880 1800" xmlns="http://www.w3.org/2000/svg">
        <g>
          <polygon :points="polygonPoints()" style="fill:rgba(70, 90, 200, 0.4);stroke:purple;stroke-width:1" />
        </g>
        <g>
          <line v-for="({x, y}, index) in mask" :key="index"
            :x1="x" :y1="y"
            :x2="previousPoint(index).x" :y2="previousPoint(index).y"
            stroke-width="5"
            :stroke="color" />
        </g>
        <g>
          <circle v-for="({x, y}, index) in mask" :key="index" :ref="`point${index}`"
            @mousedown="(event) => circleMousedown(event, index)"
            :cx="x" :cy="y" r="15"
            stroke="rgba(0, 0, 0, 255)" stroke-width="5" :fill="color" />
        </g>
      </svg>
    </div>
    <div class="buttons">
      <button :disabled="saved" @click="save">✅ Opslaan</button>
      <button :disabled="saved" @click="reset">🔄 Reset</button>
      <button @click="next">➡️ Volgende</button>
      <span>{{ message }}</span>
    </div>
  </div>
</template>
<script>
import {update} from 'ramda'

import FacadeAPI from './FacadeAPI'

export default {
  props: {
    data: Object,
    saveAnnotation: Function
  },
  data: function () {
    return {
      color: '#ff86e1',
      saved: false,
      message: '',
      dimensions: [],
      mask: []
    }
  },
  watch: {
    data: function () {
     this.newAnnotations()
    }
  },
  mounted: function () {
    this.newAnnotations()
    document.addEventListener('mouseup', this.mouseupHandler)
  },
  beforeDestroy: function () {
    document.removeEventListener('mouseup', this.mouseupHandler)
  },
  computed: {
    name: function () {
      if (this.osmAnnotation) {
        return this.osmAnnotation.data.properties.name
      } else if (this.faillissementsdossierAnnotation) {
        return this.faillissementsdossierAnnotation.data.name
      } else {
        return ''
      }
    },
    screenshotUrl: function () {
      if (this.screenshotAnnotation) {
        return this.screenshotAnnotation.data.screenshotUrl
      } else {
        return ''
      }
    },
    faillissementsdossierAnnotation: function () {
      return this.annotationsOfType(this.data.annotations, 'faillissementsdossier')[0]
    },
    osmAnnotation: function () {
      return this.annotationsOfType(this.data.annotations, 'osm')[0]
    },
    facadeAnnotation: function () {
      return this.annotationsOfType(this.data.annotations, 'facade')[0]
    },
    screenshotAnnotation: function () {
      return this.annotationsOfType(this.data.annotations, 'screenshot')[0]
    }
  },
  methods: {
    newAnnotations: function () {
       if (this.screenshotAnnotation) {
        this.dimensions = this.screenshotAnnotation.data.dimensions
      }

      if (this.facadeAnnotation) {
        this.mask = this.facadeAnnotation.data.mask
        this.saved = true
      } else if (this.screenshotAnnotation) {
        this.mask = this.makeInitialMask(this.dimensions, 200)
        this.saved = false
      }
    },
    annotationsOfType: function (annotations, type) {
      return annotations.filter((annotation) => annotation.type === type)
    },
    save: async function () {
      const poiId = this.data.id
      const annotationId = this.facadeAnnotation && this.facadeAnnotation.id

      try {
        await this.saveAnnotation(poiId, 'facade', {
          mask: this.mask
        }, annotationId)
        this.message = 'Opgeslagen!'
        this.saved = true
      } catch (err) {
        this.message = `Error saving: ${err.message}!`
      }
    },
    next: function () {
      this.$router.push({
        name: 'main'
      })
    },
    reset: function () {
      if (this.facadeAnnotation) {
        this.mask = this.facadeAnnotation.data.mask
        this.saved = true
      } else {
        this.mask = this.makeInitialMask(this.dimensions, 200)
        this.saved = false
      }
    },
    mouseupHandler: function () {
      if (this.mouseMoveHandler) {
        document.removeEventListener('mousemove', this.mouseMoveHandler)
      }
    },
    makeInitialMask: function (dimensions, padding) {
      const minX = 0
      const minY = 0
      const maxX = dimensions[0]
      const maxY = dimensions[1]

      return [
        {x: minX + padding, y: minY + padding},
        {x: maxX - padding, y: minY + padding},
        {x: maxX - padding, y: maxY - padding},
        {x: minX + padding, y: maxY - padding}
      ]
    },
    previousPoint: function (index) {
      return this.mask[(index - 1 + this.mask.length) % this.mask.length]
    },
    polygonPoints: function () {
      return this.mask.map((point) => [point.x, point.y].join(',')).join(' ')
    },
    circleMousedown: function (event, index) {
      this.mouseMoveHandler = (event) => this.circleMousemove(event, index)
      document.addEventListener('mousemove', this.mouseMoveHandler)
    },
    circleMousemove: function (event, index) {
      const svg = this.$refs.svg

      const circle = svg.createSVGPoint()
      circle.x = event.pageX
      circle.y = event.pageY

      const transformedCircle = circle.matrixTransform(svg.getScreenCTM().inverse())

      const x = Math.round(transformedCircle.x)
      const y = Math.round(transformedCircle.y)

      const coordinate = {
        x: Math.min(Math.max(0, x), this.dimensions[0]),
        y: Math.min(Math.max(0, y), this.dimensions[1])
      }

      this.mask = update(index, coordinate, this.mask)
      this.saved = false
    }
  }
}
</script>

<style scoped>
h1, h2, h3 {
  text-align: center;
}

.edit {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.facade {
  width: 100%;
  height: 100%;
  flex-shrink: 1;

  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.facade > * {
  position: absolute;
  top: 0;
}

.facade img,
.facade svg {
  max-width: 100%;
  max-height: 100%;
}

.facade svg circle,
.facade svg line {
  cursor: pointer;
}

.buttons {
  display: flex;
  justify-content: center;
  padding: 1em;
  align-items: center;
}

.buttons button {
  margin: 5px;
}

</style>