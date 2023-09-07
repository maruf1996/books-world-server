require('dotenv').config();
const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

const cors = require('cors');

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bmyfd.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    const db = client.db('books-world');
    const booksCollection = db.collection('books');
    const wishlistCollection = db.collection('wishlist');
    const readingListCollection = db.collection('readingList');

    // book collection
    app.get('/books', async (req, res) => {
      const cursor = booksCollection.find({});
      const books = await cursor.toArray();
      res.send({ status: true, data: books });
    });

    app.post('/book', async (req, res) => {
      const book = req.body;
      console.log(book)
      const result = await booksCollection.insertOne(book);
      res.send(result);
    });

    app.get('/book/:id', async (req, res) => {
      const id = req.params.id;
      const result = await booksCollection.findOne({ _id: ObjectId(id) });
      res.send(result);
    });
    
    app.put('/book/:id', async (req, res) => {
      const id = req.params.id;
      const data = req.body;
    
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = { $set: data };
      const result = await booksCollection.updateOne(filter, updatedDoc, options);
      res.send(result)
    });
    

    app.delete('/book/:id', async (req, res) => {
      const id = req.params.id;
      const result = await booksCollection.deleteOne({ _id: ObjectId(id) });
      res.send(result);
    });

    app.post('/review/:id', async (req, res) => {
      const bookId = req.params.id;
      const review = req.body.review;

      console.log(bookId);
      console.log(review);

      const result = await booksCollection.updateOne(
        { _id: ObjectId(bookId) },
        { $push: { review: review } }
      );
      res.json(result);
    });

    app.get('/review/:id', async (req, res) => {
      const bookId = req.params.id;

      const result = await booksCollection.findOne(
        { _id: ObjectId(bookId) },
        { projection: { _id: 0, review: 1 } }
      );

      if (result) {
        res.json(result);
      } else {
        res.status(404).json({ error: 'Books not found' });
      }
    });

    app.post('/wishlist', async (req, res) => {
      const wishlist = req.body;
      console.log(wishlist)
      const result = await wishlistCollection.insertOne(wishlist);
      res.send(result);
    });

    app.get('/wishlist', async (req, res) => {
      const cursor = wishlistCollection.find({});
      const wishlist = await cursor.toArray();
      res.send({ status: true, data: wishlist });
    });

    app.post('/readinglist', async (req, res) => {
      const readinglist = req.body;
      console.log(readinglist)
      const result = await readingListCollection.insertOne(readinglist);
      res.send(result);
    });

    app.get('/readinglist', async (req, res) => {
      const cursor = readingListCollection.find({});
      const readinglist = await cursor.toArray();
      res.send({ status: true, data: readinglist });
    });


  } finally {
  }
};

run().catch((err) => console.log(err));

app.get('/', (req, res) => {
  res.send('Welcome to Books World');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
