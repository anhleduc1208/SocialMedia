const router = require('express').Router();
const Post = require('../models/Post')
const User = require('../models/User')
//create a post
router.post("/", async(req ,res) => {
    const newPost =  Post(req.body);
    try {
        const savedPost = await newPost.save();
        res.status(200).send(savedPost)
    } catch(err) {
        res.status(500).send(err)
    }
})

//update a post
router.put("/:id", async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.userId === req.body.userId) {
            await post.updateOne({
                $set: req.body
            });
            res.status(200).send("post has been updated")
        } else {
            res.status(403).send("you can only update your posts")
        }
    } catch(err) {
        res.status(500).send(err)
    }
})

//delete a post
router.delete("/:id", async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.userId === req.body.userId) {
            await post.deleteOne();
            res.status(200).send("post has been deleted")
        } else {
            res.status(403).send("you can only delete your posts")
        }
    } catch(err) {
        res.status(500).send(err)
    }
})

//like/dislike a post
router.put("/:id/like", async (req, res) => {
    try{
        const post = await Post.findById(req.params.id);
        if (!post.likes.includes(req.body.userId)) {
            await post.updateOne({
                $push: {likes:req.body.userId}
            });
            res.status(200).send("the post has been liked")
        } else {
            await post.updateOne({
                $pull: {likes: req.body.userId}
            });
            res.status(200).send("the post has been disliked")
        }
    } catch(err) {
        res.status(500).send(err)
    }
})

//get a post
router.get('/:id', async(req, res )=> {
    try{
        const post = await Post.findById(req.params.id);
        res.status(200).send(post)
    } catch(err) {
        res.status(500).send(err)
    }
})

//get timeline post
router.get('/timeline/:userId', async (req,res) => {
    let postArray = [];
    try{
        const currentUser = await User.findById(req.params.userId);
        const userPosts = await Post.find({userId : currentUser._id});
        const friendPosts = await Promise.all(
            currentUser.followings.map( friendId => {
                return Post.find({userId: friendId})
            })
        )
        res.status(200).send(userPosts.concat(...friendPosts))
    } catch(err) {
        res.status(500).send(err)
    }
})


//get user all post
router.get('/profile/:username', async (req,res) => {
    
    try{
        const user = await User.findOne({username: req.params.username})
        const posts = await Post.find({ userId: user._id});
        res.status(200).send(posts)
    } catch(err) {
        res.status(500).send(err)
    }
})

module.exports = router;