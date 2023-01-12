const router = require("express").Router();
const { getUsers, findUserById, createUser } = require("../controllers/user");

router.get("/", getUsers);
router.get("/:userId", findUserById);
router.post("/", createUser);

module.exports = router;
