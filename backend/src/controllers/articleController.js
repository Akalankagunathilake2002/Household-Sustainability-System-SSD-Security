const Article = require("../models/Article");
const logger = require("../utils/logger");

// CREATE ARTICLE (ADMIN ONLY)
exports.createArticle = async (req, res) => {
  try {
    const { title, content, category, isPublished } = req.body;
    const image = req.file ? req.file.path : req.body.image;

    const article = new Article({
      title,
      content,
      category,
      image,
      isPublished,
      createdBy: req.user.id,
    });

    await article.save();

    res.status(201).json({
      success: true,
      message: "Article created successfully",
      article,
    });
  } catch (error) {
    // Security: Prevent internal error details from being exposed to clients.
    // Detailed exception information must remain server-side; return only a safe generic message.
    logger.error("Article creation failed", { userId: req.user?.id, error: error.message });
    res.status(500).json({
      success: false,
      message: "Failed to create article",
    });
  }
};

// GET ALL PUBLISHED ARTICLES (PUBLIC)
exports.getArticles = async (req, res) => {
  try {
    const articles = await Article.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .populate("createdBy", "username");

    res.status(200).json({
      success: true,
      count: articles.length,
      articles,
    });
  } catch (error) {
    // Security: Prevent internal error details from being exposed to clients.
    // Detailed exception information must remain server-side; return only a safe generic message.
    logger.error("Article fetch failed", { error: error.message });
    res.status(500).json({
      success: false,
      message: "Failed to retrieve articles",
    });
  }
};

// GET SINGLE ARTICLE BY ID (PUBLIC)
exports.getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate("createdBy", "username");

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    res.status(200).json({
      success: true,
      article,
    });
  } catch (error) {
    // Security: Prevent internal error details from being exposed to clients.
    // Detailed exception information must remain server-side; return only a safe generic message.
    logger.error("Article retrieval failed", { articleId: req.params?.id, error: error.message });
    res.status(500).json({
      success: false,
      message: "Failed to retrieve article",
    });
  }
};

// UPDATE ARTICLE (ADMIN ONLY)
exports.updateArticle = async (req, res) => {
  try {
    // Security: Only update fields intentionally exposed by the article
    // edit form. Prevent mass assignment of protected fields such as createdBy and timestamps.
    const allowedFields = [ "title", "content", "category" ];

    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });
    
    if (req.file) {
      updateData.image = req.file.path;
    }

    const updatedArticle = await Article.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedArticle) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Article updated successfully",
      article: updatedArticle,
    });
  } catch (error) {
    // Security: Prevent internal error details from being exposed to clients.
    // Detailed exception information must remain server-side; return only a safe generic message.
    logger.error("Article update failed", { userId: req.user?.id, articleId: req.params?.id, error: error.message });
    res.status(500).json({
      success: false,
      message: "Failed to update article",
    });
  }
};

// DELETE ARTICLE (ADMIN ONLY)
exports.deleteArticle = async (req, res) => {
  try {
    const deletedArticle = await Article.findByIdAndDelete(req.params.id);

    if (!deletedArticle) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Article deleted successfully",
    });
  } catch (error) {
    // Security: Prevent internal error details from being exposed to clients.
    // Detailed exception information must remain server-side; return only a safe generic message.
    logger.error("Article deletion failed", { userId: req.user?.id, articleId: req.params?.id, error: error.message });
    res.status(500).json({
      success: false,
      message: "Failed to delete article",
    });
  }
};