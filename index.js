const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/',async(req,res)=>{
  res.send('My Historical Artifacts Tracker')
})



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.3oeok.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    
    const allArtifactsCollection = client.db('historicalArtifactsTracker').collection('allArtifacts');
    const likeCollection = client.db('historicalArtifactsTracker').collection('likeByUser');
    // get latest 6 artifacts data =============================
    app.get('/latestArtifacts',async(req,res)=>{
      const result = await allArtifactsCollection.find().sort({_id : -1}).limit(6).toArray();
      res.send(result);
    })
    // get all artifacts data =======================
   app.get('/allArtifacts',async(req,res)=>{
    const result = await allArtifactsCollection.find().sort({_id : -1}).toArray();
    res.send(result);
   })
  //  get artifact in the base of id ==============================
  app.get('/allArtifacts/:id',async(req,res)=>{
    const id = req.params.id;
    const query = {_id: new ObjectId(id)};
    const result = await allArtifactsCollection.findOne(query);
  
    res.send(result)
  })
  //  post artifact in database ==========================
  app.post('/allArtifacts',async(req,res)=>{
    const newArtifact = req.body;
    const result = await allArtifactsCollection.insertOne(newArtifact);
    res.send(result);
  })

  // like by user ====================================
  app.post('/like',async(req,res)=>{
    const newLike = req.body;
    const userEmail = newLike?.liked_by;
    // const id = newLike.artifacts_Info?.id;
    const artifact_id = newLike.artifacts_Info._id;
    const filter = { 'liked_by': userEmail, 'artifacts_Info._id': artifact_id };
    const findLike = await likeCollection.findOne(filter);
    if(findLike){
      console.log('already liked')
      return ('already liked')
    }
    const query = {_id : new ObjectId(artifact_id)};
    const result = await likeCollection.insertOne(newLike);
    const update = {
      $inc : {like_count : 1},
    }
    const updateLike = allArtifactsCollection.updateOne(query,update)
    res.send(result);
  })
  




  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);








app.listen(port,()=>{
  console.log(`My Server Port is :${port}`)
})