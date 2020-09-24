import request from '@/utils/request'
import User from './domain/User'
import Role from './domain/Role'
import Department from './domain/Department'

const baseURL = 'http://legal.tgozzz.cn/organization'
// const baseURL = 'http://localhost:2021/organization'

/**
 * 获取空白的权限描述对象
 */
export function getPermissions() {
  return request({
    baseURL,
    url: '/roles/permissions',
    method: 'get'
  })
}

/**
 * 获取角色列表
 */
export function getRoles() {
  return request({
    baseURL,
    url: '/roles',
    method: 'get'
  })
}

/**
 * 创建角色
 * @param {{
  'name': '',
  'description': '',
  'createBy': '',
  'updateBy': '',
  'status': 0,
  'permission': {}
}} role 新建的角色信息
 * @param { User } user 用户
 */
export function addRole(role, user) {
  const data = Object.assign({
    name: '',
    description: '',
    createBy: '',
    updateBy: '',
    status: 0,
    permission: {}
  }, role)

  data.createBy = user ? user.name : '未知'

  return request({
    baseURL,
    url: '/roles',
    method: 'post',
    data
  })
}

/**
 * 更新角色
 * @param { Role } role 新建的角色信息
 * @param { User } user 用户
*/
export function updateRole(role, user) {
  const data = new Role()
  Object.assign(data, role)

  data.updateTime = Date.now()
  data.updateBy = user ? user.name : '未知'

  return request({
    baseURL,
    url: `/roles/${role.rid}`,
    method: 'put',
    data
  })
}

/**
 * 更新角色禁用or启用状态
 * @param {string} rid id
 * @param {int} status 状态
 */
export function changeStatusOfRole(rid, status) {
  return request({
    baseURL,
    url: `/roles/${rid}?status=${status}`,
    method: 'patch'
  })
}

/**
 * 删除角色
 * @param {String} roleId 角色id
 * @param {User} user 用户信息
 */
export function deleteRole(roleId, user) {
  return request({
    baseURL,
    url: `/roles/${roleId}`,
    method: 'delete'
  })
}

/**
 * 获取部门列表
 */
export function getDepts() {
  return request({
    baseURL,
    url: '/departments',
    method: 'get'
  })
}

/**
 * 添加部门
 * @param {{
	'name': '法务部',
	'leader': 'balabala',
	'leaderMail': '1@1.com',
	'leaderPhone': '131',
	'superior': 'balaba',
	'status': 1,
	'leaderRole': [
		'admin'
	],
	'memberRole': [
		'common'
	]
}} dept 部门信息
 * @param {User} user 用户信息
 */
export function addDept(dept, user) {
  const data = Object.assign({
    name: '0',
    leader: '0',
    leaderMail: '0',
    leaderPhone: '0',
    superior: '0',
    status: 0,
    leaderRole: [],
    memberRole: []
  }, dept)

  return request({
    baseURL,
    url: '/departments',
    method: 'post',
    data
  })
}

/**
 * 更新部门信息
 * @param {Department} dept 部门信息
 * @param {User} user 用户信息
 */
export function updateDept(dept, user) {
  const data = new Department()
  Object.assign(data, dept)

  return request({
    baseURL,
    url: `/departments/${data.did}`,
    method: 'put',
    data
  })
}

/**
 * 删除部门
 * @param {string} deptId 部门id
 * @param {User}} user 用户信息
 */
export function deleteDept(deptId, user) {
  return request({
    baseURL,
    url: `/departments/${deptId}`,
    method: 'delete'
  })
}

/**
 * 根据角色id数组获取权限对象
 */
export function mergeRolesToPerm(list) {
  return request({
    baseURL,
    url: '/utils/permission/merge',
    method: 'post',
    data: {
      roles: [...list]
    }
  })
}
