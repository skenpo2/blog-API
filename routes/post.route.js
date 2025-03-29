const express = require('express');

// import multer upload helper function
const upload = require('../utils/multer');

const {
  imageUpload,
  addPost,
  editPost,
  deletePost,
  getOnePost,
  getAllPost,
  likePost,
} = require('../controllers/post.controllers');
const verifyJWT = require('../middlewares/verifyJWT');

const router = express.Router();

router.post('/upload', verifyJWT, upload.single('my_file'), imageUpload);
router.post('/', verifyJWT, addPost);
router.put('/:postId', verifyJWT, editPost);
router.delete('/:postId', verifyJWT, deletePost);
router.get('/:postId', getOnePost);
router.post('/like/:postId', verifyJWT, likePost);
router.get('/', getAllPost);

module.exports = router;
