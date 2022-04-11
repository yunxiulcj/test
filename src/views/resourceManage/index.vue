<template>
  <div class="pageWrap">
    <el-form inline size="small">
      <el-form-item label="资源类型">
        <el-select v-model="config.condition.ResourcesType">
          <el-option
            v-for="item in ResourcesType"
            :key="item.value"
            :value="item.value"
            :label="item.label"
          ></el-option>
        </el-select>
      </el-form-item>
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
      <el-form-item>
        <el-input
          placeholder="输入资源名称查询"
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
          >发布资源</el-button
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
            <img :src="baseUrl + scope.row.IcoPath" width="18px" />
          </span>
          <span style="margin-left: 5px">{{ scope.row.ApplicationName }}</span>
        </template>
      </table-temp>
    </div>
    <edit-app v-model="showEditApp" ref="edit-app"></edit-app>
    <release-app
      v-model="showReleaseApp"
      ref="release-app"
      @getDataFlag="getData"
    ></release-app>
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
      baseUrl: '',
      showEditApp: false,
      showReleaseApp: false,
      showAppDetail: false,
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
      ResourcesType: [
        {
          label: '全部',
          value: '-1',
        },
        {
          label: '应用',
          value: '1',
        },
        {
          label: '桌面',
          value: '2',
        },
      ],
      config: {
        tableData: [],
        maxHeight: '10000px',
        tableSetting: [
          {
            prop: 'ApplicationName',
            label: '资源名称(面向管理员)',
            align: 'left',
            slot: 'appName',
          },
          {
            prop: 'DisplayName',
            label: '资源名称(面向用户)',
            formatter: (row) => {
              return row.DisplayName || '-'
            },
          },
          {
            prop: 'ResourcesType',
            label: '资源类型',
            formatter: (row) => {
              return row.ResourcesType == 1 ? '应用' : '桌面'
            },
          },
          {
            prop: 'EnableStr',
            label: '启用状态',
            style: (row) => {
              return row.Enable ? { color: '#40c057' } : { color: '#fd7e14' }
            },
          },
          {
            prop: 'Description',
            label: '说明',
            formatter: (row) => {
              return row.Description || '-'
            },
          },
          {
            prop: 'WorkPath',
            label: '工作目录',
            formatter: (row) => {
              return row.ResourcesType == 1 ? row.WorkPath : '-'
            },
          },
        ],
        operation: {
          btns: [
            {
              label: '编辑',
              type: 'text',
              fn: (row) => {
                this.$http('GetAppDetail', { AppId: row.AppId })
                  .then((res) => {
                    this.$refs['edit-app'].initFormObj(res.data,row.ResourcesType)
                  })
                  .finally(() => {
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
                  this.initAppDetail(res.data,row.ResourcesType)
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
        map: {
          data: 'items',
        },
        condition: {
          ApplicationName: '',
          Enable: '-1',
          ResourcesType: '-1',
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
  created() {
    this.baseUrl =
      process.env.NODE_ENV === 'production'
        ? this.$store.getters.symSetting.host
        : '/api'
  },
  mounted() {
    this.config.maxHeight = document.body.clientHeight - 190 + 'px'
    this.getData()
  },
  methods: {
    getData(Refresh) {
      if (Refresh) {
        this.config.condition = {
          ApplicationName: '',
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
      this.$nextTick(() => {
        this.$refs['release-app'].handleCommand(
          this.config.condition.ResourcesType > 0
            ? this.config.condition.ResourcesType
            : 1
        )
        this.$refs['release-app'].getDeliveryGroupData()
      })
    },
    initAppDetail(data,type) {
      let temp = []
      for (let i in data) {
        switch (i) {
          case 'ApplicationName':
            temp.push({ Attribute: '资源名称（面向管理员）', Value: data[i] })
            break
          case 'ApplicationDisplayname':
            temp.push({ Attribute: '资源名称（面向用户）', Value: data[i] })
            break
          case 'ResourcesTypeStr':
            temp.push({ Attribute: '资源类型', Value: data[i] })
            break
          case 'ExeFullPath':
            if (type == 1) {
              temp.push({ Attribute: '程序路径', Value: data[i] })
            }
            break
          case 'DeliveryGroups':
            temp.push({
              Attribute: '交付组',
              Value: data[i]
                .map((item) => {
                  return item.DeliveryGroupName
                })
                .join('、'),
            })
            break
          case 'CategoryName':
            if (type == 1) {
              temp.push({ Attribute: '分类', Value: data[i] })
            }
            break
          case 'ParamsData':
            if (type == 1) {
              temp.push({ Attribute: '环境变量', Value: data[i] })
            }
            break
          case 'DescriptionStr':
            temp.push({ Attribute: '说明', Value: data[i] })
            break
          case 'Accounts':
            temp.push({
              Attribute: '可见用户',
              Value:
                data[i].length > 0
                  ? data[i]
                      .map((item) => {
                        return item.Name
                      })
                      .join('、')
                  : '全部',
            })
            break
          case 'WorkPath':
            if (type == 1) {
              temp.push({ Attribute: '工作目录', Value: data[i] })
            }
            break
        }
      }
      this.appDetailConfig.tableData = temp
    },
  },
}
</script>

<style lang="scss"></style>
