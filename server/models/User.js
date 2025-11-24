import mongoose from "mongoose";

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      maxlength: 50,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 5,
    },

    phoneNumber: {
      type: String,
      default: "",
    },

    /** High-level system role (permissions) */
    role: {
      type: String,
      enum: ["user", "admin", "superadmin"],
      default: "admin",
    },

    /** Kitchen / location they belong to */
    kitchen: {
      type: String,
      enum: ["MCNY", "WILF", "OFFSITE", "OTHER"],
      default: "MCNY",
    },

    /** Their position in the operation (for UI only) */
    position: {
      type: String,
      enum: [
        "executive_chef",
        "prep_manager",
        "sous_chef",
        "pastry",
        "line_cook",
        "service",
        "read_only",
      ],
      default: "prep_manager",
    },

    /** Whether account is active in PrepDeck */
    isActive: {
      type: Boolean,
      default: true,
    },

    /** Optional avatar/profile photo */
    avatarUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, // createdAt / updatedAt
  }
);

export default mongoose.model("User", UserSchema);
