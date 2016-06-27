import jetpack from 'fs-jetpack'
import fs from 'fs'
import DataStore from 'nedb'
import { remote } from 'electron'

export default class {
  constructor () {
    this.db = null
    this.useDataDir = jetpack.cwd(remote.app.getPath('userData'))
  }

  createOrReadDatabase (dbname) {
    let yesUltron = fs.existsSync(this.useDataDir.path(dbname.ultron))
    if (yesUltron) {
      let ultronData = fs.readFileSync(this.useDataDir.path(dbname.ultron))
      let database = {}

      if (!ultronData) {
        return
      }

      database.ultron = new DataStore({
        filename: this.useDataDir.path(dbname.ultron),
        autoload: true
      })
      return database
    } else {
      try {
        this.useDataDir.write(dbname.ultron)

        let database = {}

        database.ultron = new DataStore({
          filename: this.useDataDir.path(dbname.ultron),
          autoload: true
        })
        return database
      } catch (e) {
        console.log(e)
      }
    }
  }

  init () {
    if (this.db) {
      return this.db
    }
    this.db = this.createOrReadDatabase({
      'ultron': 'ultron.db',
    })
    return this.db
  }
}
