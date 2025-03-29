const Post = require('../models/post.model');
const Comment = require('../models/comment.model');

// @desc  add comment to a post
// @route  POST /api/comment
// @access Private (only logged user)
const addComment = async (req, res) => {
  const userId = req.user.id;

  const { comment, postId } = req.body;

  const post = await Post.findById(postId);
  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'post not found',
    });
  }

  const newComment = new Comment({ userId, postId, comment });
  await newComment.save();

  // add comment ref to the post's comments
  post.comments.push(newComment._id);
  await post.save();

  res.status(201).json({
    success: true,
    data: newComment,
  });
};

// @desc  edit to a post
// @route  PUT /api/comment
// @access Private (only logged user who created the comment can edit it)

const editComment = async (req, res) => {
  const userId = req.user.id;

  const { commentId, comment, postId } = req.body;

  const post = await Post.findById(postId);
  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post cannot be found',
    });
  }

  const isComment = await Comment.findById(commentId);
  if (!isComment) {
    return res.status(404).json({
      success: false,
      message: 'Comment does not exist',
    });
  }

  if (isComment.postId.toString() !== postId) {
    return res.status(400).json({
      success: false,
      message: 'Comment does not belong to this post',
    });
  }

  if (isComment.userId.toString() !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Only User who created a comment can edit it',
    });
  }

  isComment.comment = comment;
  await isComment.save();

  res.status(200).json({
    success: true,
    data: isComment,
  });
};

// @desc  delete a comment on a post
// @route  DELETE /api/comment
// @access Private (only logged user who created a comment or an admin can delete a comment)

const deleteComment = async (req, res) => {
  const userId = req.user.id;
  const role = req.user.role;
  const { commentId, postId } = req.body;

  const post = await Post.findById(postId);
  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found',
    });
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    return res.status(404).json({
      success: false,
      message: 'Comment does not exist',
    });
  }

  if (comment.postId.toString() !== postId) {
    return res.status(400).json({
      success: false,
      message: 'Comment does not belong to this post',
    });
  }

  // Check if the user is the owner or an admin
  if (role !== 'admin' && comment.userId.toString() !== userId) {
    return res.status(403).json({
      success: false,
      message:
        'Only an admin or the user who created the comment can delete it',
    });
  }

  // Remove comment reference from post
  post.comments.pull(commentId);
  await post.save();

  // Delete the comment
  await Comment.deleteOne({ _id: commentId });

  return res.status(200).json({
    success: true,
    message: 'Comment deleted',
  });
};

// @desc  get a comment on a post
// @route  GET /api/comment/:commentId
// @access Public

const getSingleComment = async (req, res) => {
  const { commentId } = req.params;

  if (!commentId) {
    return res.status(400).json({
      success: false,
      message: 'Comment ID is required',
    });
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    return res.status(404).json({
      success: false,
      message: 'Comment not found',
    });
  }

  res.status(200).json({
    success: true,
    data: comment,
  });
};

// @desc  get all comments on a post
// @route GET /api/comment/post/:postId
// @access Public

const getAPostComments = async (req, res) => {
  const { postId } = req.params;
  console.log(postId);
  const comments = await Comment.find({ postId });

  if (comments.length === 0) {
    return res
      .status(404)
      .json({ success: false, message: 'No comments for this post' });
  }

  res.status(200).json({
    success: true,
    data: comments,
  });
};

// @desc like or unlike a comment
// @route  POST /api/comment/like/:commentId
// @access Private (only logged user can like a post)

const likeComment = async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.id;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    return res.status(404).json({
      success: false,
      message: 'Comment not found',
    });
  }
  // check if the user already like the comment
  const hasLiked = comment.likes.includes(userId);

  // if user already liked the comment, the unlike it (remove userId ref from comment's likes)
  if (hasLiked) {
    await Comment.findByIdAndUpdate(commentId, { $pull: { likes: userId } });
    return res.status(200).json({
      success: true,
      message: 'Unliked comment',
    });
    // like the comment (add userId ref to the comment's likes)
  } else {
    await Comment.findByIdAndUpdate(commentId, {
      $addToSet: { likes: userId },
    });
    return res.status(200).json({
      success: true,
      message: 'Liked comment',
    });
  }
};

module.exports = {
  addComment,
  editComment,
  deleteComment,
  getSingleComment,
  getAPostComments,
  likeComment,
};
