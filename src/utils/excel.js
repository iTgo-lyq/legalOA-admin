import ExcelJS from 'exceljs'

function Miner(row, headIndex) {
  this.row = row
  this.headIndex = headIndex

  this.value = function(key, defaultV, format) {
    const index = headIndex[key]
    let v
    if (index) v = this.row.getCell(index).text
    return typeof v !== 'undefined' ? format ? format(v) : v : defaultV
  }
}

function getHeadIndex(worksheet) {
  const headIndex = {
    phone: undefined,
    age: undefined,
    sex: undefined,
    name: undefined,
    email: undefined,
    password: undefined,
    status: undefined,
    roles: undefined,
    leader: undefined,
    departmentName: undefined
  }
  const firstRow = worksheet.getRow(1)

  firstRow.eachCell((cell, index) => headIndex[cell.text] = index)

  return headIndex
}

function getTable(worksheet, headIndex) {
  const table = []

  worksheet.eachRow((row, index) => {
    if (index == 1) return
    const miner = new Miner(row, headIndex)
    const src = {
      phone: miner.value('phone', ''),
      age: miner.value('age', 99, parseInt),
      sex: miner.value('sex', true, (sex) => sex == '男'),
      name: miner.value('name', ''),
      email: miner.value('email', ''),
      password: miner.value('password', '000000'),
      status: miner.value('status', 1, parseInt),
      roles: miner.value('roles', [], (roles) => roles.trim().split(/\s+/)),
      leader: miner.value('leader', false, (leader) => leader == '是'),
      departmentName: miner.value('departmentName', '')
    }

    table.push(src)
  })
  return table
}

export function userExcelReader(callback) {
  return async function(e) {
    if (!callback) return
    const data = e.target.result
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(data)
    const worksheet = workbook.getWorksheet(1)
    const headIndex = getHeadIndex(worksheet)
    const table = getTable(worksheet, headIndex)
    return callback(table)
  }
}
