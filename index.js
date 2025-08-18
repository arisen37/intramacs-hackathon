const express = require('express')
const { userRouter } = require('./routers/user')
const cors = require('cors')


const { auth } = require('./auth')

const app = express();

app.use(express.json())
app.use('/api/v1/user', userRouter)
app.use(cors())

app.listen(3000)



