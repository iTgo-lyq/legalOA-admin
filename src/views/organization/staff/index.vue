<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!--部门数据-->
      <el-col :span="4" :xs="24">
        <div class="head-container">
          <el-input
            v-model="dept.deptName"
            placeholder="请输入部门名称"
            clearable
            size="small"
            prefix-icon="el-icon-search"
            style="margin-bottom: 20px"
          />
        </div>
        <div class="head-container">
          <el-tree
            :data="dept.deptOptions"
            :props="dept.defaultProps"
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
            ref="depTree"
            default-expand-all
            @node-click="handleNodeClick"
          />
        </div>
      </el-col>

      <!--用户数据-->
      <el-col :span="20" :xs="24">
        <!-- 查询表单 -->
        <el-form :model="userQuery.queryParams" ref="queryForm" :inline="true" label-width="68px">
          <el-form-item label="用户名称" prop="userName">
            <el-input
              v-model="userQuery.queryParams.userName"
              placeholder="请输入用户名称"
              clearable
              size="small"
              style="width: 240px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="手机号码" prop="phone">
            <el-input
              v-model="userQuery.queryParams.phone"
              placeholder="请输入手机号码"
              clearable
              size="small"
              style="width: 240px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select
              v-model="userQuery.queryParams.status"
              placeholder="用户状态"
              clearable
              size="small"
              style="width: 240px"
            >
              <el-option
                v-for="(dict, index) in userStatusOptions"
                :key="index"
                :label="dict"
                :value="index"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="创建时间">
            <el-date-picker
              v-model="userQuery.queryParams.dateRange"
              size="small"
              style="width: 240px"
              value-format="yyyy-MM-dd"
              type="daterange"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            ></el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <!-- 操作区 -->
        <el-row :gutter="10">
          <el-col :span="1.5">
            <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="success"
              icon="el-icon-edit"
              size="mini"
              :disabled="handler.single"
              @click="handleUpdate"
            >修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              :disabled="handler.multiple"
              @click="handleDeletePeople"
            >删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="info" icon="el-icon-upload2" size="mini" @click="handleImport">导入</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport">导出</el-button>
          </el-col>
        </el-row>

        <!-- 用户表格 -->
        <el-table
          v-loading="userTable.loading"
          :data="userTableList"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="40" header-align="center" class-name="fix" />
          <el-table-column label="#" align="center" width="40">
            <template slot-scope="scope">{{ scope.$index + 1 }}</template>
          </el-table-column>
          <el-table-column label="称呼" align="center" prop="name" />
          <el-table-column label="部门" align="center" prop="organization.department.name" />
          <el-table-column label="手机号" align="center" prop="phone" />
          <el-table-column label="邮箱" align="center" prop="email" show-overflow-tooltip />
          <el-table-column label="状态" align="center">
            <template slot-scope="scope" width="80">
              <el-switch
                v-model="scope.row.organization.status"
                :active-value="1"
                :inactive-value="0"
                @change="handleStatusChange(scope.row)"
              ></el-switch>
            </template>
          </el-table-column>
          <el-table-column
            label="身份"
            align="center"
            prop="organization.role"
            :formatter="rolesArrToStr"
          />
          <el-table-column label="操作" align="center" fixed="right" width="180">
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleUpdate(scope.row)"
              >修改</el-button>
              <el-button
                v-if="scope.row.userId !== 1"
                size="mini"
                type="text"
                icon="el-icon-delete"
                @click="handleDelete(scope.row)"
              >删除</el-button>
              <el-button
                size="mini"
                type="text"
                icon="el-icon-key"
                @click="handleResetPwd(scope.row)"
              >重置</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页器 -->
        <pagination
          style="float: right"
          v-show="total > 0"
          :total="total"
          :page.sync="userQuery.queryParams.page"
          :limit.sync="userQuery.queryParams.pageSize"
          @pagination="getList"
        />
      </el-col>
    </el-row>

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="用户名" prop="name">
              <el-input v-model="form.name" placeholder="请输入用户名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="年龄" prop="age">
              <el-input v-model="form.age" type="number" placeholder="年龄" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" prop="sex">
              <el-radio-group v-model="form.sex">
                <el-radio :key="0" :label="false">女</el-radio>
                <el-radio :key="1" :label="true">男</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="归属部门" required>
              <treeselect
                v-model="form.organization.department.did"
                :options="dept.deptOptions"
                :normalizer="normalizer"
                placeholder="请选择归属部门"
                @close="handleMergeRoles"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="角色">
              <el-select
                v-model="form.organization.roles"
                multiple
                placeholder="角色"
                clearable
                @change="handleMergeRoles"
              >
                <el-option
                  v-for="role in roleList"
                  :key="role.rid"
                  :label="role.name"
                  :value="role.name"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="权限">
              <el-tree
                ref="tree"
                :check-strictly="false"
                :data="permissionsArray"
                :props="defaultProps"
                show-checkbox
                node-key="key"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="部门角色" prop="sex">
              <el-radio-group v-model="form.organization.department.leader" @change="changeLeader">
                <el-radio :key="0" :label="true">领导</el-radio>
                <el-radio :key="1" :label="false">成员</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="form.organization.status">
                <el-radio
                  v-for="(dict, index) in userStatusOptions"
                  :key="index"
                  :label="index"
                >{{dict}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 用户导入对话框 -->
    <el-dialog :title="upload.title" :visible.sync="upload.open" width="400px" append-to-body>
      <el-upload
        ref="upload"
        :limit="1"
        accept=".xlsx"
        action="#"
        :disabled="upload.isUploading"
        :auto-upload="false"
        :on-change="handleFileChange"
        drag
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">
          将文件拖到此处，或
          <em>点击上传</em>
        </div>
        <div class="el-upload__tip" slot="tip">
          <el-checkbox v-model="upload.updateSupport" />是否更新已经存在的用户数据
          <el-link type="info" style="font-size:12px" @click="importTemplate">下载模板</el-link>
        </div>
        <div class="el-upload__tip" style="color:red" slot="tip">提示：仅允许导入“xlsx”格式文件！</div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFileForm">确 定</el-button>
        <el-button @click="upload.open = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { deepClone } from '@/utils'
import { userExcelReader } from '@/utils/excel'
import {
  listUser,
  changeUserStatus,
  resetUserPassword,
  addUser,
  deleteUser,
  deleteUserList,
  updateUser
} from '@/api/auth'
import { getDepts, getRoles, mergeRolesToPerm } from '@/api/organization'
import { constructTree } from '../utils'
import Pagination from '@/components/Pagination'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

const userStatusOptions = ['小黑屋', '正常']

export default {
  name: 'User',
  components: { Treeselect, Pagination },
  data() {
    return {
      // 状态数据字典
      userStatusOptions,
      // 部门树
      dept: {
        // 部门名称
        deptName: undefined,
        // 部门数据
        deptList: [],
        // 部门树选项
        deptOptions: undefined,
        // 展开树配置
        defaultProps: {
          children: 'children',
          label: 'name'
        }
      },
      // 权限树配置
      defaultProps: {
        children: 'children', // 指定节点标签为节点对象的某个属性值
        label: 'label' // 指定子树为节点对象的某个属性值
      },
      // 用户查询
      userQuery: {
        // 查询参数
        queryParams: {
          page: 1,
          pageSize: 10,
          userName: undefined,
          phone: undefined,
          status: undefined,
          did: undefined,
          dateRange: []
        }
      },
      // 操作区
      handler: {
        // 非单个禁用
        single: true,
        // 非多个禁用
        multiple: true
      },
      // 用户表格
      userTable: {
        // 遮罩层
        loading: false,
        // 数据源
        data: [],
        // 用户表格数据
        list: [],
        // 总条数
        total: 0
      },
      // 选中数组
      ids: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 角色选项
      roleList: [],
      // 表单参数
      form: {
        uid: undefined,
        phone: '',
        age: 0,
        sex: true,
        name: '',
        email: '',
        token: '',
        organization: {
          status: 1,
          permission: {},
          roles: [],
          department: {
            did: undefined,
            name: '',
            leader: false
          }
        }
      },
      // 权限选项
      permissionsArray: [],
      // 权限树
      permissionsObject: {},
      // 用户导入参数
      upload: {
        // 是否显示弹出层（用户导入）
        open: false,
        // 弹出层标题（用户导入）
        title: '',
        // 是否禁用上传
        isUploading: false,
        // 是否更新已经存在的用户数据
        updateSupport: 0,
        // 设置上传的请求头部
        // headers: { Authorization: "Bearer " + getToken() },
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + '/system/user/importData'
      },
      // 用户导入数据
      uploadDate: [],
      // 表单校验
      rules: {
        name: [
          { required: true, message: '用户名称不能为空', trigger: 'blur' }
        ],
        email: [
          {
            type: 'email',
            message: "'请输入正确的邮箱地址",
            trigger: ['blur', 'change']
          }
        ],
        phone: [
          { required: true, message: '手机号码不能为空', trigger: 'blur' },
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: '请输入正确的手机号码',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  computed: {
    deptName() {
      return this.dept.deptName
    },
    total() {
      return this.userTable.list.length
    },
    userTableList() {
      const { list } = this.userTable
      const { page, pageSize } = this.userQuery.queryParams
      const res = []
      for (let i = (page - 1) * pageSize; i < list.length && i < page * pageSize; i++) {
        res.push(list[i])
      }
      return res
    }
  },
  watch: {
    // 根据名称筛选部门树
    deptName(val) {
      this.$refs.deptTree.filter(val)
    }
  },
  created() {
    this.getTreeselect()
    this.getUserList()
    this.getRoles()
    this.getPerm()
  },
  methods: {
    /** 获取用户列表 */
    async getUserList() {
      this.loading = true
      const list = await listUser()
      this.userTable.list = list
      this.userTable.data = list
      this.loading = false
    },
    /** 筛选用户数据 */
    // getList() {
    //   confirm('假的，别点了，懒得写')
    // },
    /** 查询部门下拉树结构 */
    async getTreeselect() {
      const list = await getDepts()

      this.dept.deptList = list
      this.dept.deptOptions = constructTree(
        list,
        'did',
        'superior',
        'subordinates',
        '0'
      )
    },
    /** 获取角色列表 */
    async getRoles() {
      const list = await getRoles()
      this.roleList = list
    },
    async getPerm() {
      const objTree = await mergeRolesToPerm([])
      const arrTree = []
      this.childrenObjToArray(objTree, arrTree)
      this.permissionsArray = arrTree
      this.permissionsObject = objTree
    },
    /** 转换部门数据结构 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.did,
        label: node.name,
        children: node.children
      }
    },
    // 筛选节点
    filterNode(value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    // 节点单击事件
    handleNodeClick(data) {
      this.userQuery.queryParams.did = data.id
      this.getList()
    },
    // 用户状态修改
    handleStatusChange(row) {
      const text = row.organization.status == 1 ? '启用' : '停用'
      this.$confirm('确认要' + text + '"' + row.name + '"用户吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(function() {
          return changeUserStatus(row.uid, row.organization.status)
        })
        .then(() => {
          this.msgSuccess(text + '成功')
        })
        .catch(function() {
          row.status = row.status == 1 ? 0 : 1
        })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset(data) {
      const form = Object.assign(
        {
          uid: undefined,
          phone: '',
          age: 0,
          sex: true,
          name: '',
          email: '',
          token: '',
          organization: {
            status: 1,
            permission: {},
            roles: [],
            department: {
              did: '',
              name: '',
              leader: false
            }
          }
        },
        data
      )
      this.form = form

      const objTree = data ? deepClone(data.organization.permission) : {}

      const permissionsKey = this.getPermissionsKey(objTree)

      if (this.$refs.tree) this.$refs.tree.setCheckedKeys(permissionsKey)
      else {
        this.$nextTick(() => {
          this.$refs.tree.setCheckedKeys(permissionsKey)
        })
      }
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.userQuery.queryParams.page = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = []
      if (this.$refs.queryForm) this.$refs.queryForm.resetFields()
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.uid)
      this.handler.single = selection.length != 1
      this.handler.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加用户'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset(deepClone(row))
      this.open = true
      this.title = '修改用户'
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
    /** 重置密码按钮操作 */
    handleResetPwd(row) {
      this.$prompt('请输入"' + row.name + '"的新密码', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
        .then(({ value }) => {
          resetUserPassword(row.uid, value).then(response => {
            this.msgSuccess('修改成功，新密码是：' + value)
          })
        })
        .catch(err => this.msgError(JSON.stringify(err)))
    },
    /** 修改权限 */
    async handleMergeRoles(value) {
      const roles = deepClone(this.form.organization.roles)
      const roleList = this.roleList
      const isLeader = this.form.organization.department.leader
      const dept = this.dept.deptList
      let oldV = []
      let newV = []

      let res = new Set(roles)

      if (typeof value === 'string') {
        for (const d of dept) {
          if (d.did == value) newV = isLeader ? d.leaderRole : d.memberRole
          else if (d.did == this.form.organization.department.did) { oldV = isLeader ? d.leaderRole : d.memberRole }
        }
      }

      if (typeof value === 'boolean') {
        for (const d of dept) {
          if (d.did == this.form.organization.department.did) {
            newV = value ? d.leaderRole : d.memberRole
            oldV = value ? d.memberRole : d.leaderRole
          }
        }
      }

      oldV.forEach(v => {
        res.delete(v)
      })
      newV.forEach(v => {
        res.add(v)
      })
      res = Array.from(res).filter(e => e != null)
      this.form.organization.roles = res

      const perm = await mergeRolesToPerm(this.roleNameToId(res))
      this.form.organization.permission = perm

      const objTree = deepClone(perm)
      const permissionsKey = this.getPermissionsKey(objTree)
      if (this.$refs.tree) this.$refs.tree.setCheckedKeys(permissionsKey)
      else {
        this.$nextTick(() => {
          this.$refs.tree.setCheckedKeys(permissionsKey)
        })
      }
    },
    /** 提交按钮 */
    submitForm: function() {
      for (const dept of this.dept.deptList) {
        if (dept.did == this.form.organization.department.did) { this.form.organization.department.name = dept.name }
      }
      this.$refs['form'].validate(async valid => {
        if (valid) {
          if (this.form.uid != undefined) {
            await updateUser(this.form)
            this.msgSuccess('修改成功')
            this.open = false
            this.getUserList()
          } else {
            await addUser(this.form)
            this.msgSuccess('新增成功')
            this.open = false
            this.getUserList()
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      this.$confirm('是否确认删除用户' + row.name + '的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(function() {
          return deleteUser(row.uid)
        })
        .then(() => {
          this.getUserList()
          this.msgSuccess('删除成功')
        })
        .catch(function() {})
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.userQuery.queryParams
      this.$confirm('是否确认导出所有用户数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(function() {
          confirm('不要点我 嘤嘤嘤')
        })
        .catch(function(err) {
          console.log(err)
        })
    },
    /** 导入按钮操作 */
    handleImport() {
      this.upload.title = '用户导入'
      this.upload.open = true
    },
    /** 下载模板操作 */
    importTemplate() {
      window.location = 'http://qiniu.tgozzz.cn/example.xlsx'
    },
    /** 选择文件 */
    handleFileChange(file, fileList) {
      const reader = new FileReader()
      reader.onload = userExcelReader(table => {
        this.uploadDate = table
      })
      reader.readAsArrayBuffer(file.raw)
    },
    // 提交上传文件
    async submitFileForm() {
      this.upload.isUploading = true
      const data = this.uploadDate.map(row => {
        const obj = {
          uid: undefined,
          phone: '',
          age: 0,
          sex: true,
          name: '',
          email: '',
          token: '',
          organization: {
            status: 1,
            permission: {},
            roles: [],
            department: {
              did: '',
              name: '',
              leader: false
            }
          }
        }
        obj.phone = row.phone
        obj.email = row.email
        obj.name = row.name
        obj.password = row.password
        obj.sex = row.sex
        obj.organization.status = row.status
        obj.organization.department.name = row.departmentName
        obj.organization.department.leader = row.leader
        obj.organization.roles = row.roles
        for (const dept of this.dept.deptList) {
          if (dept.name == row.departmentName) {
            obj.organization.department.did = dept.did
          }
        }
        return obj
      })
      await addUser(data)
      this.upload.open = false
      this.upload.isUploading = false
      this.$refs.upload.clearFiles()
      this.$alert('导入成功', '导入结果', { dangerouslyUseHTMLString: true })
      this.getUserList()
    },
    // 角色数组转字符串
    rolesArrToStr(user) {
      return user.organization.roles.join(' | ')
    },
    roleNameToId(arr) {
      return arr
        .map(name => {
          for (const role of this.roleList) {
            if (role.name == name) return role.rid
          }
        })
        .filter(id => typeof id !== 'undefined')
    },
    /** 权限对象转数组 */
    childrenObjToArray(src, arr, key) {
      if (!src.label) return
      const obj = src.children
      src.children = []
      src.key = key || 'root'
      src.disabled = true
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const element = obj[key]
          this.childrenObjToArray(element, src.children, key)
        }
      }
      arr.push(src)
    },
    /** 切换是否为领导 */
    changeLeader(v) {
      this.handleMergeRoles(v)
    },
    /** 批量删除 */
    handleDeletePeople() {
      this.$confirm('是否确认删除用户?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          return deleteUserList(this.ids)
        })
        .then(() => {
          this.getList()
          this.msgSuccess('删除成功')
        })
        .catch(function(err) {
          console.log(err)
        })
    }
  }
}
</script>
<style lang="css">
.fix > .cell {
  text-overflow: clip;
  text-align: center;
}
</style>
