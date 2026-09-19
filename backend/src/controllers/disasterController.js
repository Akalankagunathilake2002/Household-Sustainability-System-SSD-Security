const Disaster = require("../models/Disaster");
const { fetchFemaDisasters } = require("../services/femaService");

// CREATE
exports.createDisaster = async (req, res) => {
  try {
    const disaster = await Disaster.create({
      ...req.body,
      reportedBy: req.user.id,
      source: "manual",
    });

    res.status(201).json(disaster);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// READ ALL
exports.getDisasters = async (req, res) => {
  try {
    const disasters = await Disaster.find().sort({ createdAt: -1 });
    res.json(disasters);
  } catch {
    res.status(500).json({ msg: "Error" });
  }
};

// UPDATE
exports.updateDisaster = async (req, res) => {
  const updated = await Disaster.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updated);
};

// DELETE
exports.deleteDisaster = async (req, res) => {
  await Disaster.findByIdAndDelete(req.params.id);
  res.json({ msg: "Deleted" });
};

// 🔥 LIVE FEMA DATA
exports.getLiveFemaDisasters = async (req, res) => {
  try {
    const data = await fetchFemaDisasters();
    res.json(data);
  } catch {
    res.status(500).json({ msg: "Failed" });
  }
};

// 🔥 IMPORT FEMA DATA
exports.importFemaDisaster = async (req, res) => {
  try {
    const { externalId } = req.body;

    const list = await fetchFemaDisasters();
    const item = list.find((d) => d.externalId === externalId);

    if (!item) return res.status(404).json({ msg: "Not found" });

    const exists = await Disaster.findOne({ externalId });

    if (exists) return res.json(exists);

    const created = await Disaster.create({
      ...item,
      reportedBy: req.user.id,
    });

    res.status(201).json(created);
  } catch {
    res.status(500).json({ msg: "Error" });
  }
};