<template>
  <div class="home">
    <AreThereNaders/>
  </div>
</template>

<script>
// @ is an alias to /src
import AreThereNaders from '@/components/AreThereNaders.vue'

export default {
  name: 'Home',
  components: {
    AreThereNaders
  }
}
</script>
