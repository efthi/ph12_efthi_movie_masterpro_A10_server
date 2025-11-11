/**
 * Importing express and cors 
 **/
const express = require('express');
const cors = require('cors');
require('dotenv').config()
//console.log(process.env.DB_USER);

/**
 * Init App as express
 */
const app = express();

//app using express, json, cors এগুলো ফাংশনাল করা হচ্ছে
app.use(express.json());
app.use(cors());

/**
 * Declare Port!
 */
const port = process.env.PORT || 3000;  


/**
 * Port Listen Declaration
 */

app.listen(port, (res)=>{
    console.log(`SERVER RUNNING @ ${port}`);
    
});

/**
 * Static Page দেখানো
 * এটার জাস্ট আমি নিজে টেস্ট করার জন্য করেছি, যাতে express এর এন্ট্রি পয়েন্ট এ আসলে একটা staic page নিয়ে যাওয়া হয়!
 * Static Page, 'public' ফোল্ডারে index.html নামে আছে, ওই পেইজটা AI দিয়ে জেনারেট করা
 */
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

/**......................Express Config Ends....................... */
/**================================================================ */

//MongoDB এর কাজ শুরু, প্রথমে MongoDB import করবো
const {MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
//mongoDB এর URI সেট করা হলো .env থেকে
const uri = process.env.MONGODB_URI;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

//run function
async function run() {
    try {
        //উপরে MongoDB এর client কে কানেক্ট করলাম
        await client.connect();
        
        const movieMasterDB = client.db("movieMasterDB"); //database বানাইলাম, থাকলে আবার ক্রিয়েট হবে না
        const movieData = movieMasterDB.collection('movieData'); // collection বানাইলাম, ....
        const userData = movieMasterDB.collection('userData'); //২য় collection বানাইলাম
        // Connection test code
       // await client.db("admin").command({ping: 1 });
        // console.log("pinged your deployment. Connected to MongoDB!");
        
        //ডেটা নিয়ে আসা
        app.get('/allmoviedata', async (req,res)=>{
            const packet = movieData.find();  //packet জাস্ট নাম দেওয়া হয়েছে
            const result = await packet.toArray();
            res.send(result);
        });

        //Data POST
        app.post('/addmovie', async (req,res)=>{
            const newMovie = req.body;
            console.log(newMovie);
            const result = await movieData.insertOne(newMovie); // movieMasterDB এর movieData নামের collection এ insert হচ্ছে;
            res.send(result);
        });

        //GET Single Data
        app.get('/moviedetails/:id', async (req, res)=>{
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await movieData.findOne(query);
            res.send(result);
         
        });
        
        //Delete করার API
        app.delete('/moviedetails/:id', async (req, res)=>{
            const id = req.params.id;
            const query = { _id: new ObjectId(id)} ;
            const result = await movieData.deleteOne(query);
            res.send(result);
        });

        
    } 
    finally {
       // await client.close();
    }

}

//run ফাংশনকে কল করলাম
run().catch(console.dir);