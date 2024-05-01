const express = require('express');
require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require("cors");
const path = require('path');

const {connectDb} = require('./config/dbConnection')

const errorHandler = require('./middleware/errorHandler');
const users = require('./routes/userRoutes');
const cafes = require('./routes/cafeRoutes');
const auth = require('./routes/authRoutes');
const images = require('./routes/imageRoutes');
const books = require('./routes/bookRoutes');
const menu = require('./routes/menuRoutes');
const events = require('./routes/eventRoutes');
const reviews = require('./routes/reviewRoutes');

connectDb();
const app = express();
const port = process.env.PORT || 5001;

app.use(cors({ credentials: true, origin: ['http://localhost:3000'] }));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))


app.use('/api/v1/auth', auth);
app.use('/api/v1/user', users);
app.use('/api/v1/cafe', cafes);
app.use('/api/v1/image', images);
app.use('/api/v1/books', books);
app.use('/api/v1/menu', menu);
app.use('/api/v1/events', events);
app.use('/api/v1/reviews', reviews);

app.all('*', (req,res) => {
    res.status(404).json({message:`No route found with this "${req.originalUrl}" endpoint!`})
})

app.use(errorHandler);


app.listen(port, ()=>{
    console.log(`server listen to port ${port}`)
})