const SupportTicket = require("../models/SupportTicket");
const Roles = require("../utils/roles");

// USER: Create ticket
// POST /api/issues
exports.createTicket = async (req, res) => {
  try {
    const { title, category, periodFrom, periodTo, monthlyBillLKR, monthlyKwh, text } = req.body;

    if (!title || !text) {
      return res.status(400).json({ msg: "Title and message are required" });
    }

    const ticket = await SupportTicket.create({
      title,
      category: category || "Other",
      periodFrom: periodFrom || null,
      periodTo: periodTo || null,
      monthlyBillLKR: monthlyBillLKR ?? null,
      monthlyKwh: monthlyKwh ?? null,
      createdBy: req.user.id,
      messages: [
        {
          senderId: req.user.id,
          senderRole: req.user.role || Roles.USER,
          text,
        },
      ],
    });

    return res.status(201).json(ticket);
  } catch (err) {
    console.error("createTicket error:", err.message);
    return res.status(500).send("Server error");
  }
};

// USER: Get my tickets
// GET /api/issues/my
exports.getMyTickets = async (req, res) => {
  try {
    const { status, category, priority, search } = req.query;

    const filter = { createdBy: req.user.id };
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (search) filter.title = { $regex: search, $options: "i" };

    const tickets = await SupportTicket.find(filter)
      .sort({ createdAt: -1 })
      .populate("createdBy", "username email role")
      .populate("assignedTo", "username email role");

    return res.json(tickets);
  } catch (err) {
    console.error("getMyTickets error:", err.message);
    return res.status(500).send("Server error");
  }
};

// ADMIN: Get all tickets
// GET /api/issues
exports.getAllTicketsAdmin = async (req, res) => {
  try {
    const { status, category, priority, search } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (search) filter.title = { $regex: search, $options: "i" };

    const tickets = await SupportTicket.find(filter)
      .sort({ createdAt: -1 })
      .populate("createdBy", "username email role")
      .populate("assignedTo", "username email role");

    return res.json(tickets);
  } catch (err) {
    console.error("getAllTicketsAdmin error:", err.message);
    return res.status(500).send("Server error");
  }
};

// USER/ADMIN: Get one ticket (user can only access own)
// GET /api/issues/:id
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate("createdBy", "username email role")
      .populate("assignedTo", "username email role")
      .populate("messages.senderId", "username email role");

    if (!ticket) return res.status(404).json({ msg: "Ticket not found" });

    const isAdmin = req.user.role === Roles.ADMIN;
    const isOwner = String(ticket.createdBy?._id || ticket.createdBy) === String(req.user.id);

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ msg: "Access denied" });
    }

    return res.json(ticket);
  } catch (err) {
    console.error("getTicketById error:", err.message);
    return res.status(500).send("Server error");
  }
};

// USER/ADMIN: Add message (reply)
// POST /api/issues/:id/messages
exports.addMessage = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ msg: "Message text is required" });

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ msg: "Ticket not found" });

    const isAdmin = req.user.role === Roles.ADMIN;
    const isOwner = String(ticket.createdBy) === String(req.user.id);

    // user can only message own ticket
    if (!isAdmin && !isOwner) return res.status(403).json({ msg: "Access denied" });

    ticket.messages.push({
      senderId: req.user.id,
      senderRole: req.user.role || Roles.USER,
      text,
    });

    // optional: auto status move
    if (isAdmin && (ticket.status === "new" || ticket.status === "need_more_info")) {
      ticket.status = "in_progress";
    }
    if (!isAdmin && ticket.status === "need_more_info") {
      ticket.status = "new";
    }

    await ticket.save();

    const populated = await SupportTicket.findById(ticket._id)
      .populate("createdBy", "username email role")
      .populate("assignedTo", "username email role")
      .populate("messages.senderId", "username email role");

    return res.json(populated);
  } catch (err) {
    console.error("addMessage error:", err.message);
    return res.status(500).send("Server error");
  }
};

// ADMIN: Update ticket (status/priority/assign)
// PUT /api/issues/:id
exports.updateTicketAdmin = async (req, res) => {
  try {
    const { status, priority, assignedTo } = req.body;

    const update = {};
    if (status) update.status = status;
    if (priority) update.priority = priority;
    if (assignedTo !== undefined) update.assignedTo = assignedTo || null;

    const updated = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true, runValidators: true }
    )
      .populate("createdBy", "username email role")
      .populate("assignedTo", "username email role")
      .populate("messages.senderId", "username email role");

    if (!updated) return res.status(404).json({ msg: "Ticket not found" });

    return res.json(updated);
  } catch (err) {
    console.error("updateTicketAdmin error:", err.message);
    return res.status(500).send("Server error");
  }
};

// ADMIN: Delete ticket (optional)
// DELETE /api/issues/:id
exports.deleteTicketAdmin = async (req, res) => {
  try {
    const deleted = await SupportTicket.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: "Ticket not found" });

    return res.json({ msg: "Ticket deleted successfully" });
  } catch (err) {
    console.error("deleteTicketAdmin error:", err.message);
    return res.status(500).send("Server error");
  }
};