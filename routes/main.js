module.exports = function(app, forumData) {

    // Handle our routes
    app.get('/',function(req,res){
        res.render('index.ejs', forumData)
    });

    // About page route
    app.get('/about',function(req,res){
        res.render('about.ejs', forumData);
    }); 

    // Show all the topics
    app.get('/topics', function(req, res) {
        // Get information about all topics and their creators
        let sqlquery = "SELECT Topics.*, Users.userName AS creatorUsername FROM Topics INNER JOIN Users ON Topics.creatorUserID = Users.id";
        
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./');
            }
            
            // Extended the forum base data to include the sql result
            let newData = Object.assign({}, forumData, { topicsData: result });
            console.log(newData);
            
            res.render("topics.ejs", newData);
        });
    });
    

    // Show all registered users
    app.get('/users',function(req,res){
        // Get the names of all the users
        let sqlquery = "SELECT userName FROM Users";
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./'); 
            }
            // Extended the forum base data to include the sql result
            let newData = Object.assign({}, forumData, {totalUsers:result});
            console.log(newData)
            res.render("users.ejs", newData)
         });                                                                 
    }); 

    // Show all posts
    app.get('/posts', function(req, res) {
        // Get information about all posts, including post name, creator username, and topic name
        let sqlquery = "SELECT Posts.*, Users.userName AS creatorUsername, Topics.topicName FROM Posts INNER JOIN Users ON Posts.UserID = Users.id INNER JOIN Topics ON Posts.TopicID = Topics.id";
    
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./');
            }
    
            // Extended the forum base data to include the sql result
            let newData = Object.assign({}, forumData, { postsData: result });
            console.log(newData);
    
            res.render("posts.ejs", newData);
        });
    });

    app.get('/search',function(req,res){
        res.render("searchposts.ejs", forumData);
    });


    app.get('/searchedpostsresult', function (req, res) {
        // Query to find posts that contain the specified keyword
        let sqlquery = "SELECT Posts.*, Users.id AS creatorID, Users.userName AS creatorUsername, Topics.topicName FROM Posts INNER JOIN Users ON Posts.UserID = Users.id INNER JOIN Topics ON Posts.TopicID = Topics.id WHERE Posts.description LIKE ?";
        let keyword = '%' + req.query.keyword + '%';
        
        // execute sql query
        db.query(sqlquery, [keyword], (err, result) => {
            if (err) {
                console.error(err);
                res.redirect('./');
            } else {
                // Merge the result into the forumdata so that it can be passed into the EJS file
                // Extended the new data to pass the 'keyword' in so that the result page can show that with the matching list
                let newData = Object.assign({}, forumData, { postsData: result, query: req.query.keyword });
                console.log(newData);
                res.render("searchedpostsresult.ejs", newData);
            }
        });
    });
    
    
    

    app.get('/addpost', function(req, res) {
        // TODO get userID from login and use that here
        let userId = 1;
    
        // Get the subscribed topics for the logged in user
        let sqlquery = "SELECT Topics.* FROM Topics INNER JOIN UserTopics ON Topics.id = UserTopics.TopicID WHERE UserTopics.UserID = " + userId;
        
        db.query(sqlquery, [userId], (err, userSubscribedTopics) => {
            if (err) {
                res.redirect('./'); 
            } else {
                // Render the addpost page with the correct information
                res.render("addpost.ejs", { topicsData: userSubscribedTopics });
            }
        });
    });

    app.post('/addedpost', function(req, res) {
        // Insert the new post into the Posts table
        let sqlquery = "INSERT INTO Posts (description, TopicID, UserID) VALUES (?, ?, ?)";
        // TODO get the userID thats trying to post
        db.query(sqlquery, [req.body.description, req.body.topic, 1], (err, result) => {
            if (err) {
                res.redirect('./'); 
            } else {
                res.redirect('./'); 
            }
        });
    });
    
    

}
