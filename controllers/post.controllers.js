const Post = require('../models/post.model');
const cloudinary = require('cloudinary').v2;

// import joi validation helpers functions
const { validatePost } = require('../utils/validator');

// cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* @desc upload post image to cloudinary
 response: url and public ID so that it can be used while creating the post */
// @route  POST /api/post/upload
// @access Private (only logged user)

const imageUpload = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload an image',
    });
  }

  const b64 = Buffer.from(req.file.buffer).toString('base64') || null;
  const url = 'data:' + req.file.mimetype + ';base64,' + b64;
  const result = await cloudinary.uploader.upload(url, {
    resource_type: 'auto',
  });

  res.json({
    success: true,
    result,
  });
};

// @desc   create a post
// @route  POST /api/post
// @access Private (only a logged user can create a post)
const addPost = async (req, res) => {
  const { error } = validatePost(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all post details',
    });
  }

  const userId = req.user.id;
  const { title, text, category, image } = req.body;

  const existingPost = await Post.findOne({ title: title });

  if (existingPost) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate post',
    });
  }

  const newPost = new Post({ title, text, category, image, userId });

  await newPost.save();
  res.status(201).json({
    success: true,
    data: newPost,
  });
};

// @desc   edit a post
// @route  PUT /api/post/:postId
// @access Private (only a logged user who created a post can edit it)
const editPost = async (req, res) => {
  const postId = req.params.postId;
  const user = req.user;
  const { title, text, category, image, isFeatured } = req.body;

  // Validate input data
  const { error } = validatePost({ title, text, category, image });
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  // Find the post to edit
  const post = await Post.findById(postId);
  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found',
    });
  }

  // Ensure only the post owner or admin can edit
  if (user.role !== 'admin' && post.userId.toString() !== user.id) {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized: You can only edit your own posts',
    });
  }

  // Update the post
  const updatedPost = await Post.findByIdAndUpdate(
    postId,
    {
      title,
      text,
      category,
      image,
      ...(user.role === 'admin' && { isFeatured }), // Only allow `isFeatured` for admins
    },
    { new: true }
  );

  res.status(200).json({
    success: true,
    data: updatedPost,
  });
};

// @desc   delete a post
// @route  DELETE /api/post/:postId
// @access Private (only a logged user who created the post or Admin can delete )
const deletePost = async (req, res) => {
  const postId = req.params.postId;
  const user = req.user;

  // Find the post to edit
  const post = await Post.findById(postId);
  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found',
    });
  }

  // Ensure only the post owner or admin can edit
  if (user.role !== 'admin' && post.userId.toString() !== user.id) {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized: You can only delete your own posts',
    });
  }
  await Post.findOneAndDelete({ _id: postId });

  res.status(200).json({
    success: true,
    message: 'Post deleted successfully ',
  });
};
// @desc   get a post details
// @route  GET /api/post/:postId
// @access Public
const getOnePost = async (req, res) => {
  const postId = req.params.postId;

  const post = await Post.findById(postId);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found',
    });
  }

  res.status(200).json({
    success: true,
    data: post,
  });
};

// @desc   get all post
// @route  GET /api/post
// @access Public
const getAllPost = async (req, res) => {
  const posts = await Post.find({});

  if (!posts) {
    return res.status(404).json({
      success: true,
      message: 'No post found',
    });
  }

  res.status(200).json({
    success: true,
    data: posts,
  });
};

// @desc like a post
// @route  POST /api/post/like/:postId
// @access Private (only a logged user can like a post)
const likePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  const post = await Post.findById(postId);
  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found',
    });
  }
  // check if the post has been like by the user
  const hasLiked = post.likes.includes(userId);

  // if user already liked the post, the unlike it (remove userId ref from post's likes)
  if (hasLiked) {
    await Post.findByIdAndUpdate(postId, { $pull: { likes: userId } });
    return res.status(200).json({
      success: true,
      message: 'Un-liked post',
    });

    // like the post (add userId ref to the post's likes)
  } else {
    await Post.findByIdAndUpdate(postId, { $addToSet: { likes: userId } });
    return res.status(200).json({
      success: true,
      message: 'Liked post',
    });
  }
};

module.exports = {
  imageUpload,
  addPost,
  editPost,
  deletePost,
  getOnePost,
  getAllPost,
  likePost,
};
