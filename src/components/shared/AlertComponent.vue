<template>
  <v-alert v-if="show" :type="type" class="alert" variant="tonal" >
    <h5 class="text-h6 text-capitalize">{{ type === 'success' ? 'Success' : 'Warning' }}</h5>
    <div>{{ message }}</div>
  </v-alert>
</template>

<script>
export default {
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: 'success',
    },
  },
  watch: {
    show(newVal) {
      if (newVal) {
        console.log("AlertComponent 활성화:", this.message);
      } else {
        console.log("AlertComponent 비활성화");
      }
    },
  },
};
</script>
<style scoped>
.alert {
  position: fixed;
  top: 16%;
  left: 90%;
  transform: translateX(-50%);
  z-index: 3000;
  width: 100%;
  max-width: 17%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  font-size: 15px;
}
</style>