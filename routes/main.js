module.exports = function (app, forumData) {
  // Handle our routes
  app.get("/", (req, res) => {
    if (req.session && req.session.userId) {
      forumData.forumUsername = req.session.forumUsername;
    }
    res.render("homepage.ejs", forumData);
  });

  // Handle the login
  app.get("/login", (req, res) => {
    res.render("login.ejs", forumData);
  });

  // Handle the login when submitted
  app.post("/login", (req, res) => {
    // Query the DB for any matches
    let sqlquery = "SELECT * FROM Users WHERE email = ? AND password = ?";
    db.query(sqlquery, [req.body.email, req.body.password], (err, result) => {
      if (err) {
        console.error(err);
        return res.redirect("/login");
      }

      // If the returning password is null or the password doesnt match we prompt the login again
      if (result.length === 0 || req.body.password !== result[0].password) {
        return res.redirect("/login");
      }

      // If all else is good then we can cache the userID
      const userId = result[0].id;
      req.session.userId = userId;

      // Retrieve the username
      let sqlquery2 = "SELECT userName FROM Users WHERE id = ?";
      db.query(sqlquery2, [userId], (err, result) => {
        if (err) {
          console.error(err);
          return res.redirect("/login");
        }
        // Store the username in the session
        req.session.forumUsername = result[0].userName;
        // Redirect to the homepage
        res.redirect("./");
      });
    });
  });

  // Logout of the account
  app.post("/logout", (req, res) => {
    // Clear everything the session gathered and nuke the saved username
    delete req.session.userId;
    // Clears the cached forumUsername in both session and index.js var;
    delete req.session.forumUsername;
    forumData.forumUsername = "";
    // Redirect to the homepage to refresh
    res.redirect("/");
  });

  app.get("/register", (req, res) => {
    res.render("register.ejs", forumData);
  });

  // Registration Page - POST
  app.post("/register", (req, res) => {
    // Insert the new user into the Users table
    let sqlquery =
      "INSERT INTO Users (userName, email, password) VALUES (?, ?, ?)";

    // Assuming that your registration form has fields named 'username', 'email', and 'password'
    const { username, email, password } = req.body;

    db.query(sqlquery, [username, email, password], (err, result) => {
      if (err) {
        console.error(err);
        res.redirect("/register"); // Redirect to the registration page in case of an error
      } else {
        res.redirect("/login"); // Redirect to the login page after successful registration
      }
    });
  });

  // About page route
  app.get("/about", function (req, res) {
    res.render("about.ejs", forumData);
  });

  // Show all the topics
  app.get("/topics", function (req, res) {
    // Get information about all topics and their creators
    let sqlquery =
      "SELECT Topics.*, Users.userName AS creatorUsername FROM Topics INNER JOIN Users ON Topics.creatorUserID = Users.id";

    // Create a blacklist array, we will fill this with topics the user already follows
    var blacklist = " ";

    // execute sql query
    db.query(sqlquery, (err, result) => {
      if (err) {
        res.redirect("./");
      }

      // Check if the user is logged in
      if (req.session && req.session.userId) {
        // Fetch topics that the user follows
        let sqlquery2 =
          "SELECT * FROM UserTopics JOIN Topics ON UserTopics.TopicID = Topics.id WHERE UserTopics.UserID = ?";

        db.query(sqlquery2, [req.session.userId], (err, followedTopics) => {
          if (err) {
            res.redirect("./");
          }

          // Extract topic names from the list of all topics
          blacklist = followedTopics.map((topic) => topic.topicName);

          // Extended the forum base data to include the sql result and blacklist
          let newData = Object.assign({}, forumData, {
            topicsData: result,
            blacklist: blacklist,
          });
          console.log(blacklist);
          res.render("topics.ejs", newData);
        });
      } else {
        // User is not logged in,just use an empty blacklist
        let newData = Object.assign({}, forumData, {
          topicsData: result,
          blacklist: blacklist,
        });
        console.log(newData);
        res.render("topics.ejs", newData);
      }
    });
  });

  //When the follow button is clicked on the follow page
  app.post("/followtopic", function (req, res) {
    // Perform the database update to indicate that the user follows the topic
    let sqlquery =
      "INSERT INTO UserTopics (userID, topicID) VALUES (?, ?)";

    console.log(req.body.topic);
    db.query(sqlquery, [req.session.userId, req.body.topic], (err, result) => {
      if (err) {
        console.log(err);
        // We will assume that if we didnt have a valid userID that the user is not logged in yet so redirect to there
        res.redirect("/login");
      } else {
        // Redirect to the topics page after successful follow
        res.redirect("/topics");
      }
    });
  });

  // Show all registered users
  app.get("/users", function (req, res) {
    // Get the names of all the users
    let sqlquery = "SELECT userName FROM Users";
    // execute sql query
    db.query(sqlquery, (err, result) => {
      if (err) {
        res.redirect("./");
      }
      // Extended the forum base data to include the sql result
      let newData = Object.assign({}, forumData, { totalUsers: result });
      console.log(newData);
      res.render("users.ejs", newData);
    });
  });

  // Show all posts
  app.get("/posts", function (req, res) {
    // Get information about all posts, including post name, creator username, and topic name
    let sqlquery =
      "SELECT Posts.*, Users.userName AS creatorUsername, Topics.topicName FROM Posts INNER JOIN Users ON Posts.UserID = Users.id INNER JOIN Topics ON Posts.TopicID = Topics.id";

    // execute sql query
    db.query(sqlquery, (err, result) => {
      if (err) {
        res.redirect("./");
      }

      // Extended the forum base data to include the sql result
      let newData = Object.assign({}, forumData, { postsData: result });
      console.log(newData);

      res.render("posts.ejs", newData);
    });
  });

  // Add a post
  app.get("/addpost", function (req, res) {
    // Check if the user is authenticated by checking the session
    if (req.session && req.session.userId) {
      // Get the subscribed topics for the logged-in user
      let userId = req.session.userId;
      let sqlquery =
        "SELECT Topics.* FROM Topics INNER JOIN UserTopics ON Topics.id = UserTopics.TopicID WHERE UserTopics.UserID = " +
        userId;

      db.query(sqlquery, [userId], (err, userSubscribedTopics) => {
        if (err) {
          res.redirect("./");
        } else {
          // Render the addpost page with the correct information
          res.render("addpost.ejs", { topicsData: userSubscribedTopics });
        }
      });
    } else {
      // If the user isnt authenticated, then get them to login
      res.redirect("/login");
    }
  });

  // Try to upate the DB when adding a post
  app.post("/addedpost", function (req, res) {
    // Insert the new post into the Posts table
    let sqlquery =
      "INSERT INTO Posts (description, TopicID, UserID) VALUES (?, ?, ?)";
    db.query(
      sqlquery,
      [req.body.description, req.body.topic, req.session.userId],
      (err, result) => {
        if (err) {
          res.redirect("./");
        } else {
          res.redirect("./");
        }
      }
    );
  });

  // Route to page where user can specify keyword to search for
  app.get("/search", function (req, res) {
    res.render("searchposts.ejs", forumData);
  });

  // Keyword based query for a return page with the list of matching posts
  app.get("/searchedpostsresult", function (req, res) {
    // Query to find posts that contain the specified keyword
    let sqlquery =
      "SELECT Posts.*, Users.id AS creatorID, Users.userName AS creatorUsername, Topics.topicName FROM Posts INNER JOIN Users ON Posts.UserID = Users.id INNER JOIN Topics ON Posts.TopicID = Topics.id WHERE Posts.description LIKE ?";
    let keyword = "%" + req.query.keyword + "%";

    // execute sql query
    db.query(sqlquery, [keyword], (err, result) => {
      if (err) {
        console.error(err);
        res.redirect("./");
      } else {
        // Merge the result into the forumdata so that it can be passed into the EJS file
        // Extended the new data to pass the 'keyword' in so that the result page can show that with the matching list
        let newData = Object.assign({}, forumData, {
          postsData: result,
          query: req.query.keyword,
        });
        console.log(newData);
        res.render("searchedpostsresult.ejs", newData);
      }
    });
  });
};
