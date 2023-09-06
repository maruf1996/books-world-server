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
      console.log(result);
      res.send(result);
    });

    app.delete('/book/:id', async (req, res) => {
      const id = req.params.id;

      const result = await booksCollection.deleteOne({ _id: ObjectId(id) });
      console.log(result);
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

      console.log(result);

      if (result.modifiedCount !== 1) {
        console.error('Books not found or review not added');
        res.json({ error: 'Books not found or review not added' });
        return;
      }

      console.log('Review added successfully');
      res.json({ message: 'Review added successfully' });
    });

    app.get('/comment/:id', async (req, res) => {
      const bookId = req.params.id;

      const result = await booksCollection.findOne(
        { _id: ObjectId(bookId) },
        { projection: { _id: 0, comments: 1 } }
      );

      if (result) {
        res.json(result);
      } else {
        res.status(404).json({ error: 'Books not found' });
      }
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
