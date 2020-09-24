import request from '@/utils/request'
import User from './domain/User'

const baseURL = 'http://legal.tgozzz.cn'
// const baseURL = 'http://localhost:2021'

/**
 * 登录
 */
export function login(data = { token: '', password: '', phone: '' }) {
  const method = data.token ? 'get' : 'put'
  const url = data.token ? '/users/login/' : '/users/login/pw'

  return request({
    baseURL, url,
    headers: {
      Authorization: data.token
    },
    method,
    data
  })
}

/**
 * 获取所有用户
 */
export function listUser() {
  return request({
    baseURL,
    url: '/users',
    headers: {},
    method: 'get'
  })
}

/**
 * 切换用户状态
 * @param {string} uid 用户id
 * @param {number} status 用户状态
 */
export function changeUserStatus(uid, status) {
  return request({
    baseURL,
    url: `/users/${uid}/organization/status`,
    params: {
      status
    },
    method: 'patch'
  })
}

/**
 * 重置用户密码
 */
export function resetUserPassword(uid, password) {
  return request({
    baseURL,
    url: `/users/${uid}/password`,
    data: {
      password
    },
    method: 'put'
  })
}

/**
 * 添加用户
 * @param { User } u 用户对象
 */
export function addUser(u) {
  return request({
    baseURL,
    url: `/users`,
    method: 'post',
    data: u.length ? u : [Object.assign(new User(), u)]
  })
}

/**
 * 删除用户
 * @param {String} uid 用户id
 */
export function deleteUser(uid) {
  return request({
    baseURL,
    url: `/users/${uid}`,
    method: 'delete'
  })
}

/**
 * 批量删除用户
 */
export function deleteUserList(uidList) {
  if (uidList.length <= 0) { return Promise.resolve('空数组') }
  return request({
    baseURL,
    url: '/users/',
    data: {
      list: uidList
    },
    method: 'delete'
  })
}

/**
 * 更新用户信息
 */
export function updateUser(user) {
  return request({
    baseURL,
    url: `/users/${user.uid}`,
    method: 'put',
    data: user
  })
}
