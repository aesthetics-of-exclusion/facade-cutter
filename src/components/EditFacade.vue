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
      <button @click="save">Save</button>
      <button @click="next">Next</button>
    </div>
  </div>
  <div v-else>
    Nee!
  </div>
</template>
<script>
import {update} from 'ramda'

import FacadeAPI from './FacadeAPI'

export default {
  mixins: [FacadeAPI],
  props: {
    poiId: String
  },
  data: function () {
    return {
      color: '#ff86e1',
      dimensions: [],
      mask: []
    }
  },
  watch: {
    annotations: function () {
      if (this.screenshotAnnotation) {
        this.dimensions = this.screenshotAnnotation.data.dimensions
      }

      if (this.facadeAnnotation) {
        this.mask = this.facadeAnnotation.data.mask
      } else if (this.screenshotAnnotation) {
        this.mask = this.makeInitialMask(this.dimensions, 200)
      }
    }
  },
  mounted: function () {
    document.addEventListener('mouseup', this.mouseupHandler)
  },
  beforeDestroy: function () {
    document.removeEventListener('mouseup', this.mouseupHandler)
  },
  computed: {
    name: function () {
      return this.osmAnnotation && this.osmAnnotation.data.properties.name
    }
  },
  methods: {
    save: function () {
      this.saveAnnotation(this.facadeAnnotationRef.id, 'facade', {
        mask: this.mask
      })
    },
    next: function () {
      this.$router.push({
        name: 'main'
      })
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
</style>