# FliXInfo

## Overview

FliXInfo is an API which provides users with access to information about movies, genres and directors. Users are able to register/un-register, update their user profile, and create a list of their favorite movies.

### API Documentation

For a full list of endpoints and request methods used, [check out my API documentation](https://flixinfo.herokuapp.com/documentation.html).

## Features

- Return a list of ALL movies to the user
- Return data (description, genre, director, image URL) about a single movie by title to the user
- Return data about a genre (description) by name/title (e.g., “Thriller”)
- Return data about a director (bio, birth year, death year) by name
- Allow new users to register
- Allow users to update their user info (username, password, email, date of birth)
- Allow users to add a movie to their list of favorites
- Allow users to remove a movie from their list of favorites
- Allow existing users to deregister

## Core Back-End Technologies

- MongoDB
- Express.js
- Node.js
- Mongoose
- Heroku
- NPM

## Authentication

The app uses JWT (token-based) authentication with the help of passport.js.
