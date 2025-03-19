const { default: mongoose } = require('mongoose');

const commentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  comment: {
    type: String,
    required: true,
    minlength: [5, 'Comment must be at least 5 characters long'],
    maxlength: [300, 'Comment title cannot exceed 150 characters'],
  },

  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
