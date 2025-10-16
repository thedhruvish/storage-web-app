import { model, Schema } from "mongoose";

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
      default: null,
    },
    path: [
      {
        type: Schema.Types.ObjectId,
        ref: "Directory",
      },
    ],
    permission: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
        role: {
          type: String,
          enum: ["owner", "manager", "editor", "viewer"],
          default: "viewer",
        },
      },
    ],
    isStarred: {
      type: Boolean,
      default: false,
    },
    metaData: {
      type: Object,
    },
  },
  { timestamps: true },
);

const Directory = model("Directory", directorySchema);
export default Directory;
