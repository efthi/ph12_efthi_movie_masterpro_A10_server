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

        //Update করার API (একটু বোঝার আছে এটা)
        app.patch('/editmoviedetails/:id', async (req, res) => {
            const id= req.params.id;
            const updatedMovieData = req.body;
                    
            const query = { _id: new ObjectId(id) };
            const update = {
                $set : {
                    ...updatedMovieData
                }
            }
            const options = {};
            const result = await movieData.updateOne(query, update, options);
            console.log('serv: ', query, update);
            console.log('res:', result);
            res.send(result);
        });
       
         //ডেটা নিয়ে আসা mycollection
        app.get('/mycollectiondata', async (req,res)=>{
            const email = req.query.email;
            const query = {addedBy : email.toLowerCase()};
            const cursor = movieData.find(query);  //cursor জাস্ট নাম দেওয়া হয়েছে
            const result = await cursor.toArray();
            res.send(result);
        });

        /* ===================== WISHLIST TOGGLE ===================== */
    app.post('/wishlist/toggle', async (req, res) => {
      try {
        const { email, movieId } = req.body;

        if (!email || !movieId) {
          return res.status(400).send({
            success: false,
            message: 'email আর movieId লাগবে',
          });
        }

        const userEmail = email.toLowerCase();
        const userQuery = { email: userEmail };

        // user আছে কিনা দেখি
        let user = await userData.findOne(userQuery);

        // যদি না থাকে, নতুন ইউজার বানিয়ে সরাসরি wishlist এ add করব
        if (!user) {
          const newUser = {
            email: userEmail,
            wishlist: [movieId],
          };
          await userData.insertOne(newUser);

          return res.send({
            success: true,
            status: 'added',
            wishlist: newUser.wishlist,
          });
        }

        const currentWishlist = user.wishlist || [];
        const alreadyInList = currentWishlist.includes(movieId);
        let status = 'added';

        if (alreadyInList) {
          // থাকলে remove করব
          await userData.updateOne(
            userQuery,
            { $pull: { wishlist: movieId } }
          );
          status = 'removed';
        } else {
          // না থাকলে add করব
          await userData.updateOne(
            userQuery,
            { $addToSet: { wishlist: movieId } }
          );
        }

        // আপডেট হওয়া user আবার নিয়ে আসি 
        const updatedUser = await userData.findOne(userQuery);

        res.send({
          success: true,
          status, // 'added' বা 'removed'
          wishlist: updatedUser.wishlist || [],
        });
      } catch (error) {
        console.error('Wishlist toggle error:', error);
        res.status(500).send({
          success: false,
          message: 'Server error (wishlist toggle)',
        });
      }
    });

    app.post('/registerUser', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).send({
        success: false,
        message: 'email লাগবে',
      });
    }

    const userEmail = email.toLowerCase();

    // আগে আছে কিনা দেখি
    const existing = await userData.findOne({ email: userEmail });

    if (!existing) {
      // নতুন ইউজার ডকুমেন্ট
      const newUser = {
        email: userEmail,
        name: name || '',
        wishlist: [],        // future use
      };
      await userData.insertOne(newUser);
    } else {
      // আগেই থাকলে শুধু নাম আপডেট করতেও পারো
      await userData.updateOne(
        { email: userEmail },
        { $set: { name: name || existing.name || '' } }
      );
    }

    res.send({ success: true });
  } catch (error) {
    console.error('registerUser error:', error);
    res.status(500).send({
      success: false,
      message: 'Server error while registering user',
    });
  }
});


    /* ========= মোট Movie আর মোট User count দেখানোর জন্য API ========= */
    app.get('/stats', async (req, res) => {
    try {
        // সব movie ডকুমেন্ট গুনব
        const totalMovies = await movieData.countDocuments({});

        // সব user ডকুমেন্ট গুনব (userData collection এ)
        const totalUsers = await userData.countDocuments({});

        res.send({
        success: true,
        totalMovies,
        totalUsers,
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).send({
        success: false,
        message: 'Server error while getting stats',
        });
    }
    });

    /* ===================== WISHLIST LIST (GET) ===================== */
    app.get('/wishlist', async (req, res) => {
      try {
        const email = req.query.email;

        if (!email) {
          return res.status(400).send({
            success: false,
            message: 'email query parameter লাগবে',
          });
        }

        const userEmail = email.toLowerCase();
        const user = await userData.findOne({ email: userEmail });

        // যদি user না থাকে বা wishlist ফাঁকা থাকে
        if (!user || !user.wishlist || user.wishlist.length === 0) {
          return res.send({
            success: true,
            movies: [],
          });
        }

        // wishlist এ string আকারে যেসব movieId আছে, সেগুলো ObjectId এ convert
        const ids = user.wishlist.map((id) => new ObjectId(id));

        const cursor = movieData.find({ _id: { $in: ids } });
        const movies = await cursor.toArray();

        res.send({
          success: true,
          movies,
        });
      } catch (error) {
        console.error('Wishlist get error:', error);
        res.status(500).send({
          success: false,
          message: 'Server error (wishlist get)',
        });
      }
    });

    //
    app.post('/registerUser', async (req, res) => {
        try {
            const { email, name } = req.body;

            if (!email) {
            return res.status(400).send({
                success: false,
                message: 'email লাগবে',
            });
            }

            const userEmail = email.toLowerCase();

            // আগে আছে কিনা দেখি
            const existing = await userData.findOne({ email: userEmail });

            if (!existing) {
            // নতুন ইউজার ডকুমেন্ট
            const newUser = {
                email: userEmail,
                name: name || '',
                wishlist: [],        // future use
            };
            await userData.insertOne(newUser);
            } else {
            // আগেই থাকলে শুধু নাম আপডেট করতেও পারো
            await userData.updateOne(
                { email: userEmail },
                { $set: { name: name || existing.name || '' } }
            );
            }

            res.send({ success: true });
        } catch (error) {
            console.error('registerUser error:', error);
            res.status(500).send({
            success: false,
            message: 'Server error while registering user',
            });
        }
    });


   

    } 
    finally {
       // await client.close();
    }

}

//run ফাংশনকে কল করলাম
run().catch(console.dir);