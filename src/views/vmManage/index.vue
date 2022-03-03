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
          @clear="remoteDeliveryGroup"
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
      <el-form-item label="DNS名称">
        <el-select
          v-model="config.condition.MachineDNSName"
          filterable
          remote
          placeholder="请输入DNS关键词"
          :remote-method="remoteDNS"
          :loading="loading2"
          clearable
          @clear="remoteDNS"
        >
          <el-option
            v-for="item in DNSList"
            :key="item.Value"
            :label="item.Name"
            :value="item.Value"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="注册状态">
        <el-select
          v-model="config.condition.RegisterType"
          placeholder="请选择注册状态"
        >
          <el-option
            v-for="item in RegisterType"
            :key="item.value"
            :value="item.value"
            :label="item.label"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        ><el-button type="primary" @click="getData" icon="el-icon-search"
          >查询</el-button
        ></el-form-item
      >
    </el-form>
    <div class="tableWrap">
      <table-temp :config="config" ref="table"></table-temp>
    </div>
    <el-dialog :visible.sync="showSessionDetail" width="800px">
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
      DeliveryGroupList: [],
      DNSList: [],
      loading1: false,
      loading2: false,
      showSessionDetail: false,
      RegisterType: [
        {
          label: '全部',
          value: '',
        },
        {
          label: '注册',
          value: '0',
        },
        {
          label: '不可用',
          value: '1',
        },
      ],
      config: {
        tableData: [],
        maxHeight: '10000px',
        tableSetting: [
          {
            prop: 'MachineDNSName',
            label: 'DNS名称',
          },
          {
            prop: 'MachineName',
            label: '机器名称',
          },
          {
            prop: 'DeliveryGroupName',
            label: '交付组',
          },
          {
            prop: 'IPAddress',
            label: 'IP地址',
          },
          {
            prop: 'OSSystem',
            label: '操作系统',
          },
          {
            prop: 'MDAVer',
            label: 'MDA版本',
          },
          {
            prop: 'SessionCount',
            label: '会话数',
            click: (row) => {
              if (row.DeliveryGroupId && row.SessionCount) {
                this.showSessionDetail = true
                this.sessionConfig.condition.DeliveryGroupId =
                  row.DeliveryGroupId
                this.sessionConfig.condition.MachineDNSName = row.MachineDNSName
                this.$nextTick(()=>{
                  this.$refs['sessionTable'].fetch()
                })
              }
            },
            style: (row) => {
              return row.DeliveryGroupId && row.SessionCount>0
                ? {
                    color: '#228be6',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                  }
                : {}
            },
          },
          {
            prop: 'QFarm',
            label: 'QFarm值',
          },
          {
            prop: 'RegisterTypeStr',
            label: '注册状态',
          },
          {
            prop: 'LastRegisterTimeStr',
            label: '最后注册时间',
          },
        ],
        condition: {
          MachineDNSName: '',
          DeliveryGroupName: '',
          RegisterType: '',
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
        fetchUrl: 'GetMachineList',
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
            prop: 'SessionStatusStr',
            label: '会话类型',
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
              show:(row)=>{return row.ConnectionState==1},
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
        fetchUrl: 'GetSessionList',
      },
    }
  },
  created() {},
  mounted() {
    this.config.maxHeight = document.body.clientHeight - 245 + 'px'
    this.getData()
    this.getDeliveryGroup('')
    this.getDNS('')
  },
  methods: {
    getData() {
      this.$refs.table.fetch()
    },
    remoteDeliveryGroup(val) {
      if (val != '') {
        this.getDeliveryGroup(val)
      }
    },
    remoteDNS(val) {
      if (val != '') {
        this.getDNS(val)
      }
    },
    SessionOption(key, type, message = '') {
      this.$http('SessionOption', {
        SessionKey: key,
        OptionType: type,
        Message: message,
      }).then((res) => {
        this.$message.success(res.errMsg)
        this.$refs['sessionTable'].fetch()
      })
    },
    getDeliveryGroup(val) {
      this.loading1 = true
      this.$http('GetDataList', { DataType: 0, LikeName: val, ItemsCount: 5 })
        .then((res) => {
          this.DeliveryGroupList = res.items
        })
        .finally(() => {
          this.loading1 = false
        })
    },
    getDNS(val) {
      this.loading2 = true
      this.$http('GetDataList', { DataType: 1, LikeName: val, ItemsCount: 5 })
        .then((res) => {
          this.DNSList = res.items
        })
        .finally(() => {
          this.loading2 = false
        })
    },
  },
}
</script>
<style lang="scss" scoped></style>
