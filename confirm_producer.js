const QUEUE_NAME = 'notify_queue'
const EXCHANGE_NAME = 'notify_queue_exchange'
const config = require("./config")
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

async function run(rmqConn, msgArr) {
    try {
        const ch = await rmqConn.createConfirmChannel()
        await ch.assertExchange(EXCHANGE_NAME, 'direct', { durable: true, autoDelete: false })
        // queue name当routing key
        msgArr.forEach(str => {
            ch.publish(EXCHANGE_NAME, QUEUE_NAME, Buffer.from(str), { persistent: true })  // 没有绑定队列的情况下,也可以发送
        })
        await ch.waitForConfirms()
        console.log('发送批量数据成功')
        await ch.close()
    } catch(err) {
        // do something with err
        console.log('发送批量数据失败:' + err.message)
    }
}

async function testSendBatchMsg() {
    const conn = await getMQConnection()
    await run(conn, [
        'cat',
        'dog',
        'pig',
        'mouse',
        'mouse',
        'penguin'
    ])
    await conn.close()
}


testSendBatchMsg()
