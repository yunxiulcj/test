<template>
  <el-container>
    <el-header>
      <div class="logo">
        <img src="../assets/img/logo_head.png" width="130px" />
      </div>
      <div class="appName">{{projectName}}</div>
      <div class="account">
        <span>你好！</span>
        <span class="name">{{ account }}</span>
        <el-button size="mini" type="warning" @click="logout">
          <span class="exitBtn">
            <span>退出</span>
            <i class="iconfont icon-exit"></i> </span
        ></el-button>
      </div>
    </el-header>
    <el-container>
      <el-aside width="200px">
        <el-menu
          :default-active="activeIndex"
          text-color="white"
          background-color="#283144"
          mode="vertical"
          router
        >
          <template v-for="item in menuList">
            <el-submenu
              v-if="item.children && item.children.length > 0"
              :index="item.path"
              :key="item.name"
            >
              <template slot="title">
                <i :class="'iconfont icon-' + item.name"></i>
                <span slot="title">{{ item.label }}</span>
              </template>
              <el-menu-item
                v-for="child in item.children"
                :key="child.name"
                :index="child.path"
              >
                <i :class="'iconfont icon-' + child.name"></i>
                <span slot="title">{{ child.label }}</span>
              </el-menu-item>
            </el-submenu>
            <el-menu-item :key="item.name" :index="item.path" v-else>
              <i :class="'iconfont icon-' + item.name"></i>
              <span slot="title">{{ item.label }}</span>
            </el-menu-item>
          </template>
        </el-menu>
      </el-aside>
      <el-main>
        <div class="appContent">
          <router-view />
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import defaultRouter from '@/app/router/index'
export default {
  name: 'homeFrame',
  data() {
    return {
      projectName:'',
      activeIndex: '',
      account: '',
    }
  },
  computed: {
    menuList() {
      return defaultRouter.options.routes[0].children
    },
  },
  created() {
    this.activeIndex = this.$route.fullPath
    this.projectName=this.$store.getters.symSetting.projectName
  },
  mounted(){
    this.account=localStorage.getItem('account')
  },
  methods: {
    logout() {
      this.$router.push('login')
    },
  },
}
</script>

<style lang="scss">
.el-header {
  padding: 0;
  position: relative;
  background-color: #283144;
  color: white;
  line-height: 60px;
  display: flex;
  flex-direction: row;
  .logo {
    width: 200px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .appName {
    font-size: 16px;
    letter-spacing: 6px;
    margin-left: 10px;
    font-weight: 600;
  }
  .account {
    position: absolute;
    right: 20px;
    font-size: 15px;
    .name {
      margin-right: 18px;
    }
    .exitBtn {
      display: flex;
      align-items: center;
      span {
        margin-right: 5px;
      }
    }
  }
}
.el-aside {
  background-color: #283144;
  color: #333;
  line-height: 200px;
  .iconfont {
    float: left;
    font-size: 25px;
    margin: 0 15px;
  }
}

.el-main {
  background-color: #e9ecef;
  .appContent {
    background: white;
    max-width: 100%;
    height: 100%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
  }
}

.el-container {
  height: 100%;
  width: 100%;
}

.el-container:nth-child(5) .el-aside,
.el-container:nth-child(6) .el-aside {
  line-height: 260px;
}

.el-container:nth-child(7) .el-aside {
  line-height: 320px;
}
</style>
