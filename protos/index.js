const protobuf = require('protobufjs')

const builder = protobuf.newBuilder()

protobuf.convertFieldsToCamelCase = false
protobuf.loadProtoFile(__dirname + '/base_gcmessages.proto', builder)
protobuf.loadProtoFile(__dirname + '/gcsdk_gcmessages.proto', builder)
protobuf.loadProtoFile(__dirname + '/cstrike15_gcmessages.proto', builder)

module.exports = builder.build()
