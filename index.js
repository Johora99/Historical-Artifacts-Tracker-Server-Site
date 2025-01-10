const express = require('express');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin:['http://localhost:5173','https://benevolent-cat-fcdbdd.netlify.app'],
  credentials:true
}));

app.use(express.json());
app.use(cookieParser());


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

const verifyToken = (req,res,next)=>{
 const token = req.cookies?.token;
 if(!token){
  return res.status(401).send({message:'unauthorized access'})
 }
 jwt.verify(token,process.env.JWT_SECRET_KEY,(err,decoded)=>{
  if(err){
    return res.status(403).send({message:'unauthorized access'})
  }
  req.user = decoded;
 })
  next();
}
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    
    const allArtifactsCollection = client.db('historicalArtifactsTracker').collection('allArtifacts');
    const likeCollection = client.db('historicalArtifactsTracker').collection('likeByUser');

  // generate jwt token ======================
  app.post('/jwt',(req,res)=>{
      const email = req.body;
      const token = jwt.sign(email,process.env.JWT_SECRET_KEY,{
        expiresIn:'1d'
      });
      res.cookie('token',token,{
        httpOnly:true,
        secure:process.env.NODE_ENV === 'production',
        sameSite:process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      })
      .send({success:true})
     })

    //  remove token after logout ===============================
    app.get('/removeToken',async(req,res)=>{
    res.clearCookie('token',{
    maxAge:0,
    httpOnly:true,
    secure:process.env.NODE_ENV === 'production',
    sameSite:process.env.NODE_ENV === 'production' ? 'none' : 'strict',

    }).send({success:true})
    })



    // get latest 6 artifacts data =============================
    app.get('/latestArtifacts',async(req,res)=>{
      const result = await allArtifactsCollection.find().sort({like_count : -1}).limit(6).toArray();
      res.send(result);
    })
    // get all artifacts data =======================
   app.get('/allArtifacts',async(req,res)=>{
    // const email = req.query.email;
      // const decodedEmail = req.user?.email;
    const search = req.query.search;
    let filter = {};
    // if(email){
    //   if(decodedEmail !== email){
    //   return res.status(401).send({message:'unauthorized access'})
    // }
    //   filter = {'artifact_adder.artifact_added_email':email};
    // }
    if (search) {
    filter.artifact_name = { $regex: search, $options: 'i' };
  }
    const result = await allArtifactsCollection.find(filter).sort({like_count : -1}).toArray();
    res.send(result);
   })
  //  get artifact in the base of id ==============================
  app.get('/allArtifacts/byId/:id',verifyToken,async(req,res)=>{
    const id = req.params.id;
    const query = {_id: new ObjectId(id)};
    const result = await allArtifactsCollection.findOne(query);
  
    res.send(result)
  })

  // get email base data =============================
app.get('/allArtifacts/byEmail/:email',verifyToken, async (req, res) => {
  try {
    const email = req.params.email;
    console.log(email)
    const decodedEmail = req.user?.email;

    // Check authorization
    if (decodedEmail !== email) {
      return res.status(401).send({ message: 'Unauthorized access' });
    }

    // Query artifacts added by the user
    const query = { 'artifact_adder.artifact_added_email': email };
    const result = await allArtifactsCollection.find(query).toArray();
    res.send(result);
  } catch (error) {
    // Handle any errors
    res.status(500).send({ message: 'Internal server error', error: error.message });
  }
});


  // get like by user =============================
  app.get('/like',verifyToken,async(req,res)=>{
    const email = req.query.email;
    const decodedEmail = req.user?.email;
    if(decodedEmail !== email){
      return res.status(401).send({message:'unauthorized access'})
    }
    let filter = {};
    if(email){
      filter = {liked_by : email};
    }
    const result = await likeCollection.find(filter).toArray();
    res.send(result);
  })
  //  post artifact in database ==========================
  app.post('/allArtifacts',async(req,res)=>{
    const newArtifact = req.body;
    const result = await allArtifactsCollection.insertOne(newArtifact);
    res.send(result);
  })
  
  // like by user ====================================
app.post('/like', async (req, res) => {
  const newLike = req.body;
  const userEmail = newLike?.liked_by;
  const artifactId = newLike?.artifacts_Info?._id;

  if (!userEmail || !artifactId) {
    return res.status(400).json({ message: 'Invalid request data!' });
  }

  try {

    const filter = { 'liked_by': userEmail, 'artifacts_Info._id': artifactId };
    const existingLike = await likeCollection.findOne(filter);

    if (existingLike) {
    
      await likeCollection.deleteOne(filter);

      const artifactFilter = { _id: new ObjectId(artifactId) };
      const update = { $inc: { like_count: -1 } };
      const updateResult = await allArtifactsCollection.updateOne(artifactFilter, update);

      if (updateResult.modifiedCount === 0) {
        return res.status(404).json({ message: 'Artifact not found!' });
      }

      return res.status(200).json({ message: 'Disliked successfully!' });
    } else {
  
      const result = await likeCollection.insertOne(newLike);

      const artifactFilter = { _id: new ObjectId(artifactId) };
      const update = { $inc: { like_count: 1 } };
      const updateResult = await allArtifactsCollection.updateOne(artifactFilter, update);

      if (updateResult.modifiedCount === 0) {
        return res.status(404).json({ message: 'Artifact not found!' });
      }

      return res.status(201).json({ message: 'Liked successfully!', result });
    }
  } catch (error) {
    console.error('Error handling like/dislike:', error);
    res.status(500).json({ message: 'Internal server error!' });
  }
});


  //  update artifacts data =====================================
  app.put('/updateArtifacts/:id',async(req,res)=>{
    const updateData = req.body;
    const id = req.params.id;
    const query = {_id : new ObjectId(id)};
    const update = {
      $set : updateData,
    }
    const result = await allArtifactsCollection.updateOne(query,update);
    res.send(result)
  })
  // delete my posted artifacts ================================
  app.delete('/myArtifacts/:id',async(req,res)=>{
    const id = req.params.id;
    const query = {_id : new ObjectId(id)};
    const result = await allArtifactsCollection.deleteOne(query);
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