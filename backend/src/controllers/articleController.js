// const Article = require("../models/Article");

// // CREATE (ADMIN)
// exports.createArticle = async (req, res) => {
//   const article = new Article({
//     ...req.body,
//     createdBy: req.user.id,
//   });

//   await article.save();
//   res.status(201).json(article);
// };

// // GET PUBLISHED
// exports.getArticles = async (req, res) => {
//   const articles = await Article.find({ isPublished: true })
//     .sort({ createdAt: -1 });

//   res.json(articles);
// };

// // UPDATE (ADMIN)
// exports.updateArticle = async (req, res) => {
//   const updated = await Article.findByIdAndUpdate(
//     req.params.id,
//     req.body,
//     { new: true }
//   );

//   res.json(updated);
// };

// // DELETE (ADMIN)
// exports.deleteArticle = async (req, res) => {
//   await Article.findByIdAndDelete(req.params.id);
//   res.json({ msg: "Deleted" });
// };



const Article = require("../models/Article");

// 🟢 CREATE ARTICLE (ADMIN ONLY)
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
    res.status(500).json({
      success: false,
      message: "Server error while creating article",
      error: error.message,
    });
  }
};

// 🟢 GET ALL PUBLISHED ARTICLES (PUBLIC)
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
    res.status(500).json({
      success: false,
      message: "Server error while fetching articles",
      error: error.message,
    });
  }
};

// 🟢 GET SINGLE ARTICLE BY ID (PUBLIC)
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
    res.status(500).json({
      success: false,
      message: "Server error while fetching article",
      error: error.message,
    });
  }
};

// 🟢 UPDATE ARTICLE (ADMIN ONLY)
exports.updateArticle = async (req, res) => {
  try {
    const updateData = { ...req.body };
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
    res.status(500).json({
      success: false,
      message: "Server error while updating article",
      error: error.message,
    });
  }
};

// 🟢 DELETE ARTICLE (ADMIN ONLY)
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
    res.status(500).json({
      success: false,
      message: "Server error while deleting article",
      error: error.message,
    });
  }
};