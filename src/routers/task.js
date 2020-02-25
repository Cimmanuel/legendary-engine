const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const updates = require('../middleware/updates')

const router = new express.Router()

// Create task - POST /tasks
router.post('/tasks', [auth, updates], async (req, res) => {
    // const task = new Task(req.body) // legacy
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try {
        await task.save()
        res.status(201).send(task)
    } catch(error) {
        res.status(400).send(error)
    }
})

// Read tasks - GET /tasks
// GET /tasks?completed=:bool (filtering)
// GET /tasks?limit=:number&skip=:number (pagination)
// GET /tasks?sortBy=:fieldName:1||-1 [asc=1, desc=-1] (sorting)
router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}
    if(req.query.completed) {
        match.completed = req.query.completed === 'true'
    }
    if(req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1    
    }
    try {
        await req.user.populate({ path: 'tasks', match, options: {
            limit: parseInt(req.query.limit), skip: parseInt(req.query.skip), sort 
        } }).execPopulate()
        res.send(req.user.tasks)
    } catch(error) {
        res.status(500).send()
    }
})

// Read a task - GET /tasks/:id
router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        // const task = await Task.findById(_id)
        const task = await Task.findOne({ _id, owner: req.user._id })
        if(!task) {
            return res.status(404).send({
                error: 'Task not found!'
            })
        }
        res.send(task)
    } catch(error) {
        res.status(500).send()
    }
})

// Update a task - PATCH /tasks/:id
router.patch('/tasks/:id', [auth, updates], async (req, res) => {
    const _id = req.params.id
    try {
        const task = await Task.findOne({ _id, owner: req.user._id })
        if(!task) {
            return res.status(404).send({
                error: 'Task not found!'
            })
        }
        const setKeys = req.setKeys
        setKeys.forEach((setKey) => task[setKey] = req.body[setKey])
        await task.save()
        res.send(task)
    } catch(error) {
        console.log(error)
        res.status(400).send(error)
    }
})

// Delete a task - DELETE /users/:id
router.delete('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        // const task = await Task.findByIdAndDelete(_id) // legacy
        const task = await Task.findOneAndDelete({ _id, owner: req.user._id })
        if(!task) {
            return res.status(404).send({
                error: 'Task not found!'
            })
        }
        res.send(task)
    } catch(error) {
        res.status(500).send()
    }
})

module.exports = router


// Read tasks - GET /tasks (deprecated)
// This route is without filtering features
// router.get('/tasks', auth, async (req, res) => {
//     try {
//         // const tasks = await Task.find({}) // legacy
//         // Method one
//         // const tasks = await Task.find({owner: req.user._id})
//         // res.send(tasks)
        
//         // Method two
//         await req.user.populate('tasks').execPopulate()
//         res.send(req.user.tasks)
//     } catch(error) {
//         res.status(500).send()
//     }
// })

// Update a task - PATCH /tasks/:id
// router.patch('/tasks/:id', auth, async (req, res) => {
//     const _id = req.params.id
//     const updates = Object.keys(req.body)
//     const allowedUpdates = ['description', 'completed']
//     const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

//     if(!isValidOperation) return res.status(400).send({
//         error: 'Invalid updates!'
//     })

//     try {
//         const task = await Task.findById(_id)
//         updates.forEach((update) => task[update] = req.body[update])
//         await task.save()
//         // Line below was commented out to restructure code for password hashing
//         // const task = await Task.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true })
//         if(!task) {
//             return res.status(404).send({
//                 error: 'Task not found!'
//             })
//         }
//         res.send(task)
//     } catch(error) {
//         res.status(400).send(error)
//     }
// })
