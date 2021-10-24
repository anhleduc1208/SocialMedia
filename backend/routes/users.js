const User = require("../models/User");
const bcrypt = require("bcrypt");
const router = require("express").Router();

//update user
router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        return res.status(500).send(err);
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).send("Account has been updated");
    } catch (err) {
      return res.status(500).send(err);
    }
  } else {
    return res.status(403).send("You can update only your account");
  }
});

//delete user
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      res.status(200).send("Account has been deleted");
    } catch (err) {
      return res.status(500).send(err);
    }
  } else {
    return res.status(403).send("You can delete only your account");
  }
});

//get a user
router.get("/", async (req, res) => {
  const userId = req.query.userId;
  const username = req.query.username;
  try {
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ username: username });
    console.log(user);
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).send(user._doc);
  } catch (err) {
    res.status(500).send(err);
  }
});

//get friend
router.get("/friends/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const friends = await Promise.all(
      user.followings.map((friendId) => {
        return User.findById(friendId);
      })
    );

    let friendList = [];
    friends.map((friend) => {
      const { _id, username, profilePicture } = friend;
      friendList.push({ _id, username, profilePicture });
    });
    res.status(200).send(friendList);
  } catch (err) {
    res.status(500).send(err);
  }
});

// folow a user
router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (!user.followers.includes(req.body.userId)) {
        await User.findByIdAndUpdate(req.body.userId, {
          $push: { followings: req.params.id },
        });
        await User.findByIdAndUpdate(req.params.id, {
          $push: { followers: req.body.userId },
        });
        res.status(200).send("user has been followed");
      } else {
        res.status(403).send("You already followed this one");
      }
    } catch (err) {
      res.status(500).send(err);
    }
  } else {
    return res.status(403).send("You cannot follow  urself");
  }
});

//unfollow a user
router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        await User.findByIdAndUpdate(req.body.userId, {
          $pull: { followings: req.params.id },
        });
        await User.findByIdAndUpdate(req.params.id, {
          $pull: { followers: req.body.userId },
        });
        res.status(200).send("user has been unfollowed");
      } else {
        res.status(403).send("You are not following this one");
      }
    } catch (err) {
      res.status(500).send(err);
    }
  } else {
    return res.status(403).send("You cannot unfollow  urself");
  }
});

module.exports = router;
