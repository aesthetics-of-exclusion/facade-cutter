<template>
  <div v-if="screenshotAnnotation" class="edit">
    <template v-if="$route.query.metadata === 'show'">
      <h2>{{ name }} </h2>
      <h3>{{ addressAnnotation.data.address }}</h3>
    </template>

    <div class="facade">
      <img :src="screenshotUrl" />
      <svg ref="svg"
        viewBox="0 0 2880 1800" xmlns="http://www.w3.org/2000/svg">
        <g>
          <polygon :points="polygonPoints()" />
        </g>
        <!-- <g>
          <line v-for="({x, y}, index) in mask" :key="index"
            :x1="x" :y1="y"
            :x2="previousPoint(index).x" :y2="previousPoint(index).y"
            stroke-width="5"
            :stroke="color" />
        </g> -->
        <g>
          <circle v-for="({x, y}, index) in mask" :key="index" :ref="`point${index}`"
            @mousedown="(event) => circleMousedown(event, index)"
            @touchstart="(event) => circleTouchstart(event, index)"
            :cx="x" :cy="y" r="30" />
        </g>
      </svg>
    </div>
    <div class="buttons">
      <button class="gradient-button gradient-button-primary" :disabled="saved" @click="save">
        {{ saved ? 'Saved!' : 'Save' }}
      </button>
      <!-- <button class="gradient-button" :disabled="saved" @click="reset">Reset</button> -->
      <button class="gradient-button gradient-button-secondary" @click="next">Next</button>
      <span>{{ message }}</span>
    </div>
  </div>
</template>
<script>
import {update} from 'ramda'


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
    document.addEventListener('touchend', this.touchendHandler)
  },
  beforeDestroy: function () {
    document.removeEventListener('mouseup', this.mouseupHandler)
    document.removeEventListener('touchend', this.touchendHandler)
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
    addressAnnotation: function () {
      return this.annotationsOfType(this.data.annotations, 'address')[0]
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
        this.saved = true
      } catch (err) {
        this.message = `Error saving: ${err.message}!`
      }
    },
    next: function () {
      this.$router.push({
        name: 'main',
        query: this.$route.query
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
    touchendHandler: function () {
      if (this.touchmoveHandler) {
        document.removeEventListener('touchmove', this.touchmoveHandler)
      }
    },
    mouseupHandler: function () {
      if (this.mousemoveHandler) {
        document.removeEventListener('mousemove', this.mousemoveHandler)
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
    // previousPoint: function (index) {
    //   return this.mask[(index - 1 + this.mask.length) % this.mask.length]
    // },
    polygonPoints: function () {
      return this.mask.map((point) => [point.x, point.y].join(',')).join(' ')
    },
    circleMousedown: function (event, index) {
      this.mousemoveHandler = (event) => this.circleMousemove(event, index)
      document.addEventListener('mousemove', this.mousemoveHandler)
    },
    circleTouchstart: function (event, index) {
      this.touchmoveHandler = (event) => this.circleTouchmove(event, index)
      document.addEventListener('touchmove', this.touchmoveHandler)
    },
    circleTouchmove: function (event, index) {
      const x = event.touches[0].pageX
      const y = event.touches[0].pageY
      this.circleMove(x, y, index)
    },
    circleMousemove: function (event, index) {
      const x = event.pageX
      const y = event.pageY
      this.circleMove(x, y, index)
    },
    circleMove: function (eventX, eventY, index) {
      const svg = this.$refs.svg

      const circle = svg.createSVGPoint()
      circle.x = eventX
      circle.y = eventY

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
  font-size: 2.6rem;
  margin: .5rem;
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

.facade svg circle {
  stroke: white;
  stroke-width: 10;
  fill: rgba(247, 6, 131, 1);
}

.facade svg polygon {
  fill: rgba(255, 255, 255, 0.05);
  stroke: rgba(7, 248, 134, 1);
  stroke-width: 10;
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

.gradient-button {
  color: #fff;
  text-transform: uppercase;
  font-weight: 800;
  text-decoration: none;
  text-align: center;
  font-size: 2.6rem;
  line-height: 12rem;
  border: none;
  border-radius: 5rem;
  height: 12rem;
  width: 12rem;
  box-shadow: 0 0 5px rgba(0, 0, 0, .1);
  margin: 0 auto;
  display: block;

  background: rgba(100,100,100,1);
  background: linear-gradient(48deg, rgba(100,100,100,1) 0%, rgba(150,150,150,1) 100%);
}

.gradient-button:hover {
  color: #fff;
  background: #323232;
}

.gradient-button-primary {
  background: rgb(169,84,168);
  background: linear-gradient(48deg, rgba(169,84,168,1) 0%, rgba(247,6,131,1) 100%);
}

.gradient-button-secondary {
  background: rgb(59,190,189);
  background: linear-gradient(48deg, rgba(59,190,189,1) 0%, rgba(7,248,134,1) 100%);
}

.gradient-button:disabled {
  background: rgb(180, 180, 180);
  background: linear-gradient(48deg, rgb(180, 180, 180) 0%, rgb(220, 220, 220) 100%);
}
</style>