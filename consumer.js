const QUEUE_NAME = 'notify_queue'
const config = require("./config");
const amqp = require('amqplib')

async function getMQConnection() {
    return await amqp.connect({
        protocol: 'amqp',
        hostname: config.MQ.host,
        port: config.MQ.port,
        username: config.MQ.user,
        password: config.MQ.pass,
        locale: 'en_US',
        frameMax: 0,
        heartbeat: 2, // 心跳
        vhost: config.MQ.vhost,
    })
}


async function start() {
    const mqConn = await getMQConnection()
    console.log('connecting RabbitMQ successfully!')
    const channel = await mqConn.createChannel()
    channel.assertQueue(QUEUE_NAME, {durable: true})

    channel.consume(QUEUE_NAME, async function(msg) {
        console.log("Received msg: %s", msg.content.toString())


    }, {noAck: false}) // ack
}

start()
