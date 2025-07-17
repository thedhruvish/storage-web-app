import { model } from "mongoose";

const directorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    parentDirId: {
      type: Schema.Types.ObjectId,
      ref: "Directory",
      required: true,
    },
    metaData: {
      type: Object,
    },
  },
  { timestamps: true },
);

const Directory = model("Directory", directorySchema);
export default Directory;
