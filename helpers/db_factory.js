const tsDBManager = require('./mongodb_manager');
const appConstants = require('../app_constants');
const { v4: uuidv4 } = require('uuid');


async function createTimeSeriesCollection(collectionName) {
    const uri = appConstants.DBConnectionParams.DB_HOST;
    const dbName = appConstants.DBConnectionParams.DB_NAME;
    const timeSeriesDB = new tsDBManager.DBManager(uri, dbName, collectionName);

    try {
        await timeSeriesDB.connect();

        const timeSeriesOptions = {
            timeseries: {
                timeField: 'timestamp',
                metaField: 'tags',
            },
        };

        await timeSeriesDB.createCollection(timeSeriesOptions);
    } catch (error) {
        console.error(error);
    } finally {
        timeSeriesDB.close();
    }
}

async function storeTimeSeriesData(tsData, collectionName) {
    const uri = appConstants.DBConnectionParams.DB_HOST;
    const dbName = appConstants.DBConnectionParams.DB_NAME;
    const timeSeriesDB = new tsDBManager.DBManager(uri, dbName, collectionName);

    try {
        await timeSeriesDB.connect();
        const insertedCount = await timeSeriesDB.insertData(tsData);
    } catch (error) {
        console.error(error);
    } finally {
        timeSeriesDB.close();
    }
}


function formatTimeSeriesData(tsData) {
    let formatedData = [];
    if (tsData.type == appConstants.RouteTypes.TELEMETRY) {
        for (let device of tsData.data) {
            for (let state of device.states) {
                let entry = {
                    _id: uuidv4(),
                    timestamp: convertDateStringToUTC(device.log_time),
                    value: state.value,
                    tags: {
                        name: state.name,
                        device_type: device.type,
                        device_id: device.device_id,
                        device_parent: device.parent,
                        log_id: device.log_id
                    }
                }
                formatedData.push(entry);

            }
        }
    }

    return formatedData;
}


function formatWebSocketTimeSeriesData(tsDataFormated) {
    let timeSeriesData = JSON.parse(JSON.stringify(tsDataFormated));
    let formatedData = {};
    for (let tsData of timeSeriesData) {
        let entry = {
            timestamp: convertTimeToTimeZone(convertDateStringToUTC(tsData.timestamp)),
            value: tsData.value,
            device_id: tsData.tags.device_id,
            name: tsData.tags.name,
            device_type: tsData.tags.device_type
        }
        if (formatedData[entry.device_id] == null) {
            formatedData[entry.device_id] = []
        }
        formatedData[entry.device_id].push(entry);

    }
    return formatedData;
}


function convertTimeToTimeZone(utcTimestamp) {
    const convertedTime = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        timeZoneName: 'short'
    }).format(utcTimestamp);

    return convertedTime;
}


function convertDateStringToUTC(dateString) {
    // Parse the date string
    const dateObject = new Date(dateString);

    // Convert the date to UTC
    const utcDate = new Date(Date.UTC(
        dateObject.getUTCFullYear(),
        dateObject.getUTCMonth(),
        dateObject.getUTCDate(),
        dateObject.getUTCHours(),
        dateObject.getUTCMinutes(),
        dateObject.getUTCSeconds()
    ));

    return utcDate;
}




module.exports = {
    storeTimeSeriesData, formatTimeSeriesData, createTimeSeriesCollection, formatWebSocketTimeSeriesData
};


