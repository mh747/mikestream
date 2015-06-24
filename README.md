# mikestream

Mikestream is a simple API written in node.js that interacts with Livestream. Mikestream will map registered directors with their accounts on Livestream, and stores some of its own attributes associated with each director, such as a favorite camera or favorite movies. See below for more detailed instructions on usage.

## Getting Started

### System Requirements

To run Mikestream locally on your PC, you will first need a few things. You will need to have node.js and npm installed on your system, as well as Redis Server. Once you have those two things, you can continue to the next step.

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

This will install the dev dependencies as well, so the test script can be run if desired.

### Database

As long as you have Redis-server up and running on your PC (on the default port), there is no additional setup required to run Mikestream locally.
Mikestream will use the following hash keys in redis:

```
mikestream_users
mikestream_user:n, where n is a unique user_id
mikestream_next_user_id
```

### Starting Server

At this point, we are ready to start the webserver. Run these commands in your terminal:

```

% cd <...>/mikestream/
% node server.js

```

This will start the server on Port 3000.

## Testing

In the 'test' directory, you will find a test script that can be run using Mocha. If you don't already have Mocha installed globally, run the following command:

```
% sudo npm install mocha -g

```

Once the package is installed, you'll be able to run the following:

```

% cd <...>/mikestream/
% mocha

```

This will test the API against the different cases scripted in director_test.js.

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

Please note that the request body MUST be in JSON. The JSON in the request body should look something like this:
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

The message body should contain JSON only. The message body should look something like this:
```
{
"favorite_camera":"Nikon",
"favorite_movies":"Superbad"
}
```
These fields are both *optional*. However, only fields that are included in the message body will be changed. So, if the body doesn't contain any fields, none of the director's attributes will be changed.

## Questions

If you have any questions or comments, please feel free to send them to me at mike.w.henderson.88@gmail.com.
