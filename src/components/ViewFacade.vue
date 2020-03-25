<template>
  <section class="container">
    <div>
      <h2>Masked:</h2>
      <canvas id="masked" ref="masked" :width="`${width}px`" :height="`${height}px`" />
      <button @click="downloadMasked">Download as PNG</button>
    </div>
    <div>
      <h2>Square:</h2>
      <canvas id="square" ref="square" :width="`${square}px`" :height="`${square}px`" />
      <button @click="downloadSquare">Download as PNG</button>
    </div>
    <!-- <div>
      <h2>Perspective:</h2>
      <canvas id="perspective" ref="perspective" :width="`${square}px`" :height="`${square}px`" />
      <button @click="downloadPerspective">Download as PNG</button>
    </div> -->
  </section>
</template>
<script>
import FacadeAPI from './FacadeAPI'

export default {
  mixins: [FacadeAPI],
  props: {
    apiUrl: String,
    id: String,
  },
  data: function () {
    return {
      image: undefined
    }
  },
  watch: {
    imageUrl: function () {
      if (this.imageUrl) {
        this.loadImage()
      }
    },
    image: function () {
      this.drawMasked()
      this.drawSquare()
      this.drawPerspective()
    }
  },
  computed: {
    square: function () {
      if (this.width && this.height) {
        return Math.max(this.width, this.height)
      }

      return undefined
    },
    squareCorner: function () {
      if (this.width && this.height) {
        if (this.width > this.height) {
          return [
            this.domainX[0],
            this.domainY[0] + this.height / 2 - this.width / 2
          ]
        } else {
          return [
            this.domainX[0] + this.width / 2 - this.height / 2,
            this.domainY[0]
          ]
        }
      }

      return undefined
    },
    width: function () {
      if (this.domainX) {
        return this.domainX[1] - this.domainX[0]
      }

      return undefined
    },
    height: function () {
      if (this.domainY) {
        return this.domainY[1] - this.domainY[0]
      }

      return undefined
    },
    domainX: function () {
      if (this.mask.length) {
        return this.domain(this.mask, (coordinate) => coordinate[0])
      }

      return undefined
    },
    domainY: function () {
      if (this.mask.length) {
        return this.domain(this.mask, (coordinate) => coordinate[1])
      }

      return undefined
    }
  },
  methods: {
    downloadMasked: function () {
      this.downloadPng('masked')
    },
    downloadSquare: function () {
      this.downloadPng('square')
    },
    downloadPerspective: function () {
      this.downloadPng('perspective')
    },
    downloadPng: function (ref) {
      const link = document.createElement('a')
      link.download = `${this.id}-${ref}.png`
      link.href = this.$refs[ref].toDataURL('image/png;base64')
      link.click()
    },
    drawMasked: function () {
      const masked = this.$refs.masked
      const context = masked.getContext('2d')

      const translate = (coordinate) => [
        coordinate[0] - this.domainX[0],
        coordinate[1] - this.domainY[0]
      ]

      const mask = this.mask.map(translate)

      context.beginPath()
      context.moveTo(...mask[0])
      for (let coordinate of mask.slice(1)) {
        context.lineTo(...coordinate)
      }
      context.clip()

      context.drawImage(this.image, this.domainX[0], this.domainY[0], this.width, this.height, 0, 0, this.width, this.height)
    },
    drawSquare: function () {
      const squareCanvas = this.$refs.square
      const context = squareCanvas.getContext('2d')

      const corner = this.squareCorner

      context.drawImage(this.image, corner[0], corner[1], this.square, this.square, 0, 0, this.square, this.square)
    },
    drawPerspective: function () {
      // https://stackoverflow.com/questions/14244032/redraw-image-from-3d-perspective-to-2d/14244616#14244616
    },
    domain: function (mask, fn) {
      const nums = mask.map(fn)
      const min = Math.min(...nums)
      const max = Math.max(...nums)
      return [min, max]
    },
    loadImage: function () {
      const image = new Image()
      image.crossOrigin = 'Anonymous'
      image.src = this.imageUrl

      image.onload = () => {
        this.image = image
      }
    },
    previousPoint: function (index) {
      return this.mask[(index - 1 + this.mask.length) % this.mask.length]
    },
    polygonPoints: function () {
      return this.mask.map((point) => point.join(',')).join(' ')
    }
  }
}
</script>

<style scoped>
canvas {
  max-width: 100%;
  max-height: 100%;
}
</style>