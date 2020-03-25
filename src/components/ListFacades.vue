<template>
  <section>
    <ol>
      <li v-for="(poi, index) in pois" :key="poi.imageUrl">
         {{ poi.status }}
        <router-link :to="{
          name: 'edit',
          params: {
            index: index + 1,
            id: poi.id
          }
        }">
          <template v-if="poi.osm">{{ poi.osm.properties.address }}</template>
          <template v-else>{{ poi.id }}</template>
        </router-link> <router-link v-if="poi.status === '✅'" :to="{
          name: 'view',
          params: {
            index: index + 1,
            id: poi.id
          }
        }">View</router-link>
      </li>
    </ol>
  </section>
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