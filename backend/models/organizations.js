import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema({
  orgName: { type: String, required: true },
  email: { type: String, required: true, unique: true },

  isVerified: { type: Boolean, default: false },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

/*
TO DO:
add password soon
*/

export default mongoose.model("Organization", organizationSchema);