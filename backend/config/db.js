import mongoose from "mongoose";

export const connectDB = async () => {
  const mongodbURL = process.env.MONGO_URL;
  if (!mongodbURL) {
    throw new Error("add Mongodb Url in env file");
  }
  await mongoose.connect(mongodbURL, {
    tls: true,
    tlsAllowInvalidCertificates: true,
  });
  console.log("db connected");
};
