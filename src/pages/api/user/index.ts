import { NowRequest, NowResponse } from '@vercel/node';
import { MongoClient, Db } from 'mongodb';
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
  const { login } = request.body;
  const db = await connectToDatabase(process.env.MONGODB_URI);
  const collection = db.collection('users');

  const user = await collection.findOne({
    login
  });
  
  if(!user) {
    return response.status(401).json({message: 'Usuário não encontrado!'})
  }
  return response.status(200).json({ user });
}