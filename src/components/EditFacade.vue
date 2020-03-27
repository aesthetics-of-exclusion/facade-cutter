<template>
  <div class="facade">
    <img :src="imageUrl" />
    <svg ref="svg"
      viewBox="0 0 2880 1800" xmlns="http://www.w3.org/2000/svg">
      <g>
        <polygon :points="polygonPoints()" style="fill:rgba(70, 90, 200, 0.4);stroke:purple;stroke-width:1" />
      </g>
      <g>
        <line v-for="(point, index) in mask" :key="index"
          :x1="point[0]" :y1="point[1]"
          :x2="previousPoint(index)[0]" :y2="previousPoint(index)[1]"
          stroke-width="5"
          :stroke="color" />
      </g>
      <g>
        <circle v-for="(point, index) in mask" :key="index" :ref="`point${index}`"
          @mousedown="(event) => circleMousedown(event, index)"
          :cx="point[0]" :cy="point[1]" r="15"
          stroke="rgba(0, 0, 0, 255)" stroke-width="5" :fill="color" />
      </g>
    </svg>
  </div>
</template>
<script>
import {update} from 'ramda'

import FacadeAPI from './FacadeAPI'

export default {
  mixins: [FacadeAPI],
  props: {
    apiUrl: String,
    id: String,
  },
  data: function () {
    return {
      color: '#ff86e1'
    }
  },
  mounted: function () {
    document.addEventListener('mouseup', this.mouseupHandler)
  },
  beforeDestroy: function () {
    document.removeEventListener('mouseup', this.mouseupHandler)
  },
  methods: {
    mouseupHandler: function () {
      if (this.mouseMoveHandler) {
        document.removeEventListener('mousemove', this.mouseMoveHandler)
      }

      this.postMask()
    },
    makeInitialMask: function (dimensions, padding) {
      const minX = 0
      const minY = 0
      const maxX = dimensions[0]
      const maxY = dimensions[1]

      return [
        [minX + padding, minY + padding],
        [maxX - padding, minY + padding],
        [maxX - padding, maxY - padding],
        [minX + padding, maxY - padding]
      ]
    },
    previousPoint: function (index) {
      return this.mask[(index - 1 + this.mask.length) % this.mask.length]
    },
    polygonPoints: function () {
      return this.mask.map((point) => point.join(',')).join(' ')
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
      this.mask = update(index, [Math.round(transformedCircle.x), Math.round(transformedCircle.y)], this.mask)
    }
  }
}
</script>

<style scoped>
.facade {
  width: 100%;
  height: 100%;
  flex-shrink: 1;

  position: relative;
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