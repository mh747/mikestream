# mikestream

Mikestream is a simple API written in node.js that interacts with Livestream. Mikestream will map registered directors with their accounts on Livestream, and stores some of its own attributes associated with each director, such as a favorite camera or favorite movies. See below for more detailed instructions on usage.

## Getting Started

### System Requirements

To run Mikestream locally on your PC, you will first need a few things. You will need to have node.js and npm installed on your system, as well as MySQL. Once you have those two things, you can continue to the next step.

###Cloning Repository

To run an instance of Mikestream locally, you will need to clone this repository onto your PC.

```

% git clone https://github.com/mh747/mikestream.git

````

### Node Dependencies

Once you have cloned the repository locally, you will need to install the dependencies required to run it.

On your command line:

```
% cd <...>/mikestream/
% npm install

```

### Setting Up Database

In order for Mikestream to run locally, it needs a MySQL database called 'mikestream', and a table called 'user'. This can be set up by entering the following into the MySQL command line:

```

mysql> CREATE DATABASE IF NOT EXISTS mikestream;
mysql> use mikestream;
mysql> CREATE TABLE user (
    ->     ls_id INT NOT NULL,
    ->     favorite_camera VARCHAR(200),
    ->     favorite_movies MEDIUMTEXT,
    ->     PRIMARY KEY( ls_id )
    ->     );

```

You will also need to enter your details into the /mikestream/database/db.js file.

In your terminal:
```
% cd <...>/mikestream/database/
% vim db.js            //You can replace vim with your text editor of choice
```

In db.js, make the following changes:
```javascript
...
var pool = mysql.createPool({
	host	: "localhost",
	user	: "test",   //--> replace with your db username
	password: "test",   //--> replace with your db password
	database: "mikestream"
});
...
```
Save file, close file, on to the next step.

### Starting Server

At this point, we are ready to start the webserver. Run these commands in your terminal:

```

% cd <...>/mikestream/
% node server.js

```

This will start the server on Port 3000.

## Using API

This API can be used for a few different functions. Here's what you can do with it:

### List Directors

Anyone can get a list of all directors. This is done by sending a GET request to:
```
http://localhost:3000/mikestream/directors
```

### List Details for a Single Director

Anyone can get the details for a single director. This is done by sending a GET request to:
```
http://localhost:3000/mikestream/directors/:livestream_id
```

### Register a New Director

Any director can be registered on Mikestream. The way to do this is by sending a POST request to:
```
http://localhost:3000/mikestream/directors
```

Please note that the request body MUST be in JSON, and the header 'Content-Type: application/json' must be sent. The JSON in the request body should look something like this:
```
{
"livestream_id":"12345",
"favorite_camera":"Sony F65",
"favorite_movies":"Entourage, Trailer Park Boys"
}
```
favorite_camera and favorite_movies are *optional* fields; they do not need to be present in the message body.

### Update Details for an Existing User

The favorite_camera and favorite_movies fields can be changed for any registered director. These two are the *only* fields that can be modified. They can be changed by sending a PUT request to:
```
http://localhost:3000/mikestream/directors/:livestream_id
```

In order to change a director's details, an authorization key must be sent in the header of the request. It should look like this:
```
Authorization: Bearer md5(full_name of director to be changed)
```

The message body should contain JSON only, and the Content-Type: application/json header should be present. The message body should look something like this:
```
{
"favorite_camera":"Nikon",
"favorite_movies":"Superbad"
}
```
These fields are both *optional*. However, only fields that are included in the message body will be changed. So, if the body doesn't contain any fields, none of the director's attributes will be changed.

## Questions

If you have any questions or comments, please feel free to send them to me at mike.w.henderson.88@gmail.com


