<template>
  <div class="pageWrap">
    <el-form inline size="small">
      <el-form-item label="启用状态">
        <el-select v-model="config.condition.Enable">
          <el-option
            v-for="item in Enable"
            :key="item.value"
            :value="item.value"
            :label="item.label"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="应用名称">
        <el-input
          placeholder="输入应用名称查询"
          v-model="config.condition.ApplicationName"
          style="width: 215px"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          size="small"
          @click="getData(false)"
          icon="el-icon-search"
          >查询</el-button
        >
        <el-button
          type="primary"
          size="small"
          @click="Release"
          icon="el-icon-s-promotion"
          >发布应用</el-button
        >
        <el-button
          type="primary"
          size="small"
          @click="getData(true)"
          icon="el-icon-refresh"
          >刷新</el-button
        >
      </el-form-item>
    </el-form>

    <div class="tableWrap">
      <table-temp :config="config" ref="table">
        <template slot-scope="scope" slot="appName">
          <span class="iconBox">
            <img :src="baseUrl+scope.row.IcoPath" width="18px" />
          </span>
          <span style="margin-left:5px">{{ scope.row.ApplicationName }}</span>
        </template>
      </table-temp>
    </div>
    <edit-app v-model="showEditApp" ref="edit-app"></edit-app>
    <release-app v-model="showReleaseApp" ref="release-app" @getDataFlag="getData"></release-app>
    <el-dialog :visible.sync="showAppDetail">
      <template slot="title">
        <div
          style="
            height: 20px;
            line-height: 20px;
            border-left: 4px solid #1890ff;
            padding-left: 10px;
          "
        >
          应用详情
        </div>
      </template>
      <table-temp :config="appDetailConfig"></table-temp>
      <span slot="footer">
        <el-button size="small" @click="showAppDetail = false">
          关闭
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import tableTemp from '@/components/table-temp'
import editApp from './components/editApp'
import releaseApp from './components/releaseApp'

export default {
  name: 'appManage',
  components: {
    tableTemp,
    releaseApp,
    editApp,
  },
  data() {
    return {
      baseUrl:'',
      showEditApp: false,
      showReleaseApp: false,
      showAppDetail: false,
      InstallType: [
        {
          label: '全部',
          value: '-1',
        },
        {
          label: '已安装',
          value: '0',
        },
        {
          label: '未安装',
          value: '1',
        },
      ],
      PublishType: [
        {
          label: '全部',
          value: '-1',
        },
        {
          label: '已发布',
          value: '0',
        },
        {
          label: '未发布',
          value: '1',
        },
      ],
      Enable: [
        {
          label: '全部',
          value: '-1',
        },
        {
          label: '已启用',
          value: '0',
        },
        {
          label: '未启用',
          value: '1',
        },
      ],
      config: {
        tableData: [],
        maxHeight: '10000px',
        tableSetting: [
          {
            prop: 'ApplicationName',
            label: '应用名称',
            align:'left',
            slot: 'appName',
          },
          {
            prop: 'InstallTypeStr',
            label: '安装状态',
          },
          {
            prop: 'PublishTypeStr',
            label: '发布状态',
          },
          {
            prop: 'EnableStr',
            label: '启用状态',
          },
          {
            prop: 'Description',
            label: '说明',
          },
          {
            prop: 'WorkPath',
            label: '工作目录',
          },
        ],
        operation: {
          btns: [
            {
              label: '编辑',
              type: 'text',
              fn: (row) => {
                this.$http('GetAppDetail', { AppId: row.AppId }).then((res) => {
                  this.$refs['edit-app'].initFormObj(res.data)
                }).finally(()=>{
                  this.showEditApp = true
                })                
              },
            },
            {
              label: '详情',
              type: 'text',
              fn: (row) => {
                this.$http('GetAppDetail', { AppId: row.AppId }).then((res) => {
                  this.showAppDetail = true
                  this.initAppDetail(res.data)
                })
              },
            },
            {
              label: '启动',
              type: 'text',
              style: { color: '#37b24d' },
              show: (row) => {
                return !row.Enable
              },
              fn: (row) => {
                this.$confirm(
                  `此操作将启动${row.ApplicationName}, 是否继续?`,
                  '提示',
                  {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                  }
                ).then(() => {
                  this.UpdateStatu(row.AppId, 0)
                })
              },
            },
            {
              label: '禁用',
              type: 'text',
              style: { color: '#f59f00' },
              show: (row) => {
                return row.Enable
              },
              fn: (row) => {
                this.$confirm(
                  `此操作将禁用${row.ApplicationName}, 是否继续?`,
                  '提示',
                  {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                  }
                ).then(() => {
                  this.UpdateStatu(row.AppId, 1)
                })
              },
            },
            {
              label: '删除',
              type: 'text',
              style: { color: '#f03e3e' },
              fn: (row) => {
                this.$confirm(
                  `此操作将删除${row.ApplicationName}, 是否继续?`,
                  '提示',
                  {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                  }
                ).then(() => {
                  this.UpdateStatu(row.AppId, 2)
                })
              },
            },
          ],
        },
        map:{
          data:'items'
        },
        condition: {
          ApplicationName: '',
          Enable: '-1',
        },
        fetchUrl: 'GetAppList',
      },
      appDetailConfig: {
        tableData: [],
        tableSetting: [
          {
            prop: 'Attribute',
            label: '属性',
          },
          {
            prop: 'Value',
            label: '值',
          },
        ],
      },
    }
  },
  created() {this.baseUrl = this.$store.getters.symSetting.host},
  mounted() {
    this.config.maxHeight = document.body.clientHeight - 190 + 'px'
    this.getData()
  },
  methods: {
    getData(Refresh) {
      if (Refresh) {
        this.config.condition = {
          ApplicationName: '',
          InstallType: '-1',
          PublishType: '-1',
          Enable: '-1',
        }
      }
      this.$refs.table.fetch()
    },
    UpdateStatu(id, type) {
      this.$http('UpdateStatu', { AppId: id, Statu: type }).then((res) => {
        this.$message.success(res.errMsg)
        this.getData(false)
      })
    },
    Release() {
      this.showReleaseApp = true
      this.$nextTick(()=>{
        this.$refs['release-app'].getDeliveryGroupData()
      })
    },
    initAppDetail(data) {
      let temp = []
      for (let i in data) {
        switch (i) {
          case 'ApplicationName':
            temp.push({ Attribute: '应用名称（面向管理员）', Value: data[i] })
            break
          case 'ApplicationDisplayname':
            temp.push({ Attribute: '应用名称（面向用户）', Value: data[i] })
            break
          case 'ExeFullPath':
            temp.push({ Attribute: '程序路径', Value: data[i] })
            break
          case 'DeliveryGroups':
            temp.push({ Attribute: '交付组', Value: data[i].map(item=>{return item.DeliveryGroupName}).join('、') })
            break
          case 'CategoryName':
            temp.push({ Attribute: '分类', Value: data[i] })
            break
          case 'DesktopGroupName':
            temp.push({ Attribute: '交付组名称', Value: data[i] })
            break
          case 'ParamsData':
            temp.push({ Attribute: '环境变量', Value: data[i] })
            break
          case 'DescriptionStr':
            temp.push({ Attribute: '说明', Value: data[i] })
            break
          case 'Accounts':
            temp.push({ Attribute: '可见用户', Value: data[i].length>0?data[i].map(item=>{return item.Name}).join('、'):'全部' })
            break
          case 'WorkPath':
            temp.push({ Attribute: '工作目录', Value: data[i] })
            break
        }
      }
      this.appDetailConfig.tableData = temp
    },
  },
}
</script>

<style lang="scss"></style>
