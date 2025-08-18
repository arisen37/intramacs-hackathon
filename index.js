const express = require('expresss')
const { userRouter } = require('./routers/user')


const { auth } = require('./auth.js')

const app = express();

app.use(express.json())
app.use('/api/v1/user' , userRouter)






