const express = require('express');

const upload = require('../utils/multer');

const {
  imageUpload,
  addPost,
  editPost,
  deletePost,
  getOnePost,
  getAllPost,
} = require('../controllers/post.controllers');

const router = express.Router();

router.post('/upload', upload.single('my_file'), imageUpload);
router.post('/', addPost);
router.put('/:postId', editPost);
router.delete('/:postId', deletePost);
router.get('/:postId', getOnePost);
router.get('/', getAllPost);
