
const express = require("express");

const Messages = require('./dbMessages.js');

const mongoose = require("mongoose");

const Pusher = require("pusher");


const app = express();

const port = process.env.port || 9000;

const pusher = new Pusher({
    appId: '1071239',
    key: 'b6ad7a1c4a5861d5a24b',
    secret: '699831557831acbe34bb',
    cluster: 'ap2',
    encrypted: true
  });

app.use(express.json());

app.use((req,res,next) => {
   res.setHeader('Access-Control-Allow-Origin','*');
   res.setHeader('Access-Control-Allow-Header','*');
   next();

});

const connection_url = 'mongodb+srv://admin:adityavshmdb@cluster0.meuny.mongodb.net/whatsappdb?retryWrites=true&w=majority';

mongoose.connect(connection_url,
    {
        useCreateIndex : true,
        useNewUrlParser : true,
        useUnifiedTopology : true,
     });



const db = mongoose.connection;

db.once('open' ,() => {
    console.log("Db is connected");


    const msgCollection = db.collection('messagecontents');
    const changeStream = msgCollection.watch();

    changeStream.on('change' ,(change) => {
        console.log(change);

        if(change.operationType==='insert'){
            const messageDetails = change.fullDocument;
            pusher.trigger('messages', 'inserted', {
                name : messageDetails.name,
                message : messageDetails.message,
                timestamp : messageDetails.timestamp,
                received : messageDetails.received,
            });
        }
        else{
            console.log("Error triggering pusher:");
        }
    });
});


app.get("/", (req,res) => res.status(200).send("hello world"));

app.get("/messages/sync", (req,res) => {
    Messages.find((err,data) => {
        if(err){
            res.status(500).send(err)
            }
           else{
            res.status(200).send(data)
            }
    });
});

app.post('/messages/new', (req,res) => {

    const dbMessage = req.body;

    Messages.create(dbMessage ,(err,data) => {
      if(err){
        res.status(500).send(err)
        }
       else{
        res.status(201).send(data)
        }
    });


});
app.listen(port, () => console.log(`listening on local port:${port}`));