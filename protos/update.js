import fs from 'fs'
import https from 'https'

const baseUrl = 'https://raw.githubusercontent.com/SteamDatabase/GameTracking/master/Protobufs/csgo/'
const protos = [
  'base_gcmessages.proto',
  'cstrike15_gcmessages.proto',
  'gcsdk_gcmessages.proto',
  'steammessages.proto'
]

fs.readdir(__dirname, (err, filenames) => {
  if (err) { return console.log('[Error reading directory]') }

  filenames.forEach(filename => {
    if (filename.indexOf('proto') !== -1) {
      fs.unlinkSync(`${__dirname}/${filename}`)
    }
  })

  protos.forEach(proto => {
    const file = fs.createWriteStream(`${__dirname}/${proto}`)
    https.get(`${baseUrl}${proto}`, response => {
      response.pipe(file)
    })
  })

})
