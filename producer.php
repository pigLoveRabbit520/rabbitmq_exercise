<?php

use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;

include_once __DIR__ . '/vendor/autoload.php';

const QUEUE_NAME = 'notify_queue';


function addToMQ(AMQPStreamConnection $conn, array $data) {
    $channel = $conn->channel();
    $exchangeName = QUEUE_NAME . '_exchange';
    $channel->exchange_declare($exchangeName, 'direct', false, true, false);  //声明初始化交换机
    $channel->queue_declare(QUEUE_NAME, false, true, false, false); // 声明初始化一条队列
    $channel->queue_bind(QUEUE_NAME, $exchangeName, QUEUE_NAME); //将队列与某个交换机进行绑定，并使用路由关键字

    $msg = new AMQPMessage(json_encode($data), [
        'delivery_mode' => AMQPMessage::DELIVERY_MODE_PERSISTENT
    ]); // message persistence
    $channel->basic_publish($msg, $exchangeName, QUEUE_NAME);

    $channel->close();
}

$host = '192.168.3.100';
$port = 56720;
$user = 'local_test';
$passwd = 'DkqkuGkOsBTzKtMt';
$vhost = '/';

try {
    $conn = new AMQPStreamConnection($host, $port, $user, $passwd, $vhost);

    addToMQ($conn, [
        'uid' => rand(1, 100),
        'name' => 'salamander'
    ]);

    $conn->close();
    echo 'send message success!';
} catch (\Exception $exception) {
    echo 'send mq message failed: ' . $exception->getMessage();
}