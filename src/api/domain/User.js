export default class {
  uid = ''
  phone = ''
  age = 99
  sex = true
  name = ''
  email = ''
  password = ''
  portrait = ''
  token = ''
  template = {
    mark: [],
    mine: [],
    use: []
  }
  organization = {
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
