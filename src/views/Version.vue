<template>
  <div class="mt-3">
    <h3>Are There Tornadoes: v{{ version }}</h3>
    <h4>Created by Geordi Dosher</h4>
  </div>
</template>

<script>
import { versionNum } from '../variables.js';

export default {
  name: 'Version',
  data() {
    return {
      version: versionNum,
    };
  },
};
</script>
