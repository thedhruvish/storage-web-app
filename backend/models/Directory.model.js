import { model, Schema } from "mongoose";
import { PERMISSION_ROLE } from "../constants/role.js";

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
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          default: null,
        },
        role: {
          type: String,
          enum: PERMISSION_ROLE,
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
    trashAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

const Directory = model("Directory", directorySchema);
export default Directory;
