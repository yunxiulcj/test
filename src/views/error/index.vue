<template>
  <div class="error">
    <div class="warning">
      <i class="errr-icon el-icon-warning"></i>
      <span class="text">can not find this page</span>
    </div>
    <router-link class="return-home" to="/">
      返回首页
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'errorPage',
}
</script>

<style lang="scss" scoped>
.error {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  text-align: center;
  font-size: 38px;
  position: relative;
  .warning {
    margin-top: 20%;
    .errr-icon {
      color: #e6a23c;
      margin: 0 10px;
    }
    .text {
      color: #999;
    }
  }
  .return-home {
    font-size: 18px;
    text-decoration: underline;
  }
}
</style>
