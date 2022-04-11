<template>
  <div class="pageWrap">
    <el-form size="small" inline>
      <el-form-item label="会话状态">
        <el-select v-model="config.condition.SessionStatus" style="width: 200px">
          <el-option
            v-for="item in sessionType"
            :key="item.value"
            :value="item.value"
            :label="item.label"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select
          v-model="config.condition.DeliveryGroupId"
          filterable
          remote
          placeholder="请输入交付组关键词"
          :remote-method="remoteDeliveryGroup"
          :loading="loading1"
          clearable
          @clear="remoteDeliveryGroup"
        >
          <el-option
            v-for="item in DeliveryGroupList"
            :key="item.Value"
            :label="item.Name"
            :value="item.Value"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select
            v-model="config.condition.MachineDNSName"
            filterable
            remote
            placeholder="请输入计算机关键词"
            :remote-method="remoteComputer"
            :loading="computerLoading"
            clearable
            @clear="remoteComputer"
          >
            <el-option
              v-for="item in machines"
              :key="item.Value"
              :label="item.Name"
              :value="item.Name"
            >
            </el-option>
          </el-select>
      </el-form-item>
      <el-form-item>
        <el-select
            v-model="config.condition.UserName"
            filterable
            remote
            placeholder="请输入用户关键词"
            :remote-method="remoteUser"
            :loading="userLoading"
            clearable
            clear="remoteUser"
          >
            <el-option
              v-for="item in users"
              :key="item.Name"
              :label="item.Name"
              :value="item.Name"
            >
              <span :class="'iconfont icon-' + item.icon"></span>
              <span>{{ item.Name }}</span>
            </el-option>
          </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="getData" type="primary" icon="el-icon-search">查询</el-button>
      </el-form-item>
    </el-form>
    <div class="tableWrap">
      <table-temp :config="config" ref="table"></table-temp>
    </div>
  </div>
</template>

<script>
import tableTemp from '@/components/table-temp.vue'
export default {
  name: 'sessionManage',
  components: {
    tableTemp,
  },
  data() {
    return {
      sessionType: [
        {
          label: '全部',
          value: '-1',
        },
        {
          label: '活跃',
          value: '1',
        },
        {
          label: '断开',
          value: '0',
        },
      ],
      DeliveryGroupList:[],
      loading1:false,
      machines:[],
      computerLoading:false,
      users:[],
      userLoading:false,
      config: {
        tableData: [],
        maxHeight: '10000px',
        tableSetting: [
          {
            prop: 'UserName',
            label: '用户名',
          },
          {
            prop: 'SessionStatusStr',
            label: '会话状态',
            style:(row)=>{
              return row.ConnectionState==1 ? {color:'#40c057'}:{color:'#f03e3e'}
            }
          },
          {
            prop: 'SessionStartTime',
            label: '会话开始时间',
          },
          {
            prop: 'SessionConnectTime',
            label: '会话连接时间',
          },
          {
            prop: 'MachineDNSName',
            label: '服务器',
          },
          {
            prop: 'DeliveryGroupName',
            label: '交付组',
          },
        ],
        operation: {
          btns: [
            {
              label: '断开',
              type: 'text',
              style: { color: '#f03e3e' },
              show:(row)=>{return row.ConnectionState==1},
              fn: (row) => {
                console.log(row)
                this.$confirm(`是否要断开该会话?`, '提示', {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  type: 'warning',
                }).then(() => {
                  this.SessionOption(row.SessionKey, 0)
                })
              },
            },
            {
              label: '注销',
              type: 'text',
              style: { color: '#f59f00' },
              fn: (row) => {
                console.log(row)
                this.$confirm(`是否要注销该会话?`, '提示', {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  type: 'warning',
                }).then(() => {
                  this.SessionOption(row.SessionKey, 1)
                })
              },
            },
            {
              label: '发送消息',
              type: 'text',
              fn: (row) => {
                this.$prompt('请输入发送内容', '提示', {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  inputPattern: /^.+$/,
                  inputErrorMessage: '发送消息不能为空',
                }).then(({ value }) => {
                  this.SessionOption(row.SessionKey, 2, value)
                })
              },
            },
          ],
        },
        condition: {
          DeliveryGroupId: '',
          MachineDNSName: '',
          UserName: '',
          SessionStatus: '-1',
        },
         map:{
          data:'items',
          total:'total',
          pageIndex:'pageindex',
          pageSize:'pagesize'
        },
        page: {
          pageIndex: 1,
          pageSize: 10,
          pageSizes: [10, 20, 30, 40],
          total: 0,
          map: {
            index: 'pageindex',
            size: 'pagesize',
          },
        },
        fetchUrl:'GetSessionList'
      },
    }
  },
  created() {},
  mounted() {
    this.config.maxHeight = document.body.clientHeight - 245 + 'px'
    this.getData()
    this.getDeliveryGroup()
    this.getComputer()
  },
  methods: {
    getData() {
      this.$refs.table.fetch()
    },
    SessionOption(key, type, message = '') {
      this.$http('SessionOption', {
        SessionKey: key,
        OptionType: type,
        Message: message,
      }).then((res) => {
        this.$message.success(res.errMsg)
      })
    },
    remoteUser(query) {
      if (query != '') {
        this.userLoading = true
        this.$http('GetUserANDUserGroup', {
          LikeName: query,
          ItemsCount: this.$store.getters.symSetting.remoteReturnNum,
          DataType:-1
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
            this.userLoading = false
          })
      }
    },
    remoteComputer(query) {
      if (query != '') {
        this.getComputer(query)
      }
    },
    getComputer(query) {
      this.computerLoading = true
      this.$http('GetDataList', { DataType: 1, LikeName: query, ItemsCount: this.$store.getters.symSetting.remoteReturnNum })
        .then((res) => {
          this.machines = res.items
        })
        .finally(() => {
          this.computerLoading = false
        })
    },
    remoteDeliveryGroup(val) {
      if (val != '') {
        this.getDeliveryGroup(val)
      }
    },
    getDeliveryGroup(val) {
      this.loading1 = true
      this.$http('GetDataList', { DataType: 0, LikeName: val, ItemsCount: this.$store.getters.symSetting.remoteReturnNum })
        .then((res) => {
          this.DeliveryGroupList = res.items
        })
        .finally(() => {
          this.loading1 = false
        })
    },
  },
}
</script>

<style lang="scss" scoped></style>
