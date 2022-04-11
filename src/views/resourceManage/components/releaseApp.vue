<template>
  <el-dialog :visible.sync="tempVal" @close="dialogClose">
    <template slot="title">
      <div
        style="
          height: 20px;
          line-height: 20px;
          border-left: 4px solid #1890ff;
          padding-left: 10px;
        "
      >
        <el-dropdown @command="handleCommand" v-if="stepActive < 3">
          <span
            type="primary"
            plain
            size="mini"
            round
            style="color: #228be6"
            class="el-dropdown-link"
          >
            {{ dialogTitle }}
            <i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="1">
              <i class="iconfont icon-appManage"></i>
              发布应用
            </el-dropdown-item>
            <el-dropdown-item command="2">
              <i class="iconfont icon-desktopManage"></i>
              发布桌面
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <span v-else>{{ dialogTitle }}</span>
      </div>
    </template>
    <div class="stepWrap">
      <div
        class="stepItem"
        v-for="(item, index) in stepList"
        :key="item.title"
        :class="{ ActivateInfo: index < stepActive }"
      >
        <div
          class="stateLine"
          v-show="index > 0"
          :class="{ ActivateLine: index < stepActive }"
        ></div>
        <div class="stepInfo">
          <i :class="'iconfont icon-' + item.icon"></i>
          <span>{{ item.title }}</span>
        </div>
      </div>
    </div>
    <div class="stepContentWrap">
      <span class="describe">{{ describe }}</span>
      <div class="stepContent" v-if="stepActive == 1">
        <table-temp
          :config="DeliveryGroupConfig"
          ref="deliveryGroup"
          @handleSelect="handleDeliveryGroup"
        ></table-temp>
      </div>
      <div class="stepContent" v-if="stepActive == 2">
        <el-tabs
          tab-position="left"
          v-model="activeName"
          v-if="formObj.ResourcesType == 1"
        >
          <el-tab-pane label="从开始菜单" name="menu">
            <div class="radioTable">
              <table-temp
                :config="appConfig"
                ref="appTable"
                @handleSelect="handleAppSelect"
              >
                <template slot-scope="scope" slot="appName">
                  <img :src="baseUrl + scope.row.MenuIcon" width="18px" />
                  <span style="margin-left: 5px">{{
                    scope.row.DisplayName
                  }}</span>
                </template>
              </table-temp>
            </div>
          </el-tab-pane>
          <el-tab-pane label="手动" name="manual">
            <el-form
              :model="formObj"
              :rules="formRules"
              size="small"
              label-width="160px"
              label-position="right"
              ref="manualForm"
            >
              <el-form-item label="可执行文件路径" prop="ExeFullPath">
                <el-input
                  v-model="formObj.ExeFullPath"
                  placeholder="例：C:\ProgramFiles(x86)\internet explore\explore.exe"
                  clearable
                ></el-input>
              </el-form-item>
              <el-form-item label="命令行参数(可选)" prop="ParamsData">
                <el-input
                  v-model="formObj.ParamsData"
                  placeholder="例：http://www.example.com"
                  clearable
                ></el-input>
              </el-form-item>
              <el-form-item
                label="应用名称(面向用户)"
                prop="ApplicationDisplayname"
              >
                <el-input
                  v-model="formObj.ApplicationDisplayname"
                  placeholder="例：Internet Explore"
                  clearable
                ></el-input>
              </el-form-item>
              <el-form-item label="应用名称(面向管理员)" prop="ApplicationName">
                <el-input
                  v-model="formObj.ApplicationName"
                  placeholder="例：Internet Explore-站点"
                  clearable
                ></el-input>
              </el-form-item>
              <el-form-item label="应用说明和关键字" prop="DescriptionStr">
                <el-input
                  v-model="formObj.DescriptionStr"
                  placeholder="例：Internet Explore-站点"
                  clearable
                ></el-input>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
        <el-form
          v-else
          label-width="160px"
          label-position="right"
          ref="desktopForm"
          :model="formObj"
          :rules="formRules"
          size="small"
        >
          <el-form-item label="桌面名称(面向管理员)" prop="ApplicationName">
            <el-input
              v-model="formObj.ApplicationName"
              placeholder="请输入面向管理员的桌面名称"
            ></el-input>
          </el-form-item>
          <el-form-item
            label="桌面名称(面向用户)"
            prop="ApplicationDisplayname"
          >
            <el-input
              v-model="formObj.ApplicationDisplayname"
              placeholder="请输入面向用户的桌面名称"
            ></el-input>
          </el-form-item>
          <el-form-item label="说明" prop="DescriptionStr">
            <el-input
              v-model="formObj.DescriptionStr"
              placeholder="请输入说明"
            ></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div class="stepContent" v-if="stepActive == 3">
        <el-radio v-model="userRadio" label="1">所有用户</el-radio>
        <el-radio v-model="userRadio" label="2">指定用户</el-radio>
        <el-form
          inline
          size="small"
          style="margin-top: 10px"
          label-width="80px"
          label-position="right"
        >
          <el-form-item label="用户名" v-if="userRadio == 2">
            <el-select
              v-model="formObj.Accounts"
              multiple
              filterable
              remote
              reserve-keyword
              placeholder="输入用户关键词进行选择"
              :remote-method="remoteUser"
              :loading="loading"
              style="width: 300px"
              value-key="Name"
            >
              <el-option
                v-for="item in Accounts"
                :key="item.Name"
                :label="item.Name"
                :value="item"
              >
                <span :class="'iconfont icon-' + item.icon"></span>
                <span>{{ item.Name }}</span>
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <span slot="footer">
      <el-button size="small" @click="dialogClose"> 关闭 </el-button>
      <el-button size="small" @click="lastStep" :disabled="stepActive == 1">
        <i class="el-icon-back"></i>
        上一步
      </el-button>
      <el-button size="small" @click="nextStep" :disabled="stepActive == 3">
        下一步
        <i class="el-icon-right"></i>
      </el-button>
      <el-button
        size="small"
        @click="confirm"
        type="primary"
        :disabled="stepActive != 3"
      >
        确认
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
import TableTemp from '@/components/table-temp.vue'
export default {
  name: 'releaseApp',
  props: {
    value: Boolean,
  },
  components: {
    TableTemp,
  },
  data() {
    return {
      dialogTitle: '',
      baseUrl: '',
      activeName: 'menu',
      tempApp: {},
      tempDeliveryGroup: {},
      DeliveryGroup: '',
      loading: false,
      userRadio: '1',
      tempVal: false,
      stepActive: 1,
      checkDeliveryGroup: false,
      checkApp: false,
      userLoading: false,
      Accounts: [],
      formObj: {
        ExeFullPath: '',
        ParamsData: '',
        ApplicationDisplayname: '',
        ApplicationName: '',
        DescriptionStr: '',
        CategoryName: '',
        IconPath: '',
        ResourcesType: 1,
        Accounts: [],
        DeliveryGroupIds: [],
      },
      formRules: {
        ExeFullPath: [
          { required: true, message: '请输入应用程序的路径', trigger: 'blur' },
        ],
        ApplicationDisplayname: [
          {
            required: true,
            message: '请输入面向管理员的应用名称',
            trigger: 'blur',
          },
        ],
        ApplicationName: [
          {
            required: true,
            message: '请输入面向用户的应用名称',
            trigger: 'blur',
          },
        ],
        Accounts: [
          {
            type: 'array',
            required: true,
            message: '请至少选择一个用户可见',
            trigger: 'change',
          },
        ],
        DeliveryGroupIds: [
          {
            type: 'array',
            required: true,
            message: '请至少选择一个交付组',
            trigger: 'change',
          },
        ],
      },
      stepList: [
        {
          title: '交付组',
          describe: '选择交付组',
          icon: 'deliveryGroupManage',
        },
        {
          title: '选择应用',
          describe: '选择应用',
          icon: 'ChooseToApp',
        },
        {
          title: '设置可见性',
          describe: '指定访问所选程序的用户',
          icon: 'SetVisibility',
        },
      ],
      DeliveryGroupConfig: {
        tableData: [],
        maxHeight: '450px',
        selection: true,
        tableSetting: [
          {
            prop: 'Name',
            label: '交付组名称',
          },
        ],
      },
      appConfig: {
        tableData: [],
        maxHeight: '450px',
        selection: true,
        tableSetting: [
          {
            prop: 'DisplayName',
            label: '应用名称',
            slot: 'appName',
            align: 'left',
          },
        ],
        map: { data: 'items' },
        condition: {
          DeliveryGroupId: '',
        },
        fetchUrl: 'GetOpeningMenuApi',
      },
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
  computed: {
    describe() {
      return this.stepList[this.stepActive - 1].describe
    },
  },
  created() {
    this.baseUrl =
      process.env.NODE_ENV === 'production'
        ? this.$store.getters.symSetting.host
        : '/api'
  },
  mounted() {},
  methods: {
    handleCommand(val) {
      if (val == 1) {
        this.dialogTitle = '发布应用'
        this.formObj.ResourcesType = 1
        this.formObj.ApplicationName = ''
        this.formObj.ApplicationDisplayname = ''
        this.formObj.DescriptionStr = ''
        this.stepList[1] = {
          title: '选择应用',
          describe: '选择应用',
          icon: 'ChooseToApp',
        }
        if (this.stepActive == 2) {
          this.GetOpeningMenuApi()
        }
      } else {
        this.dialogTitle = '发布桌面'
        this.formObj.ResourcesType = 2
        this.formObj.ApplicationName = ''
        this.formObj.ApplicationDisplayname = ''
        this.formObj.DescriptionStr = ''
        this.formObj.IconPath = ''
        this.formObj.ExeFullPath=''
        this.formObj.ParamsData=''
        this.CategoryName=''
        this.stepList[1] = {
          title: '桌面属性',
          describe: '桌面属性',
          icon: 'desktopManage',
        }
      }
    },
    remoteUser(query) {
      if (query != '') {
        this.loading = true
        this.$http('GetUserANDUserGroup', {
          LikeName: query,
          ItemsCount: this.$store.getters.symSetting.remoteReturnNum,
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
            this.Accounts = res.items
          })
          .finally(() => {
            this.loading = false
          })
      }
    },
    GetOpeningMenuApi() {
      this.$nextTick(() => {
        this.$refs['appTable'].fetch()
      })
    },
    handleDeliveryGroup(selection, row) {
      this.$refs['deliveryGroup'].clearSelection()
      if (selection.length === 0) {
        this.checkDeliveryGroup = false
        return
      }
      if (row) {
        this.checkDeliveryGroup = true
        this.tempDeliveryGroup = row
        this.$refs['deliveryGroup'].toggleRowSelection(row, true)
        this.formObj.DeliveryGroupIds = [row.Value]
        this.appConfig.condition.DeliveryGroupId = row.Value
      }
    },
    handleAppGroup(data) {
      console.log(data)
    },
    handleAppSelect(selection, row) {
      this.$refs['appTable'].clearSelection()
      if (selection.length === 0) {
        this.checkApp = false
        return
      }
      if (row) {
        this.checkApp = true
        this.$refs['appTable'].toggleRowSelection(row, true)
        this.tempApp = row
        this.formObj.ExeFullPath = row.CommandLineExecutable
        this.formObj.ParamsData = row.CommandLineArguments
        this.formObj.ApplicationDisplayname = row.DisplayName
        this.formObj.ApplicationName = row.DisplayName
        this.formObj.DescriptionStr = row.Description
        this.formObj.IconPath = row.MenuIcon
      }
    },
    getDeliveryGroupData() {
      this.$http('GetDataList', {
        DataType: 0,
        LikeName: '',
        ItemsCount: this.$store.getters.symSetting.remoteReturnNum,
      }).then((res) => {
        this.DeliveryGroupConfig.tableData = res.items
      })
    },
    nextStep() {
      switch (this.stepActive) {
        case 1:
          if (this.formObj.DeliveryGroupIds.length <= 0) {
            this.$message.warning('请选择至少一个交付组')
          } else {
            this.stepActive += 1
            if (this.activeName == 'menu' && this.formObj.ResourcesType == 1) {
              this.GetOpeningMenuApi()
            }
          }
          break
        case 2:
          if (this.formObj.ResourcesType == 1) {
            if (this.activeName == 'manual') {
              this.$refs['manualForm'].validate((valid) => {
                if (valid) {
                  this.stepActive += 1
                }
              })
            } else {
              if (this.checkApp) {
                this.stepActive += 1
              } else {
                this.$message.warning('请选择发布的应用')
              }
            }
          } else {
            this.$refs['desktopForm'].validate((valid) => {
              if (valid) {
                this.stepActive += 1
              }
            })
          }
          break
      }
    },
    lastStep() {
      this.stepActive -= 1
    },
    confirm() {
      if (this.userRadio == 1) {
        this.Accounts = []
      }
      if (this.userRadio == 2 && this.formObj.Accounts.length <= 0) {
        this.$message.warning('请选择至少一个用户可见')
        return
      }
      this.$http('PublishApp', this.formObj).then((res) => {
        this.$message.success(res.errMsg)
        this.stepActive = 1
        this.activeName = 'menu'
        this.formObj = {
          ExeFullPath: '',
          ParamsData: '',
          ApplicationDisplayname: '',
          ApplicationName: '',
          DescriptionStr: '',
          CategoryName: '',
          IconPath: '',
          Accounts: [],
          DeliveryGroupIds: [],
        }
        this.$emit('getDataFlag', false)
        this.$emit('input', false)
      })
    },
    dialogClose() {
      this.formObj = {
        ExeFullPath: '',
        ParamsData: '',
        ApplicationDisplayname: '',
        ApplicationName: '',
        DescriptionStr: '',
        CategoryName: '',
        IconPath: '',
        Accounts: [],
        DeliveryGroupIds: [],
      }
      this.activeName = 'menu'
      this.stepActive = 1
      this.$emit('input', false)
    },
  },
}
</script>

<style lang="scss" scoped>
.stepWrap {
  display: flex;
  flex-direction: row;
  justify-content: center;
  .stepItem {
    height: 50px;
    display: flex;
    flex-direction: row;
    align-items: center;
    .stateLine {
      width: 200px;
      border-top: 3px solid #605e5c;
      height: 1px;
    }
    .ActivateLine {
      border-top: 3px solid #106ebe;
    }
    .stepInfo {
      display: flex;
      flex-direction: column;
      align-items: center;
      .iconfont {
        font-size: 28px;
        margin-bottom: 5px;
      }
    }
  }
}
.ActivateInfo {
  color: #106ebe;
}

.stepContentWrap {
  margin-top: 45px;
  border: 1px solid #dee2e6;
  min-height: 100px;
  position: relative;
  padding: 35px 15px 15px 15px;
  .describe {
    background: white;
    position: absolute;
    top: -10px;
    left: 25px;
  }
}
</style>
