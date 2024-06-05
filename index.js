const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require("dotenv");
const { errorHandler, notFound } = require('./middleware/errorMiddleware')
const mongoose = require('mongoose');
const { userRoute } = require('./route/userRoute')
const { productRoute } = require('./route/productRoute')
const { cartRoute } = require('./route/cartRoute')
const { orderRoute } = require('./route/orderRoute')
const PORT = process.env.PORT || 5001;
dotenv.config();    


app.use(express.json());

app.use(cors());

//mongodb connection
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("connected to database"))
  .catch((err) => console.log(err));

// Define a route
app.get('/', (req, res) => {
    res.send('Server is running');
});

//routes
app.use('/auth', userRoute)
app.use('/product', productRoute)
app.use('/cart', cartRoute)
app.use('/order', orderRoute)

//error
app.use(notFound)
app.use(errorHandler)

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

