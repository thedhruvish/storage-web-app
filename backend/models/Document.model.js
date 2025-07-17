import { model, Schema } from "mongoose";
const documentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    extension: {
      type: String,
      required: true,
    },
    parentDirId: {
      type: Schema.Types.ObjectId,
      ref: "Dir",
      required: true,
    },
    metaData: {
      type: Object,
    },
  },
  { timestamps: true },
);

const Document = model("Document", documentSchema);
export default Document;
