import { NowRequest, NowResponse } from '@vercel/node';
import { MongoClient, Db, ObjectID } from 'mongodb';
import url from 'url';

let cachedDb: Db = null;

async function connectToDatabase(uri: string) {
  if(cachedDb){
    return cachedDb;
  }

  const client = await MongoClient.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const dbName = url.parse(uri).pathname.substr(1);

  const db = client.db(dbName);
  cachedDb = db;
  return db;
}

export default  async (request: NowRequest, response: NowResponse) => {
  const { login, level, currentExperience, challengesCompleted } = request.body;

  const db = await connectToDatabase(process.env.MONGODB_URI);
  const collection = db.collection('users');

  await collection.updateOne(
    { login: login },
    { $set: { 
        level, 
        currentExperience, 
        challengesCompleted,
        updatedAt: new Date(),
      } },
    { upsert: false }
  );
    // { _id: new ObjectID(req.params.id) },
    // { $set: { title: req.body.bookName, author: req.body.authorName } },
    // { upsert: true }

  return response.status(201).json({message: 'Informações atualizadas com sucesso!'});
}