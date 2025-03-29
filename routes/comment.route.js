const express = require('express');

const router = express.Router();

const {
  addComment,
  editComment,
  deleteComment,
  getSingleComment,
  getAPostComments,
  likeComment,
} = require('../controllers/comment.controller');

const verifyJWT = require('../middlewares/verifyJWT');

router.get('/post/:postId', getAPostComments);
router.post('/', verifyJWT, addComment);
router.put('/', verifyJWT, editComment);
router.delete('/', verifyJWT, deleteComment);
router.get('/:commentId', getSingleComment);
router.post('/like/:commentId', verifyJWT, likeComment);

module.exports = router;
