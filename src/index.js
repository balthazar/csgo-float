import q from 'q'
import crypto from 'crypto'
import { EventEmitter } from 'events'
import {
  SteamClient,
  SteamUser,
  SteamGameCoordinator,
  EResult,
  EPersonaState
} from 'steam'

import protos from '../protos'

export default class FloatClient extends EventEmitter {

  constructor (props, debug) {

    super()

    this._client = new SteamClient()
    this._user = new SteamUser(this._client)
    this._gc = new SteamGameCoordinator(this._client, 730)

    this._gcReady = false
    this._mask = 0x80000000
    this._helloInt = null
    this._promise = null

    this.debug = debug || false

    this._client.on('connected', () => {
      if (this.debug) { console.log('[connected]') }
      this.emit('connected')
      this._user.logOn(props)
    })

    this._client.on('logOnResponse', response => {
      if (response.eresult !== EResult.OK) {
        if (this.debug) { console.log('[login failed]') }
        return this.emit('disconnected')
      }

      if (this.debug) { console.log('[logged]') }
      this.emit('logged')

      this._user.gamesPlayed({
        games_played: [{ game_id: '730' }]
      })

      this._helloInt = setInterval(::this._sayHello, 2e3)
      this._sayHello()
    })

    this._client.on('error', this.emit.bind(this, 'error'))

    this._user.on('updateMachineAuth', (response, cb) => {
      const sha_file = this._sha1(response.bytes)
      this.emit('sentry', sha_file)
      cb({ sha_file })
    })

    this._gc.on('message', ::this._handleGcMessage)
    this._gc._client.on('message', ::this._handleGcMessage)

    this._client.connect()

  }

  requestFloat (url) {

    if (!this._gcLoaded) { return this.emit('error', new Error('GC not loaded.')) }
    if (!url) { return }
    if (this._defer && this._defer.promise.inspect().state === 'pending') { return q.reject('Request already in progress.') }

    const arr = url.match(/[SM]([0-9]*)A([0-9]*)D([0-9]*)/)

    const firstS = url[0] === 'S'
    const param_s = firstS ? arr[1] : '0'
    const param_m = firstS ? '0' : arr[1]
    const param_a = arr[2]
    const param_d = arr[3]

    this._gc.send({ msg: 9156, proto: {} }, new protos.CMsgGCCStrike15_v2_Client2GCEconPreviewDataBlockRequest({
      param_s,
      param_a,
      param_d,
      param_m
    }).toBuffer())

    this._defer = q.defer()
    return this._defer.promise

  }

  /**
   * Decode the float response
   */
  _decodeFloat (header, msg) {
    const response = new protos.CMsgGCCStrike15_v2_Client2GCEconPreviewDataBlockResponse.decode(msg)

    const buf = new Buffer(4)
    buf.writeUInt32LE(+response.iteminfo.paintwear, 0)
    if (this._defer) {
      this._defer.resolve(buf.readFloatLE(0).toString())
    }
  }

  /**
   * Handle all gc messages.
   */
  _handleGcMessage (header, buffer, callback) {
    const type = header.msg & ~this._mask;
    if (this.debug) { console.log('[message]', type) }

    if (type === 4004) { this._gcLoaded() }
    if (type === 9157) { this._decodeFloat(header, buffer) }
    if (callback) { callback(header, buffer) }
  }

  /**
   * Send hello to the gc once we're logged
   */
  _sayHello () {
    if (!this._gc) { return }
    this._gc.send({ msg: 4006, proto: {} }, new protos.CMsgClientHello({}).toBuffer())
  }

  /**
   * Called once the gc is ready, stop saying hello
   */
  _gcLoaded () {
    if (this._gcReady) { return }
    if (this.debug) { console.log('[ready]') }

    clearInterval(this._helloInt)
    this._helloInt = null
    this._gcReady = true
    this.emit('ready')
  }

  /**
   * Create the sha1 hash of the sentry file
   */
  _sha1 (data) {
    const hash = crypto.createHash('sha1')
    hash.update(data)
    return hash.digest()
  }

}
