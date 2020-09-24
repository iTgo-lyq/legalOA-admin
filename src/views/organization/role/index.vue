<template>
  <div class="app-container">
    <el-button type="primary" @click="handleAddRole">添加新角色</el-button>

    <el-table :data="rolesList" style="width: 100%;margin-top:30px;" v-loading="loading" border>
      <el-table-column align="center" label="#" width="80">
        <template slot-scope="scope">{{ scope.$index + 1 }}</template>
      </el-table-column>
      <el-table-column align="center" label="角色" width="180">
        <template slot-scope="scope">{{ scope.row.name }}</template>
      </el-table-column>
      <el-table-column align="center" label="创建者" width="180">
        <template slot-scope="scope">{{ scope.row.createBy }}</template>
      </el-table-column>
      <el-table-column
        align="center"
        label="创建时间"
        sortable
        :sort-method="timeSorter"
        :formatter="timeFormat"
        width="180"
      />
      <el-table-column align="center" label="状态" width="150">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            :active-value="1"
            :inactive-value="0"
            @change="handleStatusChange(scope)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column align="header-center" label="描述">
        <template slot-scope="scope">{{ scope.row.description }}</template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="220">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'修改角色':'添加新角色'">
      <el-form
        ref="roleForm"
        :model="role"
        label-width="80px"
        label-position="left"
        :rules="formRoles"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="role.name" placeholder="角色名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="role.description"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="角色描述"
          />
        </el-form-item>
        <el-form-item label="权限">
          <el-tree
            ref="tree"
            :check-strictly="false"
            :data="permissionsArray"
            :props="defaultProps"
            show-checkbox
            node-key="key"
            class="permission-tree"
          />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmRole">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import path from 'path'
import { deepClone, formatTime } from '@/utils'
import Role from '@/api/domain/Role'
import {
  getRoles,
  addRole,
  deleteRole,
  updateRole,
  getPermissions,
  changeStatusOfRole
} from '@/api/organization'
import role from '../../../../mock/role'

const defaultRole = new Role()

export default {
  data() {
    const validateName = (rule, value, callback) => {
      for (const role of this.rolesList) {
        if (role.name == value && role.rid != this.role.rid) { return callback('名字重复') }
      }
      return callback()
    }
    return {
      loading: false, // 表格加载
      permissions: {}, // 权限对象
      defaultPermissions: {}, // 权限对象原型
      rolesList: [], // 角色列表
      dialogVisible: false, // 表单是否可见
      dialogType: 'new', // 表单提交方式
      role: Object.assign({}, defaultRole), // 角色对象表单
      defaultProps: {
        // 权限树配置
        children: 'children', // 指定节点标签为节点对象的某个属性值
        label: 'label' // 指定子树为节点对象的某个属性值
      },
      formRoles: {
        name: [
          { required: true, message: '名称不能为空', trigger: 'blur' },
          { validator: validateName, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    permissionsArray() {
      // 权限数组
      const objTree = deepClone(this.permissions)
      const arrTree = []
      this.childrenObjToArray(objTree, arrTree)
      return arrTree
    },
    permissionsObject() {
      return deepClone(this.defaultPermissions)
    }
  },
  created() {
    this.initPermissions()
    this.getRoles()
  },
  methods: {
    /** 获取空权限对象 */
    async initPermissions() {
      try {
        this.permissions = this.defaultPermissions = await getPermissions()
      } catch (error) {
        console.log(error)
      }
    },
    /** 获取角色列表 */
    async getRoles() {
      try {
        this.rolesList = await getRoles().then(res =>
          // 时间排序
          res.sort(function(e1, e2) {
            return e2.createTime - e1.createTime
          })
        )
      } catch (error) {
        console.log(error)
      }
    },
    /** 提交角色信息表单 */
    confirmRole() {
      this.$refs['roleForm'].validate(async valid => {
        if (valid) {
          // update or add
          const isEdit = this.dialogType === 'edit'
          const perm = this.permissionsObject
          this.setPermission(perm, this.$refs.tree.getCheckedKeys())
          this.role.permission = perm

          // 调用接口
          if (isEdit) {
            await updateRole(this.role)
            // 更新原来的角色列表中的信息
            for (let index = 0; index < this.rolesList.length; index++) {
              if (this.rolesList[index].rid === this.role.rid) {
                this.rolesList.splice(index, 1, Object.assign({}, this.role))
                break
              }
            }
          } else {
            const data = await addRole(this.role, this.$store.getters.auth)
            this.role.rid = data.rid
            this.rolesList = [this.role, ...this.rolesList]
          }

          /** 隐藏表单，提示操作成功 */
          const { description, rid, name } = this.role
          this.dialogVisible = false
          this.$notify({
            title: 'Success',
            dangerouslyUseHTMLString: true,
            message: `
                <div>Key: ${rid}</div>
                <div>角色: ${name}</div>
                <div>描述: ${description}</div>
              `,
            type: 'success'
          })
        }
      })
    },
    /** 修改角色状态 */
    async handleStatusChange({ row }) {
      const rid = row.rid
      const status = row.status
      try {
        this.loading = true
        const role = await changeStatusOfRole(rid, status)
        // 更新原来的角色列表中的信息
        for (let index = 0; index < this.rolesList.length; index++) {
          if (this.rolesList[index].rid === role.rid) {
            // this.rolesList[index] = Object.assign({}, role)
            break
          }
        }
      } catch (err) {
        row.status = row.status ? 0 : 1
      } finally {
        this.loading = false
      }
    },
    /** 添加新角色 */
    handleAddRole() {
      this.role = Object.assign({}, defaultRole)
      if (this.$refs.tree) {
        // 重置权限树
        this.$refs.tree.setCheckedNodes([])
      }
      // 显示表单，type为new
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    /** 编辑角色 */
    handleEdit(scope) {
      const role = deepClone(scope.row)
      const permissionsKey = this.getPermissionsKey(role.permission)
      this.role = role
      if (!this.$refs.tree) {
        this.$nextTick(() => {
          this.$refs.tree.setCheckedKeys(permissionsKey)
        })
      } else this.$refs.tree.setCheckedKeys(permissionsKey)

      this.dialogType = 'edit'
      this.dialogVisible = true
    },
    /** 删除角色 */
    handleDelete({ $index, row }) {
      this.$confirm('确定要删除该角色吗?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          await deleteRole(row.rid)
          this.rolesList.splice($index, 1)
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        })
        .catch(err => {
          console.error(err)
        })
    },
    /** 获取开启权限的key */
    getPermissionsKey(perm, keysList = [], key) {
      if (perm.on) keysList.push(key || 'root')
      for (const k in perm.children) {
        if (perm.children.hasOwnProperty(k)) {
          const element = perm.children[k]
          this.getPermissionsKey(element, keysList, k)
        }
      }
      return keysList
    },
    /** 根据key设置权限 */
    setPermission(perm, keysList, key) {
      if (!key && keysList.indexOf('root') != -1) perm.on = true
      if (key && keysList.indexOf(key) != -1) perm.on = true
      for (const k in perm.children) {
        if (perm.children.hasOwnProperty(k)) {
          const element = perm.children[k]
          this.setPermission(element, keysList, k)
        }
      }
    },
    /** 权限对象转数组 */
    childrenObjToArray(src, arr, key) {
      const obj = src.children
      src.children = []
      src.key = key || 'root'
      src.label += ` ( ${src.webRoute} , ${src.httpRoute} ) `
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const element = obj[key]
          this.childrenObjToArray(element, src.children, key)
        }
      }
      arr.push(src)
    },
    /** 时间顺序排序 */
    timeSorter(a, b) {
      return b.createTime - a.createTime
    },
    /** 格式化时间 */
    timeFormat(row) {
      return formatTime(row.createTime)
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .roles-table {
    margin-top: 30px;
  }
  .permission-tree {
    margin-bottom: 30px;
  }
}
</style>
