import fs from 'fs'

import FloatClient from './src'

const client = new FloatClient({
  account_name: '',
  password: '',
  auth_code: '',
  sha_sentryfile: fs.readFileSync('access.sentry')
}, true)

client
  .on('ready', () => {

    client.requestFloat('S76561198190349706A4757476613D16467978012840927110')
      .then(floatValue => console.log('Skin float value:', floatValue))

  })
  .on('sentry', data => {
    console.log('sentry', data)
    fs.writeFileSync('access.sentry', data)
  })
  .on('error', err => console.log(err))
