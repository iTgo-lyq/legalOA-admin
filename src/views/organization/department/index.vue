<template>
  <div class="app-container">
    <el-form :inline="true">
      <el-form-item label="部门名称">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入部门名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="queryParams.status" placeholder="部门状态" clearable size="small">
          <el-option
            v-for="(dict, index) in statusOptions"
            :key="index"
            :label="dict"
            :value="index"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          class="filter-item"
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
        >搜索</el-button>
        <el-button
          class="filter-item"
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      :data="deptList"
      row-key="did"
      default-expand-all
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column prop="name" label="部门名称" header-align="center" width="180"></el-table-column>
      <el-table-column prop="leader" label="负责人" align="center" width="120"></el-table-column>
      <el-table-column prop="leaderRole" label="负责人角色" align="center" width="120">
        <template slot-scope="scope">{{arrayFormat(scope.row.leaderRole)}}</template>
      </el-table-column>
      <el-table-column prop="memberRole" label="成员角色" align="center" width="120">
        <template slot-scope="scope">{{arrayFormat(scope.row.memberRole)}}</template>
      </el-table-column>
      <el-table-column
        prop="status"
        label="状态"
        align="center"
        :formatter="statusFormat"
        width="80"
      />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="timeFormat"
        width="120"
      />
      <el-table-column
        prop="updateInfo"
        :formatter="lastEleOfArrFormat"
        label="部门动态"
        header-align="center"
        min-width="180"
      />
      <el-table-column label="操作" fixed="right" align="center" width="260">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-plus" @click="handleAdd(scope.row)">新增</el-button>
          <el-button
            v-if="scope.row.grade != 0"
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改部门对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="700px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="24" v-if="form.grade !== 0">
            <el-form-item label="上级部门" prop="superior">
              <treeselect
                v-model="form.superior"
                :options="deptList"
                :normalizer="normalizer"
                placeholder="选择上级部门"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入部门名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责人" prop="leader">
              <el-input v-model="form.leader" placeholder="请输入负责人" maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="leaderPhone">
              <el-input
                v-model="form.leaderPhone"
                placeholder="请输入联系电话"
                role="phone"
                maxlength="11"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="leaderMail">
              <el-input v-model="form.leaderMail" placeholder="请输入邮箱" role="email" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责人角色" prop="leaderRole">
              <el-select v-model="form.leaderRole" multiple placeholder="负责人角色" clearable>
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
            <el-form-item label="成员角色" prop="memberRole">
              <el-select v-model="form.memberRole" multiple placeholder="成员角色" clearable>
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
            <el-form-item label="部门状态">
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="(dict, index) in statusOptions"
                  :key="index"
                  :label="index"
                >{{dict}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="form.did != undefined">
          <el-form-item label="更新备注">
            <el-input
              v-model="form.lastUpdateInfo"
              :autosize="{ minRows: 2, maxRows: 4}"
              type="textarea"
              placeholder="更新描述"
            />
          </el-form-item>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { constructTree } from '../utils'
import { formatTime } from '@/utils'
import {
  getDepts,
  addDept,
  updateDept,
  deleteDept,
  getRoles
} from '@/api/organization'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

const statusOptions = ['停止', '正常运转']

export default {
  name: 'Department',
  components: { Treeselect },
  data() {
    return {
      // 遮罩层
      loading: false,
      // 数据源
      list: [],
      // 表格树数据
      deptList: [],
      // 部门树选项
      deptOptions: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        name: undefined,
        status: undefined
      },
      // 部门状态表
      statusOptions,
      // 角色列表
      roleList: [],
      // 表单参数
      form: {
        did: '',
        leader: '',
        leaderMail: '',
        leaderPhone: '',
        name: '',
        status: 1,
        superior: '0',
        createTime: Date.now(),
        leaderRole: [],
        memberRole: [],
        subordinates: [],
        updateInfo: [],
        lastUpdateInfo: '',
        grade: 0
      },
      // 表单校验
      rules: {
        superior: [
          { required: true, message: '上级部门不能为空', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '部门名称不能为空', trigger: 'blur' }
        ],
        leaderMail: [
          {
            type: 'email',
            message: '请输入正确的邮箱地址',
            trigger: 'blur'
          }
        ],
        leaderPhone: [
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: '请输入正确的手机号码',
            trigger: 'blur'
          }
        ],
        leaderRole: [
          { required: true, message: '角色不能为空', trigger: 'blur' }
        ],
        memberRole: [
          { required: true, message: '角色不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询部门列表 */
    async getList() {
      const depts = await getDepts()
      const roles = await getRoles()
      this.list = depts
      this.roleList = roles
      this.deptList = constructTree(
        depts,
        'did',
        'superior',
        'subordinates',
        '0'
      )
    },
    async filtList() {
      const { name, status } = this.queryParams
      let depts = await getDepts()
      depts = depts
        .filter(e => (name ? e.name.indexOf(name) != -1 : true))
        .filter(e => (typeof status === 'number' ? e.status === status : true))
      this.list = depts
      console.log(depts)
      this.deptList = constructTree(
        depts,
        'did',
        'superior',
        'subordinates',
        '0'
      )
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
    /** 根据id查找dept */
    getDept(did) {
      for (const dept of this.list) if (dept.did == did) return dept
    },
    // 字典状态字典翻译
    statusFormat(row) {
      return statusOptions[row.status] || '未知状态'
    },
    timeFormat(row) {
      return formatTime(row.createTime)
    },
    arrayFormat(arr) {
      return arr.join(' | ')
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.resetForm()
    },
    // 表单重置
    resetForm(data) {
      this.form = Object.assign(
        {
          did: undefined,
          leader: '',
          leaderMail: '',
          leaderPhone: '',
          name: '',
          status: 1,
          superior: '0',
          createTime: Date.now(),
          leaderRole: [],
          memberRole: [],
          subordinates: [],
          updateInfo: [],
          lastUndateInfo: '',
          grade: -1
        },
        data
      )
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.filtList()
    },
    /** 新增按钮操作 */
    handleAdd(row) {
      this.resetForm()
      if (this.$refs.form) this.$refs.form.clearValidate()
      if (row != undefined) {
        this.form.superior = row.did
      }
      this.open = true
      this.title = '添加部门'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.resetForm(this.getDept(row.did))
      this.open = true
      this.title = '修改部门'
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.did != undefined) {
            this.form.updateInfo.push(this.form.lastUpdateInfo ? this.form.lastUpdateInfo : 'XX更新了部门信息')
            updateDept(this.form).then(res => {
              this.msgSuccess('修改成功')
              this.open = false
              this.getList()
            })
          } else {
            addDept(this.form).then(res => {
              this.msgSuccess('新增成功')
              this.open = false
              this.getList()
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      this.$confirm('是否确认删除部门' + row.name + '?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(function() {
          return deleteDept(row.did)
        })
        .then(() => {
          this.getList()
          this.msgSuccess('删除成功')
        })
        .catch(function() {})
    },
    lastEleOfArrFormat(row) {
      return row.updateInfo[row.updateInfo.length - 1]
    }
  }
}
</script>
