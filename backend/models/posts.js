import mongoose from "mongoose";

const causeOptions = [
  "educationAndChildren",
  "healthAndMedical",
  "disasterRelief",
  "environmentAndClimate",
  "povertyAndHunger",
  "communityDevelopment",
  "livelihoodAndSkillsTraining",
  "animalWelfare",
  "others"
];

const inKindItemSchema = new mongoose.Schema({
  itemName: String,
  targetQuantity: Number,
  currentQuantity: { type: Number, default: 0 },
  unit: String,
  status: {
    type: String,
    enum: ["Open", "Closed"],
    default: "Open"
  }
});

const postSchema = new mongoose.Schema({
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true
  },

  projectName: { type: String, required: true },
  description: String,
  category: String,

  cause: {
    type: String,
    enum: causeOptions,
    required: true
  },

  location: String,
  impactGoals: String,

  supportTypes: {
    monetary: {
      enabled: Boolean,
      targetAmount: Number,
      currentAmount: { type: Number, default: 0 },
      status: {
        type: String,
        enum: ["Open", "Closed"],
        default: "Open"
      }
    },

    inKind: [inKindItemSchema],

    volunteer: {
      enabled: Boolean,
      targetVolunteers: Number,
      currentVolunteers: { type: Number, default: 0 },
      status: {
        type: String,
        enum: ["Open", "Closed"],
        default: "Open"
      }
    }
  },

  overallStatus: {
    type: String,
    enum: ["Draft", "Published"],
    default: "Draft"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Post", postSchema);