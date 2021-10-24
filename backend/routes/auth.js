const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

//register
router.post("/register", (req, res) => {
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: hash,
      });
      return user.save();
    })
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

//Login
router.post("/login", (req, res, next) => {
  const email = req.body.email;
  User.findOne({ email: email })
    .then((u) => {
      !u && res.status(404).json("user not found");
      u &&
        bcrypt
          .compare(req.body.password, u.password)
          .then((isRightPassword) => {
            !isRightPassword && res.status(400).json("wrong password");
            isRightPassword && res.status(200).json(u);
          });
    })

    .catch((err) => {
      res.status(500).json(err);
    });
});

module.exports = router;
