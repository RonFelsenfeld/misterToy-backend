export default {
  dbURL:
    process.env.MONGO_URL ||
    'mongodb+srv://ronF:ron123@mistertoy-cluster.tbahger.mongodb.net/?retryWrites=true&w=majority&appName=misterToy-cluster',
  dbName: process.env.DB_NAME || 'misterToy_db',
}
