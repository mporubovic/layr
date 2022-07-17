DROP TABLE IF EXISTS concepts;
DROP TABLE IF EXISTS users;

CREATE TABLE users
(
    id          int AUTO_INCREMENT PRIMARY KEY,
    name        text NOT NULL
);

CREATE TABLE concepts
(
    id          int AUTO_INCREMENT PRIMARY KEY,
    name        text NOT NULL,
    user_id     int  NOT NULL,
    content     json NULL,
    created_at  timestamp DEFAULT current_timestamp,
    updated_at  timestamp DEFAULT current_timestamp ON UPDATE current_timestamp,

    CONSTRAINT FOREIGN KEY (user_id) REFERENCES users(id)
);