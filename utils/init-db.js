import mongoose from "mongoose";

let mongoInstance;

const connectDb = async () => {
  try {
    if (mongoInstance) {
      return mongoInstance;
    }

    mongoInstance = await mongoose.connect(process.env.MONGO_URI);
  } catch (e) {}
};

export default connectDb;
