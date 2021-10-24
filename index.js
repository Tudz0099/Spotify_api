const express = require('express');
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require('dotenv/config');

const app = express();
const {DB_PORT, DB_CONNECTION} = process.env; 

const corsOptions ={
    //origin:'https://spotify-fa.web.app', 
    credentials:true,
    optionSuccessStatus:200
}

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const authRouter = require('./router/auth');
const audioRouter = require('./router/audio');

app.use('/public', express.static('public'))
app.use('/auth', authRouter)
app.use('/audio', audioRouter)

app.get('/', (req, res) => {
    res.send(`hello spotify - clone `)
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Max-Age", "1800");
    res.setHeader("Access-Control-Allow-Headers", "content-type");
    res.setHeader( "Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, PATCH, OPTIONS" ); 
}) 
   


//connect mongodb
mongoose.connect(
        DB_CONNECTION 
    ,{
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(()=>{
        console.log(`successfully connected`);
        }).catch((e)=>{
        console.log(e);
        });
 
//sever listening
const PORT = process.env.PORT || DB_PORT
app.listen(PORT, (req,res) => {
    console.log(`Listening on port ${DB_PORT}...`)
}) 