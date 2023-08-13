const { validationResult } = require('express-validator');
const Post = require('../models/post');
const fs = require('fs');
const path = require('path');

exports.getPosts = (req, res, next) => {
    // implement pagination
    const currentPage = req.query.page || 1;
    // posts per page
    const perPage = 2;
    let totalItems;
    Post.find()
        .countDocuments()
        .then((count) => {
            totalItems = count;
            return Post.find()
                .skip((currentPage - 1) * perPage)
                .limit(perPage)
                .then((posts) => {
                    res.status(200).json({
                        message: 'Fetched posts successfully',
                        posts: posts,
                        totalItems: totalItems,
                    });
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

exports.updatePost = (req, res, next) => {
    const postId = req.params.postId;
    const err = validationResult(req);
    if (!err.isEmpty()) {
        // server side validation for length of content and title
        const err = new Error('Server Response: Validation failed');
        err.statusCode = 422;
        // you can see this error thrown in your network tab. The red response has a payload you can inspect.
        // throw err will automatically go to the next error handling middleware in express
        throw err;
    }
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;

    if (req.file) {
        imageUrl = req.file.path;
    }

    if (!imageUrl) {
        const err = new Error('No file picked');
        err.statusCode = 422;
        throw err;
    }
    // now we know the data is valid. Now we update.
    Post.findById(postId)
        .then((post) => {
            if (!post) {
                const error = new Error('Could not find post');
                error.statusCode = 404;
                // throw to catch it
                throw err;
            }
            // checking for imageURL change and then deleting the old imageUrl
            if (imageUrl !== post.imageUrl) {
                clearImage(post.imageUrl);
            }
            // we found a post, now we can update
            post.title = title;
            post.imageUrl = imageUrl;
            post.content = content;
            return post.save();
        })
        .then((result) => {
            // return data to client in a response.
            res.status(200).json({ message: 'Post updated', post: result });
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            // to go to the next error handling software if you're at the end of the promise chain.
            next(err);
        });
};

exports.deletePost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
        .then((post) => {
            if (!post) {
                const error = new Error('Could not find post');
                error.statusCode = 404;
                // throw to catch it
                throw err;
            }
            // Check logged in user
            clearImage(post.imageUrl);
            return Post.findByIdAndRemove(postId);
        })
        .then((result) => {
            console.log(result);
            res.status(200).json({ message: 'Deleted Post ' + postId });
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            // to go to the next error handling software if you're at the end of the promise chain.
            next(err);
        });
};

const clearImage = (filePath) => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, (err) => console.log(err));
};
