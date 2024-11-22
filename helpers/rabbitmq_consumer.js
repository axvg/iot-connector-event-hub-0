const amqp = require('amqplib/callback_api');
const dbFactory = require('./db_factory');
const appConstants = require('../app_constants');
const socket = require('./websocket_manager');
const WebSocket = require('ws');


function consumerTask(consumerName, exchangeName, exchangeType, queueName, routingKey, amqpAddr) {
    amqp.connect(amqpAddr, (error0, connection) => {
        if (error0) {
            console.error('Error connecting to RabbitMQ:', error0.message);
            return;
        }

        connection.createChannel((error1, channel) => {
            if (error1) {
                console.error('Error creating channel:', error1.message);
                return;
            }

            // Assert the exchange
            channel.assertExchange(exchangeName, exchangeType, { durable: true });

            // Assert the queue
            channel.assertQueue(queueName, { durable: true });

            // Bind the queue to the exchange with the specified routing key
            channel.bindQueue(queueName, exchangeName, routingKey);

            channel.prefetch(1); // Process only one message at a time
            console.log('Connected. Waiting for messages. /n To exit, press CTRL+C');


            channel.consume(
                queueName,
                (msg) => {
                    try {
                        const message = msg.content.toString();
                        formatedData = dbFactory.formatTimeSeriesData(JSON.parse(message));
                        dbFactory.storeTimeSeriesData(formatedData, appConstants.DBConnectionParams.DB_TELEMETRY_COLLECTION);


                        let endpoint = appConstants.WsDeviceRouter.URL;
                        let token = appConstants.WsDeviceRouter.WS_API_KEY;
                        let wsUrl = endpoint + token;
                        // console.log("connecting to: " + wsUrl)



                        try {
                            const ws = new WebSocket(wsUrl);
                            ws.on('error', console.error);

                            let wsData = dbFactory.formatWebSocketTimeSeriesData(formatedData);

                            ws.on('open', function open() {
                                for (const deviceId in wsData) {
                                    ws.send(`${deviceId}:|telemetry:|${JSON.stringify(wsData[deviceId])}`);
                                    // console.log(`ID: ${deviceId}`);
                                }

                            });
                        } catch (error) {
                            console.log(error.message);
                        }

                        console.log(`${consumerName} : Received & Processed a Task`);
                        // Acknoledge to get next message.
                        channel.ack(msg);
                    } catch (error) {
                        console.error('Error processing message:', error);
                        // Handle the error as needed, e.g., log it or take specific actions
                        // Acknoledge to get next message.
                        channel.ack(msg);
                    }
                },
                { noAck: false }
            );
        });
    });
}


function createQueue(exchangeName, exchangeType, queueName, routingKey, amqpAddr) {
    amqp.connect(amqpAddr, (error0, connection) => {
        if (error0) {
            console.error('createQueue: Error connecting to RabbitMQ:', error0.message);
            return;
        }

        connection.createChannel((error1, channel) => {
            if (error1) {
                console.error('createQueue: Error creating channel:', error1.message);
                return;
            }

            // Assert the exchange
            channel.assertExchange(exchangeName, exchangeType, { durable: true });

            // Assert the queue
            channel.assertQueue(queueName, { durable: true });

            // Bind the queue to the exchange with the specified routing key
            channel.bindQueue(queueName, exchangeName, routingKey);

            console.log(`Created: queue = ${queueName}, exchange = ${exchangeName}, exchange_type = ${exchangeType} , routing_key = ${routingKey}.`);

            //channel.close();

        });
    });
}




module.exports = {
    consumerTask, createQueue,
};