import 'dotenv/config';
import mongoose from 'mongoose';

const dropIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    // Get the collection
    const collection = mongoose.connection.collection('students');

    // List all indexes to find the exact name if it's not 'username_1'
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes.map(i => i.name));

    const usernameIndex = indexes.find(i => i.key && i.key.username);

    if (usernameIndex) {
      console.log(`Dropping unique index: ${usernameIndex.name}...`);
      await collection.dropIndex(usernameIndex.name);
      console.log('Index dropped successfully!');
    } else {
      console.log('No unique index found on "username" field.');
    }

  } catch (error) {
    console.error('Error dropping index:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit();
  }
};

dropIndex();
