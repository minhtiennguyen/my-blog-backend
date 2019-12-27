import express from 'express';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';

const articlesInfor = {
  'learn-react': {
    upvotes: 0,
    comments: []
  },
  'learn-node': {
    upvotes: 0,
    comments: []
  },
  'my-thoughts-on-resumes': {
    upvotes: 0,
    comments: []
  }
};

const app = express();

app.use(bodyParser.json());

app.get('/api/articles/:name', async (req, res) => {
  const { name } = req.params;
  const uri = 'mongodb://localhost:27017';

  try {
    const client = await MongoClient.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    const db = client.db('my-blog');
    const articleInfo = await db.collection('articles').findOne({ name: name });

    res.status(200).json(articleInfo);
    client.close();
  } catch (error) {
    res.status(500).json({ message: 'Error connecting to db', error });
    client.close();
  }
});

app.post('/api/articles/:name/upvote', (req, res) => {
  const { name } = req.params;

  articlesInfor[name].upvotes += 1;

  res
    .status(200)
    .send(`${name} now has ${articlesInfor[name].upvotes} upvotes.`);
});

app.post('/api/articles/:name/add-comment', (req, res) => {
  const { username, text } = req.body;
  const { name } = req.params;
  articlesInfor[name].comments.push({ username, text });
  res.status(200).send(articlesInfor[name]);
});

app.listen(8000, () => console.log('Listening on port 8000!'));
