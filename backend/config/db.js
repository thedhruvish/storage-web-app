import mongoose from "mongoose";

let conn = null;
export const connectDB = async () => {
  const mongodbURL = process.env.MONGO_URL;
  if (!mongodbURL) {
    throw new Error("add Mongodb Url in env file");
  }
  if (conn) return conn;
  if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
    conn = mongoose.createConnection(mongodbURL, {
      serverSelectionTimeoutMS: 5000,
    });
    await conn.asPromise();
  } else {
    await mongoose.connect(mongodbURL, {
      tls: true,
      tlsAllowInvalidCertificates: true,
    });
  }
};
