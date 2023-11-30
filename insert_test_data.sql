# Insert data into the tables

USE mangoForums;

INSERT INTO Users (userName, email, password) VALUES ('MangoPro', 'mangopro@example.com', 'secret123');

INSERT INTO Topics (topicName, description, creatorUserID) VALUES ('New Topic', 'Description of the new topic', 1);
INSERT INTO Topics (topicName, description, creatorUserID) VALUES ('New Topic 2 ', 'another one', 1);

INSERT INTO UserTopics (UserID, TopicID) VALUES (1, 1);
INSERT INTO Posts (description, TopicID, UserID) VALUES ('This is a new post in the new topic', 1, 1);
