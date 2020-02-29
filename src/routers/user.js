const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const auth = require('../middleware/auth')
const updates = require('../middleware/updates')
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account')

const router = new express.Router()
const avatar = multer({
    // dest: 'avatars',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('File must be a JPG, JPEG, or PNG image!'))
        }
        cb(undefined, true)
    }
})

// Create user - POST /users
router.post('/users', updates, async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch(error) {
        res.status(400).send(error)
    }
})

// Login a user - POST /users/login
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        // res.send({ user: user.getPublicProfile(), token }) // the manual way to hide data
        res.send({user, token})
    } catch(error) {
        res.status(400).send({
            error: "Invalid credentials!"
        })
    }
})

// Logout a user - POST /users/logout
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send({
            message: "Logout successful!"
        })
    } catch(error) {
        res.status(500).send()
    }
})

// Logout a user (all sessions) - POST /users/logoutAll
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send({
            message: "Logout successful!"
        })
    } catch(error) {
        res.status(500).send()
    }
})

// Read user profile - GET /users
router.get('/users/profile', auth, async (req, res) => {
    res.send(req.user)
})

// Update a user - PATCH /users/profile
router.patch('/users/profile', [auth, updates], async (req, res) => {
    try {
        const user = req.user
        const setKeys = req.setKeys
        setKeys.forEach((setKey) => user[setKey] = req.body[setKey])
        await user.save()
        res.send(user)
    } catch(error) {
        res.status(400).send(error)
    }
})

// Upload avatar - POST /users/profile/avatar
router.post('/users/profile/avatar', [auth, avatar.single('avatar')], async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send({ message: 'Upload sucessful!' })
}, (error, req, res, next) => res.status(400).send({ error: error.message }))


// Get avatar - GET /users/:id/avatar
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar) {
            throw new Error('No user or associated avatar!')
        }
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch(error) {
        res.status(404).send({ error: 'Avatar not found' })
    }
})

// Delete avatar - DELETE /users/profile/avatar
router.delete('/users/profile/avatar', auth, async (req, res) => {
    try {
        req.user.avatar = undefined
        await req.user.save()
        res.send({ message: 'Avatar deleted' })
    } catch(error) {
        res.status(500).send()
    }
})

// Delete a user - DELETE /users/profile
router.delete('/users/profile', auth, async (req, res) => {
    try {
        await req.user.remove()
        sendCancelationEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch(error) {
        res.status(500).send()
    }
})

module.exports = router


// Read users - GET /users (deprecated)
// Exposes data for other users
// router.get('/users', auth, async (req, res) => {
//     try {
//         const users = await User.find({})
//         res.send(users)
//     } catch(error) {
//         res.status(500).send()
//     }
// })

// Read a user - GET /users/:id (deprecated)
// Should only be able to fetch your own user profile and that's being handled by GET /users/profile
// router.get('/users/:id', async (req, res) => {
//     const _id = req.params.id
//     try {
//         const user = await User.findById(_id)
//         if(!user) {
//             return res.status(404).send({
//                 error: 'User not found!'
//             })
//         }
//         res.send(user)
//     } catch(error) {
//         res.status(500).send()
//     }
// })

// Update a user - PATCH /users/:id (deprecated)
// A user shouldn't be able to update another user either maliciously or accidentally
// router.patch('/users/:id', async (req, res) => {
//     const _id = req.params.id
//     const updates = Object.keys(req.body)
//     const allowedUpdates = ['name', 'email', 'password', 'age']
//     const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

//     if(!isValidOperation) return res.status(400).send({
//         error: 'Invalid updates!'
//     })

//     try {
//         const user = await User.findById(_id)
//         updates.forEach((update) => user[update] = req.body[update])
//         await user.save()
//         // Line below was commented out to restructure code for password hashing
//         // const user = await User.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true })
//         if(!user) {
//             return res.status(404).send({
//                 error: 'User not found!'
//             })
//         }
//         res.send(user)
//     } catch(error) {
//         res.status(400).send(error)
//     }
// })

// Delete a user - DELETE /users/:id (deprecated)
// A user shouldn't be able to delete another user either maliciously or accidentally
// router.delete('/users/:id', auth, async (req, res) => {
//     const _id = req.params.id
//     try {
//         const user = await User.findByIdAndDelete(_id)
//         if(!user) {
//             return res.status(404).send({
//                 error: 'User not found!'
//             })
//         }
//         res.send(user)
//     } catch(error) {
//         res.status(500).send()
//     }
// })
