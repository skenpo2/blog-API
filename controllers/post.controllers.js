const Post = require('../models/post.model');
const User = require('../models/user.model');
const cloudinary = require('cloudinary').v2;
const { validatePost } = require('../utils/validator');

// cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// upload image to cloudinary
// response: url and public ID so that it can be sent while creating the post

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

  const hasLiked = post.likes.includes(userId);

  if (hasLiked) {
    await Post.findByIdAndUpdate(postId, { $pull: { likes: userId } });
    return res.status(200).json({
      success: true,
      message: 'Unliked post',
    });
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
