<template>
  <el-dialog :visible.sync="tempVal" @close="dialogClose" width="650px">
    <template slot="title">
      <div
        style="
          height: 20px;
          line-height: 20px;
          border-left: 4px solid #1890ff;
          padding-left: 10px;
        "
      >
        编辑应用
      </div>
    </template>
    <!-- <el-tabs v-model="activeName">
      <el-tab-pane label="应用属性" name="form"> -->
    <el-form
      :model="formObj"
      :rules="formRules"
      ref="formObj"
      size="small"
      label-width="150px"
      label-position="right"
      style="width: 520px"
    >
      <!-- <el-form-item label="可执行文件路径" prop="ExePath">
        <el-input
          v-model="formObj.ExePath"
          disabled
          placeholder="例：C:\ProgramFiles(x86)\internet explore\explore.exe"
          clearable
        ></el-input>
      </el-form-item> -->
      <el-form-item label="命令行参数(可选)" prop="ParamsData">
        <el-input
          v-model="formObj.ParamsData"
          placeholder="例：http://www.example.com"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item label="应用名称(面向用户)" prop="ApplicationDisplayname">
        <el-input
          v-model="formObj.ApplicationDisplayname"
          placeholder="例：Internet Explore"
          clearable
        ></el-input>
      </el-form-item>
      <!-- <el-form-item label="应用名称(面向管理员)" prop="ApplicationName">
        <el-input
          v-model="formObj.ApplicationName"
          placeholder="例：Internet Explore-站点"
          clearable
          disabled
        ></el-input>
      </el-form-item> -->
      <el-form-item label="应用说明和关键字" prop="DescriptionStr">
        <el-input
          v-model="formObj.DescriptionStr"
          placeholder="例：Internet Explore-站点"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item label="应用分类" style="margin-buttom: 10px">
        <span slot="label">
          应用分类
          <el-tooltip
            class="item"
            effect="dark"
            content="Right Center 提示文字"
            placement="bottom"
          >
            <i class="el-icon-info"></i>
          </el-tooltip>
        </span>

        <el-input
          v-model="formObj.CategoryName"
          placeholder="请输入应用分类"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item label="用户可见性">
        <el-select
          v-model="formObj.Accounts"
          multiple
          filterable
          remote
          reserve-keyword
          placeholder="请输入用户关键词"
          :remote-method="remoteUser"
          :loading="loading"
          style="width: 370px"
          value-key="Name"
        >
          <el-option
            v-for="item in users"
            :key="item.Name"
            :label="item.Name"
            :value="item"
          >
            <span :class="'iconfont icon-' + item.icon"></span>
            <span>{{ item.Name }}</span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="交付组">
        <el-select
          v-model="formObj.DeliveryGroupIds"
          multiple
          filterable
          remote
          reserve-keyword
          placeholder="请输入交付组关键词"
          :remote-method="getDeliveryGroup"
          :loading="loading1"
          style="width: 370px"
          value-key="DeliveryGroupName"
        >
          <el-option
            v-for="item in DeliveryGroupList"
            :key="item.DeliveryGroupId"
            :label="item.DeliveryGroupName"
            :value="item"
          >
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <!-- </el-tab-pane>
      <el-tab-pane label="用户可见性" name="user">

      </el-tab-pane>
    </el-tabs> -->

    <span slot="footer">
      <el-button size="small" @click="dialogClose"> 关闭 </el-button>
      <el-button size="small" @click="confirm" type="primary"> 确认 </el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'editApp',
  props: {
    value: Boolean,
    appDetail: Object,
  },
  data() {
    return {
      users: [],
      activeName: 'form',
      DeliveryGroupList: [],
      loading: false,
      loading1: false,
      tempVal: false,
      formObj: {
        AppId: '',
        // WorkPath: '',
        ParamsData: '',
        // ExeFullPath: '',
        ApplicationDisplayname: '',
        // ApplicationName: '',
        DescriptionStr: '',
        CategoryName: '',
        Accounts: [],
        DeliveryGroupIds: [],
      },
      formRules: {},
    }
  },
  watch: {
    value: {
      handler(val) {
        this.tempVal = val
      },
      immediate: true,
    },
  },
  methods: {
    remoteUser(query) {
      if (query != '') {
        this.loading = true
        this.$http('GetUserANDUserGroup', {
          LikeName: query,
          ItemsCount: 5,
          DataType: -1,
        })
          .then((res) => {
            res.items.map((item) => {
              if (item.Type == 0) {
                item['icon'] = 'user'
              } else {
                item['icon'] = 'userGroup'
              }
            })
            this.users = res.items
          })
          .finally(() => {
            this.loading = false
          })
      }
    },
    remoteDeliveryGroup(val) {
      if (val != '') {
        this.getDeliveryGroup(val)
      }
    },
    getDeliveryGroup(val) {
      this.loading1 = true
      this.$http('GetDataList', { DataType: 0, LikeName: val, ItemsCount: 5 })
        .then((res) => {
          this.DeliveryGroupList = res.items.map((item) => {
            return { DeliveryGroupId: item.Value, DeliveryGroupName: item.Name }
          })
        })
        .finally(() => {
          this.loading1 = false
        })
    },
    initFormObj(data) {
      this.formObj.AppId = data.AppId
      this.formObj.ParamsData = data.ParamsData
      this.formObj.ApplicationDisplayname = data.ApplicationDisplayname
      this.formObj.DescriptionStr = data.DescriptionStr
      this.formObj.CategoryName = data.CategoryName
      this.formObj.Accounts = data.Accounts
      this.formObj.DeliveryGroupIds = data.DeliveryGroups
       data.Accounts.map((item) => {
        if (item.Type == 0) {
          item['icon'] = 'user'
        } else {
          item['icon'] = 'userGroup'
        }
      })
      this.users =data.Accounts
      this.DeliveryGroupList = data.DeliveryGroups
    },
    confirm() {
      this.$refs['formObj'].validate((valid) => {
        if (valid) {
          this.$http('UpdateApp', this.formObj).then((res) => {
            this.$message.success(res.errMsg)
            this.$emit('input', false)
          })
        }
      })
    },
    dialogClose() {
      this.$emit('input', false)
    },
  },
}
</script>
