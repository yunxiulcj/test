<template>
  <div class="pageWrap">
    <el-form size="small" inline>
      <el-form-item label="交付组名称">
        <el-select
          v-model="config.condition.DeliveryGroupName"
          filterable
          remote
          placeholder="请输入交付组关键词"
          :remote-method="remoteDeliveryGroup"
          :loading="loading1"
          clearable
          @clear="getDeliveryGroup"
        >
          <el-option
            v-for="item in DeliveryGroupList"
            :key="item.Value"
            :label="item.Name"
            :value="item.Name"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="getData" type="primary" icon="el-icon-search"
          >查询</el-button
        >
        <el-button
          size="small"
          type="primary"
          @click="createDeliveryGroup"
          icon="el-icon-plus"
          >新增交付组</el-button
        >
      </el-form-item>
    </el-form>

    <div class="tableWrap">
      <table-temp :config="config" ref="table"></table-temp>
    </div>
    <el-dialog :visible.sync="showCreateOrEdit" width="500px">
      <template slot="title">
        <div
          style="
            height: 20px;
            line-height: 20px;
            border-left: 4px solid #1890ff;
            padding-left: 10px;
          "
        >
          {{ createOrEdit }}
        </div>
      </template>
      <el-form
        size="small"
        label-width="100px"
        label-position="right"
        style="width: 400px"
        :model="formObj"
        :rules="formRules"
        ref="formObj"
      >
        <el-form-item label="交付组名称" prop="DeliveryGroupName">
          <el-input
            v-model="formObj.DeliveryGroupName"
            placeholder="请输入交付组名称"
            :disabled="dialogType != 2"
          ></el-input>
        </el-form-item>
        <el-form-item label="交付类型" prop="DeliveryGroupTypeStr">
          <el-select
            v-model="formObj.DeliveryGroupTypeStr"
            placeholder="请选择交付类型"
            style="width: 300px"
            :disabled="dialogType == 0"
          >
            <el-option
              v-for="item in DeliveryGroupType"
              :key="item"
              :label="item"
              :value="item"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="用户">
          <el-select
            v-model="formObj.Users"
            multiple
            filterable
            remote
            reserve-keyword
            placeholder="请输入用户关键词"
            :remote-method="remoteUser"
            :loading="userLoading"
            :disabled="dialogType == 0"
            value-key="Name"
            style="width: 300px"
          >
            <template v-for="item in users">
              <el-option :key="item.Name" :label="item.Name" :value="item">
                <span :class="'iconfont icon-' + item.icon"></span>
                <span>{{ item.Name }}</span>
              </el-option>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="关联计算机" prop="Machines">
          <el-select
            v-model="formObj.Machines"
            multiple
            filterable
            remote
            reserve-keyword
            placeholder="请输入计算机关键词"
            :remote-method="getComputer"
            :loading="computerLoading"
            style="width: 300px"
            :disabled="dialogType == 0"
            value-key="DnsName"
          >
            <template v-for="item in machines">
              <el-option :key="item.Id" :label="item.DnsName" :value="item">
              </el-option>
            </template>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button size="small" @click="showCreateOrEdit = false">
          取消
        </el-button>
        <el-button
          size="small"
          type="primary"
          @click="confirm"
          v-show="dialogType != 0"
        >
          确定
        </el-button>
      </span>
    </el-dialog>
    <el-dialog :visible.sync="showSessionDetail" width="65%">
      <template slot="title">
        <div
          style="
            height: 20px;
            line-height: 20px;
            border-left: 4px solid #1890ff;
            padding-left: 10px;
          "
        >
          会话详情
        </div>
      </template>
      <table-temp :config="sessionConfig" ref="sessionTable"></table-temp>
      <span slot="footer">
        <el-button size="small" @click="showSessionDetail = false">
          关闭
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import tableTemp from '@/components/table-temp.vue'
export default {
  name: 'vmManage',
  components: {
    tableTemp,
  },
  data() {
    return {
      computerLoading: false,
      userLoading: false,
      showCreateOrEdit: false,
      showSessionDetail: false,
      loading1: false,
      createOrEdit: '',
      DeliveryGroupList: [],
      dialogType: 0,
      users: [],
      machines: [],
      DeliveryGroupType: ['应用与桌面'],
      formObj: {
        DeliveryGroupId: '',
        DeliveryGroupName: '',
        DeliveryGroupTypeStr: '应用与桌面',
        Users: [],
        Machines: [],
      },
      formRules: {
        DeliveryGroupName: [
          { required: true, message: '请输入交付组名称', trigger: 'blur' },
        ],
        DeliveryGroupTypeStr: [
          { required: true, message: '请选择交付类型', trigger: 'blur' },
        ],
        Machines: [
          {
            type: 'array',
            required: true,
            message: '请至少选择一部计算机',
            trigger: 'change',
          },
        ],
      },
      config: {
        tableData: [],
        maxHeight: '10000px',
        tableSetting: [
          {
            prop: 'DeliveryGroupName',
            label: '交付组名称',
          },
          {
            prop: 'DeliveryGroupTypeStr',
            label: '交付组类型',
          },
          {
            prop: 'MachineCount',
            label: '计算机数量',
          },
          {
            prop: 'SessionCount',
            label: '会话情况',
            click: (row) => {
              if (row.SessionCount > 0) {
                this.showSessionDetail = true
                this.sessionConfig.condition.DeliveryGroupId =
                  row.DeliveryGroupId
                this.sessionConfig.condition.MachineDNSName = row.MachineDNSName
                this.$nextTick(() => {
                  this.$refs['sessionTable'].fetch()
                })
              }
            },
            style: (row) => {
              return row.DeliveryGroupId && row.SessionCount > 0
                ? {
                    color: '#228be6',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                  }
                : {}
            },
            formatter: (row) => {
              return row.ActiveSessionCount + '/' + row.SessionCount
            },
          },
        ],
        operation: {
          btns: [
            {
              label: '详情',
              type: 'text',
              fn: (row) => {
                this.showCreateOrEdit = true
                this.createOrEdit = '交付组详情'
                this.dialogType = 0
                this.$http('GetDeliveryGroupDetail', {
                  DeliveryGroupId: row.DeliveryGroupId,
                }).then((res) => {
                  res.data.Users.map((item) => {
                    if (item.Type == 0) {
                      item['icon'] = 'user'
                    } else {
                      item['icon'] = 'userGroup'
                    }
                  })
                  res.data['DeliveryGroupId'] = row.DeliveryGroupId
                  res.data['DeliveryGroupTypeStr'] = res.data.DelivertGroupTypeStr
                  this.$set(this, 'formObj', res.data)
                  this.users = res.data.Users
                  this.machines = res.data.Machines
                })
              },
            },
            {
              label: '编辑',
              type: 'text',
              fn: (row) => {
                this.showCreateOrEdit = true
                this.createOrEdit = '编辑交付组'
                this.dialogType = 1
                this.$http('GetDeliveryGroupDetail', {
                  DeliveryGroupId: row.DeliveryGroupId,
                }).then((res) => {
                  res.data.Users.map((item) => {
                    if (item.Type == 0) {
                      item['icon'] = 'user'
                    } else {
                      item['icon'] = 'userGroup'
                    }
                  })
                  res.data['DeliveryGroupId'] = row.DeliveryGroupId
                  res.data['DeliveryGroupTypeStr'] = res.data.DelivertGroupTypeStr
                  this.$set(this, 'formObj', res.data)
                  this.users = res.data.Users
                  this.machines = res.data.Machines
                })
              },
            },
            {
              label: '禁用',
              type: 'text',
              style: { color: '#f59f00' },
              fn: (row) => {
                this.$confirm(
                  `此操作将禁用${row.DeliveryGroupName}, 是否继续?`,
                  '提示',
                  {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                  }
                ).then(() => {
                  this.DeliveryGroupOption(row.DeliveryGroupId, 1)
                })
              },
            },
            {
              label: '删除',
              type: 'text',
              style: { color: '#f03e3e' },
              fn: (row) => {
                this.$confirm(
                  `此操作将删除${row.DeliveryGroupName}, 是否继续?`,
                  '提示',
                  {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                  }
                ).then(() => {
                  this.DeliveryGroupOption(row.DeliveryGroupId, 0)
                })
              },
            },
          ],
        },
        condition: {
          DeliveryGroupName: '',
        },
        map: {
          data: 'items',
          total: 'total',
          pageIndex: 'pageindex',
          pageSize: 'pagesize',
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
        fetchUrl: 'GetDeliveryGroupList',
      },
      sessionConfig: {
        tableData: [],
        maxHeight: '450px',
        tableSetting: [
          {
            prop: 'UserName',
            label: '用户名',
          },
          {
            prop: 'MachineDNSName',
            label: 'DNS名称',
          },
          {
            prop: 'SessionStatusStr',
            label: '会话状态',
          },
          {
            prop: 'SessionStartTime',
            label: '会话开始时间',
          },
          {
            prop: 'SessionConnectTime',
            label: '会话连接时间',
          },
        ],
        operation: {
          btns: [
            {
              label: '断开',
              type: 'text',
              style: { color: '#f03e3e' },
              show: (row) => {
                return row.ConnectionState == 1
              },
              fn: (row) => {
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
          SessionStatus: -1,
          DeliveryGroupId: '',
          MachineDNSName: '',
        },
        map: {
          data: 'items',
          total: 'total',
          pageIndex: 'pageindex',
          pageSize: 'pagesize',
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
        fetchUrl: 'GetSessionList',
      },
    }
  },
  created() {},
  mounted() {
    this.config.maxHeight = document.body.clientHeight - 245 + 'px'
    this.getData()
    this.getDeliveryGroup('')
    this.getComputer('')
  },
  methods: {
    getData() {
      this.$refs.table.fetch()
    },
    DeliveryGroupOption(id, type) {
      this.$http('DeliveryGroupOption', {
        DeliveryGroupId: id,
        OptionType: type,
      }).then((res) => {
        this.$message.success(res.errMsg)
        this.$nextTick(() => {
          this.$refs['table'].fetch()
        })
      })
    },
    SessionOption(key, type, message = '') {
      this.$http('SessionOption', {
        SessionKey: key,
        OptionType: type,
        Message: message,
      }).then((res) => {
        this.$message.success(res.errMsg)
        this.$nextTick(() => {
          this.$refs['sessionTable'].fetch()
        })
      })
    },
    getComputer(query) {
      this.computerLoading = true
      this.$http('GetDataList', {
        DataType: 3,
        LikeName: query,
        ItemsCount: this.$store.getters.symSetting.remoteReturnNum,
      })
        .then((res) => {
          this.machines = res.items.map((item) => {
            return { DnsName: item.Name, Id: item.Value }
          })
        })
        .finally(() => {
          this.computerLoading = false
        })
    },
    remoteUser(query) {
      if (query != '') {
        this.userLoading = true
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
            this.users = res.items
          })
          .finally(() => {
            this.userLoading = false
          })
      }
    },
    confirm() {
      this.$refs['formObj'].validate((valid) => {
        if (valid) {
          this.$http('AddOrEditDeliveryGroup', this.formObj).then((res) => {
            this.$message.success(res.errMsg)
            this.showCreateOrEdit = false
            this.$nextTick(() => {
              this.$refs['table'].fetch()
            })
          })
        }
      })
    },
    remoteDeliveryGroup(val) {
      if (val != '') {
        this.getDeliveryGroup(val)
      }
    },
    getDeliveryGroup(val) {
      this.loading1 = true
      this.$http('GetDataList', {
        DataType: 0,
        LikeName: val,
        ItemsCount: this.$store.getters.symSetting.remoteReturnNum,
      })
        .then((res) => {
          this.DeliveryGroupList = res.items
        })
        .finally(() => {
          this.loading1 = false
        })
    },
    createDeliveryGroup() {
      this.createOrEdit = '新增交付组'
      this.formObj = {
        DeliveryGroupId: '',
        DeliveryGroupName: '',
        DeliveryGroupTypeStr: '应用与桌面',
        Users: [],
        Machines: [],
      }
      this.dialogType = 2
      this.showCreateOrEdit = true
    },
  },
}
</script>

<style lang="scss" scoped>
.tableWrap {
  margin-top: 15px;
}
</style>
