require('dotenv').config();




module.exports.DBConnectionParams = {
    DB_HOST: process.env.DB_HOST,
    DB_PORT: parseInt(process.env.DB_PORT),
    DB_NAME: process.env.DB_NAME,
    DB_TELEMETRY_COLLECTION: 'telemetry_series_db'
};

module.exports.RabbitMqConnectionParams = {
    AMQP_HOST: `amqp://${process.env.RABBIT_MQ_USER_NAME}:${process.env.RABBIT_MQ_PASSWORD}@${process.env.RABBIT_MQ_HOST}:${process.env.RABBIT_MQ_AMQP_PORT}`,
    // PORT: 15672,
};

module.exports.RouteTypes = {
    TELEMETRY: "TELEMETRY",
    ALERTS: "ALERTS",
};

let WS_URL = process.env.WS_URL;
if (process.env.USE_DEFAULT_PORT.toLowerCase() === "true"){
    WS_URL = process.env.WS_DEFAULT_URL;
}

module.exports.WsDeviceRouter = {
    URL: WS_URL + ":" + process.env.WS_PORT + "/ws/", //"ws://localhost:8000/ws/",  or "ws://127.0.0.1:8000/ws/"
    WS_API_KEY : "device_router:" + process.env.WS_API_KEY
};