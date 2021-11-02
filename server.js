const express = require("express");
const app = express();
const port = 3000;
const bodyParser = require("body-parser");
const path = require("path");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

//Connection test
app.listen(port, () => {
  console.log(`Project running at http://localhost:${port}`);
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/client")));

// Route to Homepage
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/client/index.html");
});

// Route to Login Page
app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/client/login.html");
});

//route to login error page
app.get("/login-error", (req, res) => {
  res.sendFile(__dirname + "/client/login-error.html");
});

//route to account already exist page
app.get("/account-already-exists", (req, res) => {
  res.sendFile(__dirname + "/client/account-already-exist.html");
});

//route to create account page
app.get("/register", (req, res) => {
  res.sendFile(__dirname + "/client/register.html");
});

// Route to Feedback Page
app.get("/feedback", (req, res) => {
  res.sendFile(__dirname + "/client/feedback.html");
});

// MongoDB Connection URI
const uri = process.env.MONGO_URL;
// Create a new MongoClient
const client = new MongoClient(uri);
const project_database = client.db("cs5610project2");
async function run() {
  try {
    // Connect the client to the server
    await client.connect();
    // Establish and verify connection
    await client.db("admin").command({ ping: 1 });
    console.log("Connected successfully to server");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
//Initialize MongoDB Connection
run().catch(console.dir);

//Define Global Variables
let username_global;
let login_status = false;

//Change the behavior after user put in username and password in login page.
app.post("/login-auth", (req, res) => {
  console.log("Processing...");
  // Insert Login Code Here
  const username = req.body.username;
  const password = req.body.password;
  const username_password_db = project_database.collection("Username_Password");
  const user_info = process_username_password_input(
    username,
    password,
    username_password_db,
    res
  );
});

// Reaction when user created an account
app.post("/account-register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const username_password_db = project_database.collection("Username_Password");
  create_account(username, password, username_password_db, res).catch(
    console.dir
  );
});

app.post("/submit-feedback", (req, res) => {
  console.log("Processing Feedback Submission");
  const name = username_global;
  const subject = req.body.subject;
  const message = req.body.message;

  const feedback_database = project_database.collection("Feedback Box");
  const doc = {
    user: name,
    subject: subject,
    comment: message,
  };
  const execute = feedback_database.insertOne(doc);
  console.log("Feedback Successfully Submitted!");
  getComments().catch(console.dir);
  res.redirect("/feedback");
});

app.post("/feedback-edit", async (req, res) => {
  console.log("Feedback Edit Request Received! (Backend)");
  const subject = req.body.textsubject;
  const originalid = req.body.originaltext;
  const editedtext = req.body.textarea;
  await edit_feedback(originalid, editedtext, subject).catch(console.dir);
  res.redirect("/feedback");
});

app.post("/feedback-delete", async (req, res) => {
  console.log("Feedback Delete Request Received! (Backend)");
  const originalid = req.body.originaltext;
  await delete_feedback(originalid).catch(console.dir);
  res.redirect("/feedback");
});

//Create an account
//Return Boolean.
async function create_account(username, password, collection_info, res) {
  const query = {
    username: username,
  };
  const execute = await collection_info.findOne(query);

  if (execute != null) {
    res.redirect("/account-already-exists");
  } else {
    insert_username_password(username, password, collection_info).catch(
      console.dir
    );
    username_global = username;
    res.redirect("/login");
  }
}
//might need to change to id here.
async function edit_feedback(originalId, editedtext, editedSubject) {
  const feedback_database = project_database.collection("Feedback Box");
  const query = { _id: ObjectId(originalId) };
  const updateDoc = {
    $set: {
      comment: editedtext,
      subject: editedSubject,
    },
  };
  const execute = await feedback_database.updateOne(query, updateDoc);
  console.log("Comment successfully edited!");
  //Attempt to reload comments.
  getComments().catch(console.dir);
}

async function delete_feedback(originalId) {
  const feedback_database = project_database.collection("Feedback Box");
  const query = { _id: ObjectId(originalId) };
  console.log(query);
  const execute = feedback_database.deleteOne(query);
  console.log("Comment successfully deleted!");
  //Attempt to reload comments.
  getComments().catch(console.dir);
}

// Insert Username Password pair to MongoDB database.
async function insert_username_password(
  username,
  password,
  collection_info,
  res
) {
  //connect to the collection and deal with mongoDB data

  const write_info = {
    username: username,
    password: password,
  };
  const execute = await collection_info.insertOne(write_info);
  console.log("A Username Password Pair has been inserted successfully.");
}

//Process username and password input.
async function process_username_password_input(
  username,
  password,
  collection_info,
  res
) {
  const query = {
    username: username,
  };
  const execute = await collection_info.findOne(query);
  if (execute == null) {
    res.redirect("/login-error");
  } else {
    if (password == execute.password) {
      username_global = username;
      let query2;
      if (username === "admin@admin") {
        query2 = {};
      } else {
        query2 = { user: username };
      }

      const comment_db = project_database.collection("Feedback Box");
      let comment_json = [];

      const comment_retrieved = await comment_db
        .find(query2)
        .forEach(function (doc) {
          comment_json.push(doc);
        });

      app.get("/comment-text", function (req, res) {
        res.json(comment_json);
      });

      login_status = true;

      const user_comment = res.redirect("/feedback");
    } else {
      res.redirect("/login-error");
    }
  }
}

async function getComments() {
  console.log("Reload comment has been executed.");
  let query2;
  if (username_global === "admin@admin") {
    query2 = {};
  } else {
    query2 = { user: username_global };
  }
  // const query2 = { user: username_global };
  const comment_db = project_database.collection("Feedback Box");
  return await comment_db.find(query2).toArray();
}

app.get("/comment-text-update", async function (req, res) {
  const comment_json = await getComments();
  res.json(comment_json);
});
