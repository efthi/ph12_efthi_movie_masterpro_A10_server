/**
 * Importing express and cors 
 **/
const express = require('express');
const cors = require('cors');


/**
 * Init App as express
 */
const app = express();


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