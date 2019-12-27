import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';

const app = express();

app.use(express.static(path.join(__dirname, '/build')));
app.use(bodyParser.json());
const uri = 'mongodb://localhost:27017';

const withDB = async (operations, res) => {
  try {
    const client = await MongoClient.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    const db = client.db('my-blog');

    await operations(db);

    client.close();
  } catch (error) {
    res.status(500).json({ message: 'Error connecting to db', error });
  }
};

app.get('/api/articles/:name', async (req, res) => {
  const { name } = req.params;
  withDB(async db => {
    const articleInfo = await db.collection('articles').findOne({ name: name });
    res.status(200).json(articleInfo);
  }, res);
});

app.post('/api/articles/:name/upvote', async (req, res) => {
  const { name } = req.params;
  withDB(async db => {
    const articleInfo = await db.collection('articles').findOne({ name: name });
    await db.collection('articles').updateOne(
      { name: name },
      {
        $set: {
          upvotes: articleInfo.upvotes + 1
        }
      }
    );
    const updatedArticleInfo = await db
      .collection('articles')
      .findOne({ name: name });

    res.status(200).json(updatedArticleInfo);
  }, res);
});

app.post('/api/articles/:name/add-comment', async (req, res) => {
  const { username, text } = req.body;
  const { name } = req.params;
  withDB(async db => {
    const articleInfo = await db.collection('articles').findOne({ name: name });

    await db.collection('articles').updateOne(
      { name: name },
      {
        $set: {
          comments: articleInfo.comments.concat({ username, text })
        }
      }
    );
    const updatedArticleInfo = await db
      .collection('articles')
      .findOne({ name: name });

    res.status(200).json(updatedArticleInfo);
  }, res);
});

app.get('*', () => {
  res.sendFile(path.join(__dirname + '/build/index.html'));
});

const port = process.env.PORT || 8000;

app.listen(port, () => console.log('Listening on port 8000!'));
