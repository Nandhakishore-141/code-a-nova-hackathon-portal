const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

let memoryServerInstance = null;

/**
 * Checks whether a configured MONGO_URI is missing or still uses template placeholders.
 */
const isPlaceholderMongoUri = (uri) => {
  if (!uri || !uri.trim()) return true;
  const normalized = uri.trim();
  return (
    normalized.includes('<username>') ||
    normalized.includes('<password>') ||
    normalized.includes('<cluster>') ||
    normalized.startsWith('your_')
  );
};

/**
 * Connects Mongoose to MongoDB Atlas (or a local embedded MongoDB instance in dev fallback mode).
 */
const connectDatabase = async () => {
  const configuredUri = process.env.MONGO_URI;

  if (!isPlaceholderMongoUri(configuredUri)) {
    const conn = await mongoose.connect(configuredUri.trim());
    console.log(`[DB] Connected to MongoDB host: ${conn.connection.host}`);
    return conn;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'MONGO_URI must be configured with a valid MongoDB connection string in production.'
    );
  }

  // Dev fallback: boot embedded MongoDB from devDependencies so local testing works without global mongod
  const { MongoMemoryServer } = require('mongodb-memory-server');
  const localDbDir = path.join(__dirname, '..', '.local-db');
  fs.mkdirSync(localDbDir, { recursive: true });

  try {
    memoryServerInstance = await MongoMemoryServer.create({
      instance: {
        dbName: 'codeanova',
        dbPath: localDbDir,
        storageEngine: 'wiredTiger',
      },
    });
  } catch (persistErr) {
    console.warn(
      `[DB] Persistent local-db fallback failed (${persistErr.message}); switching to ephemeral local MongoDB.`
    );
    memoryServerInstance = await MongoMemoryServer.create({
      instance: { dbName: 'codeanova' },
    });
  }

  const localUri = memoryServerInstance.getUri('codeanova');
  const conn = await mongoose.connect(localUri);
  console.log(`[DB] Connected to local embedded MongoDB (${localUri})`);
  console.log('[DB] Tip: Set MONGO_URI in server/.env when ready to use MongoDB Atlas.');
  return conn;
};

/**
 * Gracefully shuts down Mongoose and any local embedded MongoDB process.
 */
const closeDatabase = async () => {
  await mongoose.connection.close();
  if (memoryServerInstance) {
    await memoryServerInstance.stop();
    memoryServerInstance = null;
  }
};

module.exports = {
  connectDatabase,
  closeDatabase,
};
