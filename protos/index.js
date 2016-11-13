const protobuf = require('protobufjs')
const path = require('path')

const builder = protobuf.newBuilder()

protobuf.convertFieldsToCamelCase = false
protobuf.loadProtoFile(path.join(__dirname, '/base_gcmessages.proto'), builder)
protobuf.loadProtoFile(path.join(__dirname, '/gcsdk_gcmessages.proto'), builder)
protobuf.loadProtoFile(path.join(__dirname, '/cstrike15_gcmessages.proto'), builder)

module.exports = builder.build()
