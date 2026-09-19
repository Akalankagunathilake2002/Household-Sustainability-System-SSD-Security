const mongoose = require("mongoose");
const Roles = require("../utils/roles");

const MessageSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    senderRole: { type: String, enum: Object.values(Roles), required: true },
    text: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const SupportTicketSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },

    // power usage support categories
    category: {
      type: String,
      enum: ["High Bill", "Spike", "Appliance Usage", "Billing Confusion", "Savings Advice", "Other"],
      default: "Other",
    },

    // helpful extra context (optional)
    periodFrom: { type: Date, default: null },
    periodTo: { type: Date, default: null },
    monthlyBillLKR: { type: Number, default: null },
    monthlyKwh: { type: Number, default: null },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
    },

    status: {
      type: String,
      enum: ["new", "need_more_info", "in_progress", "resolved", "closed"],
      default: "new",
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // optional: admin assignment
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    messages: { type: [MessageSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SupportTicket", SupportTicketSchema);