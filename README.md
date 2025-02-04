# LiQuest

LiQuest is a dynamic and visually appealing website dedicated to showcasing historical artifacts from different parts of the world. It provides a curated platform for users to explore, like, and manage artifacts while diving into their fascinating histories.

## Purpose
The purpose of Artifact Explorer is to celebrate and preserve human history by providing an engaging platform where users can explore and learn about historical artifacts from around the world. It serves as a digital archive to connect people with cultural treasures, inspiring curiosity and appreciation for the rich heritage of humanity. Whether you're a history enthusiast, a student, or simply someone who loves discovering fascinating stories from the past, Artifact Explorer is your gateway to exploring the wonders of ancient civilizations and cultural legacies.
## Technologies Used

- **Node.js** - JavaScript runtime for server-side programming.
- **Express** - Web framework for Node.js to handle routes and requests.
- **MongoDB** - NoSQL database for storing artifact data and user likes.
- **JWT (JSON Web Token)** - Authentication mechanism for secure access to protected routes.
- **Cookie Parser** - Middleware to handle cookies.
- **CORS** - Middleware for handling Cross-Origin Resource Sharing.
- **dotenv** - Loads environment variables from a `.env` file into `process.env`.
## API 
https://historical-artifacts-tracker-phi.vercel.app/
## API Endpoints
### General Routes
- GET / - Home route. Returns a message: "My Historical Artifacts Tracker".
Authentication Routes
- POST /jwt - Generate JWT token and set it in a cookie for authentication.
Request Body: { "email": "user@example.com" }
Response: { "success": true }
- GET /removeToken - Clear JWT token from the cookie for logging out.
Response: { "success": true }
Artifacts Routes
- GET /latestArtifacts - Fetch the latest 6 artifacts sorted by the highest likes.

Response: Array of the latest artifacts.
- GET /allArtifacts - Fetch all artifacts with optional search and filter by email.

### Query Parameters:
email: The email of the artifact adder (for personal artifacts).
search: Search term to filter artifacts by name.
Response: Array of artifacts.
- GET /allArtifacts/:id - Get artifact details by ID.

Response: Single artifact object.
- POST /allArtifacts - Add a new artifact to the collection.

Request Body: Artifact data (e.g., name, type, etc.).
Response: { "success": true, "artifactId": <newArtifactId> }
- PUT /updateArtifacts/:id - Update artifact data by ID.

Request Body: Updated artifact data.
Response: { "success": true }
- DELETE /myArtifacts/:id - Delete an artifact from the collection by ID.

Response: { "success": true }
Like/Dislike Routes
- GET /like - Fetch all liked artifacts by the user.

Query Parameters: email - Email of the user.
Response: Array of liked artifacts.
- POST /like - Like or dislike an artifact.

- Request Body: { "liked_by": "user@example.com", "artifacts_Info": { "_id": "artifactId" } }
- If the user has already liked the artifact, it will be unliked and the like count will decrement.
- If the user hasn't liked the artifact, it will be liked and the like count will increment.
Response: { "message": "Liked successfully!" } or { "message": "Disliked successfully!" }

## 🔧 Installation
```sh
git clone https://github.com/Johora99/Historical-Artifacts-Tracker-Server-Site.git

cd Historical-Artifacts-Tracker

npm install

nodemon index.js
```

## Live Link
https://benevolent-cat-fcdbdd.netlify.app
