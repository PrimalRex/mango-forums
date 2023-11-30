# Create database script for mango forums

# Create the database
CREATE DATABASE mangoForums;
USE mangoForums;

# Create the tables
CREATE TABLE Users (id INT AUTO_INCREMENT, userName VARCHAR(45) NOT NULL, email VARCHAR(45) NOT NULL, password VARCHAR(45) NOT NULL, PRIMARY KEY(id));
CREATE TABLE Topics (id INT AUTO_INCREMENT, topicName VARCHAR(80) NOT NULL, description TEXT, creatorUserID INT, PRIMARY KEY(id), FOREIGN KEY (CreatorUserID) REFERENCES Users(id));
CREATE TABLE Posts (id INT AUTO_INCREMENT, description VARCHAR(500), TopicID INT, UserID INT, PRIMARY KEY (id), FOREIGN KEY (TopicID) REFERENCES Topics(id), FOREIGN KEY (UserID) REFERENCES Users(id));
CREATE TABLE UserTopics (UserID INT, TopicID INT, PRIMARY KEY (UserID, TopicID), FOREIGN KEY (UserID) REFERENCES Users(id), FOREIGN KEY (TopicID) REFERENCES Topics(id));

# Create the app user and give it access to the database
CREATE USER 'appuser'@'localhost' IDENTIFIED WITH mysql_native_password BY 'app2027';
GRANT ALL PRIVILEGES ON mangoForums.* TO 'appuser'@'localhost';
