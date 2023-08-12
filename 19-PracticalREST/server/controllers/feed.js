const { validationResult } = require('express-validator');
const Post = require('../models/post');

exports.getPosts = (req, res, next) => {
    Post.find()
        .then((posts) => {
            res.status(200).json({
                message: 'Fetched posts successfully',
                posts: posts,
            });
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.createPost = (req, res, next) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
        // server side validation for length of content and title
        const err = new Error('Server Response: Validation failed');
        err.statusCode = 422;
        // you can see this error thrown in your network tab. The red response has a payload you can inspect.
        // throw err will automatically go to the next error handling middleware in express
        throw err;
    }
    /// new multer code WARNING

    if (!req.file) {
        const err = new Error('No image provided');
        err.statusCode = 422;
        throw err;
    }

    const imageUrl = req.file.path;
    console.log(imageUrl);

    //// MULTER WARNING
    const title = req.body.title;
    const content = req.body.content;

    const post = new Post({
        // in the model we asked mongoose to create these for us
        // _id: new Date().toISOString(),
        title: title,
        content: content,
        imageUrl: imageUrl,
        creator: { name: 'Mike' },
        // createdAt: new Date(),
    });
    // .save() returns a promise so you get access to the result in the next then() block
    post.save()
        .then((result) => {
            console.log(result);
            res.status(201).json({
                message: 'Post created successfully!',
                post: result,
            });
        })
        // this is tied to the "throw err" above
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            // to go to the next error handling software if you're at the end of the promise chain.
            next(err);
        });
};

exports.getPost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
        .then((post) => {
            if (!post) {
                const error = new Error('Could not find post');
                error.statusCode = 404;
                // throw to catch it
                throw err;
            }
            res.status(200).json({
                message: 'Post fetched successfully.',
                post: post,
            });
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            // to go to the next error handling software if you're at the end of the promise chain.
            next(err);
        });
};
