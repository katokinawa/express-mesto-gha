const router = require("express").Router();
const { getUsers, createUser } = require("../controllers/user");

router.get("/", getUsers);
router.get("/", findUserById);
router.post("/", createUser);

module.exports = router;
