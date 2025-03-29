const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Post = require('../models/post.model');
const Comment = require('../models/comment.model');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Verify password
userSchema.methods.verifyPassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Middleware to delete associated posts and comments before deleting user
userSchema.pre('findOneAndDelete', async function (next) {
  try {
    const user = await this.model.findOne(this.getFilter());

    if (user) {
      // Delete all posts belonging to the user
      await Post.deleteMany({ _id: { $in: user.posts } });

      // Delete all comments made by the user
      await Comment.deleteMany({ _id: { $in: user.comments } });

      // Delete all comments related to the user's posts
      await Comment.deleteMany({ post: { $in: user.posts } });
    }

    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
