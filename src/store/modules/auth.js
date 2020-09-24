import { login } from '@/api/auth'

const util = {
  getToken() {
    return localStorage.getItem('token')
  },
  setToken(token) {
    localStorage.setItem('token', token)
  },
  removeToken() {
    localStorage.removeItem('token')
  }
}
const state = {
  uid: '',
  phone: '',
  age: 99,
  sex: true,
  name: '',
  email: '',
  password: '',
  portrait: '',
  token: util.getToken(),
  template: {
    mark: [],
    mine: [],
    use: []
  },
  organization: {
    status: 0,
    permission: {},
    roles: [
      {
        rid: '',
        name: ''
      }
    ],
    department: {
      did: '',
      name: '',
      leader: false
    }
  }
}

const mutations = {
  SET_USER(state, user) {
    Object.assign(state, user)
    util.setToken(user.token)
  }
}

const actions = {
  async loginByToken({ commit }) {
    const token = util.getToken()
    console.log(token)
    await login({ token })
      .then(res => {
        commit('SET_USER', res)
      })
  },
  async loginByPw({ commit }, auth) {
    await login(auth)
      .then(res => {
        commit('SET_USER', res)
      })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
