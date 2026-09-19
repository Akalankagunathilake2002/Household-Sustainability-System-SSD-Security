const Action = require("../models/Action");

const getEnvironmentalScore = (category) => {
  switch (category) {
    case "Waste Reduction":
      return 10;
    case "Energy Efficiency":
      return 15;
    case "Water Conservation":
      return 12;
    case "Sustainable DIY":
      return 8;
    case "Eco Shopping":
      return 5;
    case "Community Action":
      return 20;
    default:
      return 0;
  }
};

const calculateScores = (action) => {
  const environmentalScore = getEnvironmentalScore(action.category);
  const engagementScore =
    action.likes.length * 2 +
    action.comments.length * 3;

  return {
    environmentalScore,
    engagementScore,
    totalScore: environmentalScore + engagementScore,
  };
};

// CREATE

// exports.createAction = async (req, res) => {
//   try {
//     console.log("FILES:", req.files);
// console.log("BODY:", req.body);
//     const action = new Action({
//       title: req.body.title,
//       description: req.body.description,
//       category: req.body.category,
//       images: req.files && req.files.length > 0 
//       ? req.files.map(f => f.path)
//       : [],
//       createdBy: req.user.id,
//     });

//     await action.save();
//     res.status(201).json(action);
//   // } catch (err) {
//   //   res.status(500).json({ msg: err.message });
//   // }
//   }catch (err) {
//   console.error("ERROR:", err); // 🔥 IMPORTANT
//   res.status(500).json({ msg: err.message });
// }
// };

exports.createAction = async (req, res) => {
  try {
    const action = new Action({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      images: req.files && req.files.length > 0
        ? req.files.map((f) => f.path)
        : [],
      createdBy: req.user.id,
    });

    await action.save();

    const created = await Action.findById(action._id)
      .populate("createdBy", "username")
      .populate("comments.user", "username");

    res.status(201).json({
      ...created._doc,
      ...calculateScores(created),
    });
  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};

// GET ALL
exports.getActions = async (req, res) => {
  try {
    const actions = await Action.find()
      .populate("createdBy", "username")
      .populate("comments.user", "username")
      .sort({ createdAt: -1 });

    const formatted = actions.map((action) => ({
      ...action._doc,
      ...calculateScores(action),
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// UPDATE (OWNER ONLY)
exports.updateAction = async (req, res) => {
  try {
    const action = await Action.findById(req.params.id);

    if (!action)
      return res.status(404).json({ msg: "Not found" });

    if (action.createdBy.toString() !== req.user.id)
      return res.status(403).json({ msg: "Only owner can edit" });

    const updateData = { ...req.body };

    // 🔥 KEEP EXISTING IMAGES (from frontend)
    if (req.body.existingImages) {
      updateData.images = JSON.parse(req.body.existingImages);
    } else {
      updateData.images = [];
    }

    // 🔥 ADD NEW IMAGES (Cloudinary)
    if (req.files && req.files.length > 0) {
      updateData.images = [
        ...updateData.images,
        ...req.files.map(f => f.path),
      ];
    }

    const updated = await Action.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
      .populate("createdBy", "username")
      .populate("comments.user", "username");

    res.json({
      ...updated._doc,
      ...calculateScores(updated),
    });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// DELETE (OWNER OR ADMIN)
exports.deleteAction = async (req, res) => {
  try {
    const action = await Action.findById(req.params.id);

    if (!action)
      return res.status(404).json({ msg: "Not found" });

    if (
      action.createdBy.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    await action.deleteOne();
    res.json({ msg: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// LIKE
exports.likeAction = async (req, res) => {
  try {
    const action = await Action.findById(req.params.id);

    if (
      action.likes.some(
        (like) => like.user.toString() === req.user.id
      )
    ) {
      return res.status(400).json({ msg: "Already liked" });
    }

    action.likes.unshift({ user: req.user.id });
    await action.save();


// 🔥 GET UPDATED ACTION WITH USERNAMES
const updated = await Action.findById(req.params.id)
  .populate("createdBy", "username")
  .populate("comments.user", "username");

// 🔥 RETURN WITH CALCULATED SCORE
res.json({
  ...updated._doc,
  ...calculateScores(updated),
});
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// UNLIKE
exports.unlikeAction = async (req, res) => {
  try {
    const action = await Action.findById(req.params.id);

    action.likes = action.likes.filter(
      (like) => like.user.toString() !== req.user.id
    );

    await action.save();
    const updated = await Action.findById(req.params.id)
  .populate("createdBy", "username")
  .populate("comments.user", "username");

res.json({
  ...updated._doc,
  ...calculateScores(updated),
});
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// COMMENT
exports.commentAction = async (req, res) => {
  try {
    const action = await Action.findById(req.params.id);

    action.comments.unshift({
      user: req.user.id,
      text: req.body.text,
    });

    await action.save();
   const updated = await Action.findById(req.params.id)
  .populate("createdBy", "username")
  .populate("comments.user", "username");

res.json({
  ...updated._doc,
  ...calculateScores(updated),
});
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// DELETE COMMENT
exports.deleteComment = async (req, res) => {
  try {
    const action = await Action.findById(req.params.id);

    const comment = action.comments.find(
      (c) => c._id.toString() === req.params.commentId
    );

    if (!comment)
      return res.status(404).json({ msg: "Comment not found" });

    if (
      comment.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    action.comments = action.comments.filter(
      (c) => c._id.toString() !== req.params.commentId
    );

    await action.save();
   const updated = await Action.findById(req.params.id)
  .populate("createdBy", "username")
  .populate("comments.user", "username");

res.json({
  ...updated._doc,
  ...calculateScores(updated),
});
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// REPORT
exports.reportAction = async (req, res) => {
  try {
    const action = await Action.findById(req.params.id);

    if (
      action.reports.some(
        (r) => r.user.toString() === req.user.id
      )
    ) {
      return res.status(400).json({ msg: "Already reported" });
    }

    action.reports.push({
      user: req.user.id,
      reason: req.body.reason,
    });

    if (action.reports.length >= 3) {
      action.isFlagged = true;
    }

    await action.save();
    res.json({ msg: "Reported" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ADMIN VIEW FLAGGED
exports.getFlaggedActions = async (req, res) => {
  try {
    const actions = await Action.find({ isFlagged: true })
      .populate("createdBy", "username")
      .populate("comments.user", "username")
      .populate("reports.user", "username");// 🔥 IMPORTANT

    const formatted = actions.map((action) => ({
      ...action._doc,
      ...calculateScores(action),
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

