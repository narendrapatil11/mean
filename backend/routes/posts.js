const express = require('express');
const Post = require('../models/post');

const PostRouter = express.Router();

// Add post to DB
PostRouter.post("", (req, res, next) => {
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
  });
  console.log(post);
  post.save()
    .then(({ _id }) => {
      res.status(201).json({
        postId: _id,
        message: 'Post added successfully!',
      });
    });
});

// Get post list from DB
PostRouter.get("", (req, res, next) => {
  Post.find()
    .then((documents) => {
      res.status(200).json({
        message: "Posts fetched successfully!",
        posts: documents,
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
    }, () =>{
      res.status(404).json({
        message: "Post not found!",
        post: null
      });
    });

});

// Update post list from DB
PostRouter.put("/:id", (req, res, next) => {
  const post = new Post({
    _id: req.params.id,
    title: req.body.title,
    content: req.body.content,
  });
  Post.updateOne({ _id: req.params.id }, post)
    .then(() => {
      res.status(200).json({
        message: "Posts updated successfully!",
      });
    });

});

// delete post from DB
PostRouter.delete("/:id", (req, res, next) => {
  console.log(req.params.id);
  Post.deleteOne({ _id: req.params.id })
    .then(() => {
      res.status(201).json({
        message: 'Post deleted successfully!',
      });
    });
});

module.exports = PostRouter;
