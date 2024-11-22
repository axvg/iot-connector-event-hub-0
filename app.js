const express = require('express');
const amqp = require('amqplib/callback_api');
const rmqConsumer = require('./helpers/rabbitmq_consumer');
const app_constants = require('./app_constants');
const dbFactory = require('./helpers/db_factory');


const port = 7080;
const app = express();

app.get('/healthz', (req, res) => {
    // Check if app is healthy (e.g., RabbitMQ connection is active)
    res.sendStatus(200);
});

app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
});


async function startConsumer(){
    const total_consumers = 4;
    const telemetryExchangeName = `iot_device.${app_constants.RouteTypes.TELEMETRY}`;
    const commandExchangeName = "iot_device.COMMAND";
    const queueName = `devices_queue.${app_constants.RouteTypes.TELEMETRY}`;
    const amqpAddr = app_constants.RabbitMqConnectionParams.AMQP_HOST;
    const routeKey = `devices_route.${app_constants.RouteTypes.TELEMETRY}`;

    await dbFactory.createTimeSeriesCollection(app_constants.DBConnectionParams.DB_TELEMETRY_COLLECTION);

    rmqConsumer.createQueue(commandExchangeName, "topic", queueName, "mqtt.publish.TELEMETRY", amqpAddr);

    for (let i = 0; i < total_consumers; i++){
        rmqConsumer.consumerTask("Consumer-" + i, telemetryExchangeName, 'fanout', queueName, routeKey, amqpAddr);
    }
}



// rmqConsumer.createQueue("iot_device.COMMAND", "topic", queueName, "mqtt.*", amqpAddr);

startConsumer();

