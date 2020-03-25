<script>
import axios from 'axios'

export default {
  props: {
    apiUrl: String,
    id: String,
  },
  data: function () {
    return {
      data: undefined,
      mask: []
    }
  },
  watch: {
    id: function () {
      this.loadData()
    }
  },
  mounted: function () {
    this.loadData()
  },
  computed: {
    imageUrl: function () {
      if (this.data) {
        return this.data.imageUrl
      } else {
        return ''
      }
    }
  },
  methods: {
    loadData: async function () {
      const id = this.id
      const url = `${this.apiUrl}facades/${id}.json`
      const response = await axios.get(url)

      this.data = response.data

      if (this.data.mask) {
        this.mask = this.data.mask
      } else {
        this.mask = this.makeInitialMask(this.data.streetView.dimensions, 200)
      }
    },
    postMask: async function () {
      const id = this.id
      const mask = this.mask

      await axios({
        method: 'post',
        url: `${this.apiUrl}facades/${id}`,
        data: {
          mask
        }
      })
    }
  }
}
</script>
