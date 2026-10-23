const mongoose = require('mongoose');

const ATLAS_URI =
  'mongodb+srv://chaturvedisuryakant2005_db_user:Admin%402026@cluster0.uriplyt.mongodb.net/classsathi_attendance?retryWrites=true&w=majority';

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || ATLAS_URI;
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
