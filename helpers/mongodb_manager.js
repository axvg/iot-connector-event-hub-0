const { MongoClient } = require('mongodb');

class DBManager {
    constructor(uri, dbName, collectionName) {
        this.uri = uri;
        this.dbName = dbName;
        this.collectionName = collectionName;
        this.client = new MongoClient(this.uri);
    }

    async connect() {
        await this.client.connect();
        this.db = this.client.db(this.dbName);
        this.collection = this.db.collection(this.collectionName);
    }

    async doesCollectionExistInDb(collectionName) {
        const collections = await this.db.collections();
        return collections.some(
            (collection) => collection.collectionName === collectionName
        );
    }

    async createCollection(timeSeriesOptions) {
        let collectionExists = await this.doesCollectionExistInDb(this.collectionName)
        if (!collectionExists) {
            await this.db.createCollection(this.collectionName, timeSeriesOptions);
        }
    }

    async insertData(data) {
        const result = await this.collection.insertMany(data);
        return result.insertedCount;
    }

    async close() {
        await this.client.close();
    }
}



module.exports = {
    DBManager
};