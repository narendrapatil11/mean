const express = require('express');
const Post = require('../models/post');
const multer = require('multer');

const PostRouter = express.Router();

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type");
    if (isValid) {
      error = null;
    }
    cb(error, "images");
  },
  filename: (req, file, cb) => {
    const name = file.originalname
      .toLowerCase()
      .split(" ")
      .join("-");
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + "-" + Date.now() + "." + ext);
  },
});

// Add post to DB
PostRouter.post(
  "",
  multer({ storage: storage }).single("image"),
  (req, res, next) => {
    const url = `${req.protocol}://${req.get('host')}`;
    console.log(`${url}/images/${req.file.filename}`);
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      imagePath: `${url}/images/${req.file.filename}`,
    });
    post.save()
      .then((createdPost) => {
        res.status(201).json({
          message: 'Post added successfully!',
          post: {
            ...createdPost,
            id: createdPost._id,
          },
        });
      });
  });

// Get post list from DB
PostRouter.get("", (req, res, next) => {
  const pageSize = +req.query.pageSize;
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  let fetchedPost;
  if (pageSize && currentPage) {
    postQuery
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize);
  }
  postQuery.find()
    .then(documents => {
      fetchedPost = documents;
      return Post.count();
    })
    .then((count) => {
      res.status(200).json({
        message: "Posts fetched successfully!",
        posts: fetchedPost,
        maxCount: count
      });
    });

});

// get single post list from DB
PostRouter.get("/:id", (req, res, next) => {
  Post.findById({ _id: req.params.id })
    .then((post) => {

      if (post) {
        res.status(200).json({
          message: "Single posts fetched successfully!",
          post,
        });
      }
    }, () => {
      res.status(404).json({
        message: "Post not found!",
        post: null,
      });
    });

});

// Update post list from DB
PostRouter.put("/:id", multer({ storage: storage }).single("image"), (req, res, next) => {
  let imagePath = req.body.imagePath;
  if (req.file) {
    const url = `${req.protocol}://${req.get('host')}`;
    imagePath = `${url}/images/${req.file.filename}`;
  }
  const post = new Post({
    _id: req.params.id,
    title: req.body.title,
    content: req.body.content,
    imagePath,
  });
  console.info('UPDATE POST API:==> ', post);
  Post.updateOne({ _id: req.params.id }, post)
    .then(() => {
      res.status(200).json({
        message: "Posts updated successfully!",
      });
    });

});

// delete post from DB
PostRouter.delete("/:id", (req, res, next) => {
  console.log('deleted post:==> ', req.params.id);
  Post.deleteOne({ _id: req.params.id })
    .then(() => {
      res.status(201).json({
        message: 'Post deleted successfully!',
      });
    });
});

module.exports = PostRouter;
