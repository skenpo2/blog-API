const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: [5, 'Post title must be at least 5 characters long'],
      maxlength: [150, 'Post title cannot exceed 150 characters'],
    },

    text: {
      type: String,
      required: true,
      trim: true,
      minlength: [50, 'Post must be at least 50 characters long'],
      maxlength: [5000, 'Post cannot exceed 5000 characters'],
    },

    category: {
      type: String,
      required: true,
      enum: {
        values: ['general', 'sport', 'entertainment', 'business', 'health'],
        message:
          'Category must be one of general, sport, entertainment, business, or health',
      },
    },

    image: {
      url: { type: String },
      publicId: { type: String },
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },

    isFeatured: {
      type: Boolean,
    },

    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Like',
      },
    ],
  },
  { timestamps: true }
);

// Middleware to delete associated comments and likes when a post is deleted
postSchema.pre('findOneAndDelete', async function (next) {
  const post = await this.model.findOne(this.getFilter());
  if (post) {
    // Delete associated comments and likes
    await mongoose.model('Comment').deleteMany({ _id: { $in: post.comments } });
    await mongoose.model('Like').deleteMany({ _id: { $in: post.likes } });

    // Delete image from Cloudinary
    if (post.image?.publicId) {
      await deleteImage(post.image.publicId);
    }
  }
  next();
});

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
