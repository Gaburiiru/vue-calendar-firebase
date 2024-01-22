<template>
  <v-container class="text-center white--text">
    <h1 class="mb-5">Vue Calendar</h1>
    <calendar />
  </v-container>
</template>

<script>
  import calendar from '../components/Calendar.vue'

  export default {
    name: 'Home',
    components: {
      calendar,
    },
  }
</script>
