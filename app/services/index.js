import DB from '../db'
let db = new DB()
let connect = db.init()
let ultron = connect.ultron

export default {
  addUltron (ultronData, callback) {
    ultron.insert(ultronData, (err, docs) => {
      if (err) {
      }
      return callback(docs)
    })
  }
}
