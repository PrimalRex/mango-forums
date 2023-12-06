# Insert data into the tables

USE mangoForums;

INSERT INTO Users (userName, email, password) VALUES ('MangoPro', 'mangopro@example.com', 'secret123');

INSERT INTO Topics (topicName, description, creatorUserID) VALUES ('Welcome To Mango Forums', 'Hello and welcome, we hope you have some fun on this topic, ask anything!', 1);
INSERT INTO Topics (topicName, description, creatorUserID) VALUES ('Movies & Cinema', 'Ask away with anything related to movies and cinema!', 1);
INSERT INTO Topics (topicName, description, creatorUserID) VALUES ('Music', 'Ask away with anything related to music!', 1);

INSERT INTO UserTopics (UserID, TopicID) VALUES (1, 1);
INSERT INTO Posts (description, TopicID, UserID) VALUES ('Test post for welcome topic', 1, 1);
