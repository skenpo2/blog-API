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

router.post('/:postId', verifyJWT, addComment);
router.put('/:postId', verifyJWT, editComment);
router.delete('/:postId', verifyJWT, deleteComment);
router.get('/:commentId', getSingleComment);
router.get('/', getAPostComments);
router.post('/like/:commentId', verifyJWT, likeComment);

module.exports = router;
