<template>
  <div class="pageWrap">
    <div class="systemBox">
      <div class="addUser">
        <el-form size="small" inline>
          <el-form-item>
            <el-select
              v-model="formObj.AdminName"
              filterable
              remote
              placeholder="请输入用户关键词"
              :remote-method="remoteUser"
              :loading="userLoading"
              clearable
              @clear="remoteUser"
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
            <el-input
              v-model="formObj.Remark"
              placeholder="请输入备注"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              size="small"
              @click="addUser"
              icon="el-icon-plus"
              >添加</el-button
            >
          </el-form-item>
        </el-form>
      </div>
      <div class="tableWrap">
        <table-temp :config="config" ref="table"></table-temp>
      </div>
    </div>
  </div>
</template>

<script>
import tableTemp from '@/components/table-temp.vue'
export default {
  components: { tableTemp },
  name: 'systemManage',
  data() {
    return {
      formObj: {
        AdminName: '',
        Remark: '',
      },
      users: [],
      userLoading: false,
      config: {
        tableData: [],
        tableSetting: [
          {
            prop: 'AdminName',
            label: '用户名称',
          },
          {
            prop: 'Remark',
            label: '备注',
          },
        ],
        operation: {
          btns: [
            {
              label: '禁用',
              type: 'text',
              style: { color: '#f59f00' },
              show: (row) => {
                return row.AccountStatus == 0
              },
              fn: (row) => {
                this.$confirm(`是否要禁用该用户?`, '提示', {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  type: 'warning',
                }).then(() => {
                  this.AdminUserOption(row.Uid, 1)
                })
              },
            },
            {
              label: '启用',
              type: 'text',
              show: (row) => {
                return row.AccountStatus == 2
              },
              fn: (row) => {
                this.$confirm(`是否要启用该用户?`, '提示', {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  type: 'warning',
                }).then(() => {
                  this.AdminUserOption(row.Uid, 2)
                })
              },
            },
            {
              label: '删除',
              type: 'text',
              style: { color: '#f03e3e' },
              fn: (row) => {
                this.$confirm(`是否要删除该用户?`, '提示', {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  type: 'warning',
                }).then(() => {
                  this.AdminUserOption(row.Uid, 0)
                })
              },
            },
          ],
        },
        map: { data: 'items' },
        fetchUrl: 'GetAdminUserList',
      },
    }
  },
  mounted() {
    this.getData()
  },
  methods: {
    addUser() {
      let isExist = false
      this.config.tableData.map((item) => {
        if (item.AdminName == this.formObj.AdminName) {
          isExist = true
        }
      })
      if (isExist) {
        this.$message.warning('该用户已存在列表')
      } else {
        this.$http('AddorEditAdminUser', this.formObj).then((res) => {
          this.$message.success(res.errMsg)
          this.formObj = {
            AdminName: '',
            Remark: '',
          }
          this.getData()
        })
      }
    },
    getData() {
      this.$refs['table'].fetch()
    },
    AdminUserOption(id, type) {
      this.$http('AdminUserOption', { Uid: id, OptionType: type }).then(
        (res) => {
          this.$message.success(res.errMsg)
          this.$refs['table'].fetch()
        }
      )
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
  },
}
</script>

<style lang="scss" scoped>
.addUser {
  text-align: right;
}
</style>
