const app = require('./app') 
const port = process.env.PORT

app.listen(port, () => {
    console.log('Server is running on port', port)
})


// const express = require('express')
// const app = express()

// require('./db/mongoose')

// const userRouter = require('./routers/user')
// const taskRouter = require('./routers/task')

// const port = process.env.PORT

// app.use(express.json())
// app.use(userRouter)
// app.use(taskRouter)

// app.listen(port, () => {
//     console.log('Server is running on port', port)
// })
