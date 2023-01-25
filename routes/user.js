const router = require('express').Router();
const {
  getUsers, findUserById, updateProfile, updateAvatar,
} = require('../controllers/users');

router.get('/', getUsers);
router.get('/:userId', findUserById);
router.patch('/me', updateProfile);
router.patch('/me/avatar', updateAvatar);

module.exports = router;
