<template>
  <div>
    <ol>
      <li v-for="(poi, index) in pois" :key="poi.imageUrl">
        <router-link :to="{
          name: 'facade',
          params: {
            index: index + 1,
            id: poi.id
          }
        }" >
          <template v-if="poi.osm">
            {{ poi.osm.properties.address }} {{ poi.status }}
          </template>
          <template v-else>
            {{ poi.id }} {{ poi.status }}
          </template>
        </router-link>
      </li>
    </ol>
  </div>
</template>
<script>
export default {
  props: {
    apiUrl: String,
    pois: Array
  }
}
</script>

<style scoped>

</style>