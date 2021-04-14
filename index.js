const express = require('express'),
morgan = require('morgan');

const app = express();

const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/movieApiDB', {useNewUrlParser: true, useUnifiedTopology: true});


const bodyParser = require('body-parser');

app.use(bodyParser.json());

let auth = require('./auth')(app)

const passport = require('passport');
require('./passport');

app.use(morgan('common'));

app.use(express.static('public'));

app.use((err, req, res, next) => {
  console.err(err.stack);
  res.status(500).send('Error!');
});



app.get('/', (req, res) => {
  res.send('Welcome to MoviesInfo!')
});

//GET request to have a list of ALL movies in the Database
app.get('/movies', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.find().then((movies) => {
    res.status(201).json(movies);
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err)
  });
});

//GET request to get information about a certain movie by title
app.get('/movies/:Title', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.findOne({ Title: req.params.Title }).then((movie) => {
    res.status(201).json(movie);
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err)
  });
});

//GET request to get information about a specific genre (by name)
app.get('/movies/genres/:Genre', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.findOne({'Genre.Name': req.params.Genre}).then((genre) => {
    res.status(201).json(genre.Genre);
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err)
  });
});

//GET request to get information about a specific Director (by name)
app.get('/movies/directors/:Name', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.findOne({'Director.Name': req.params.Name}).then((director) => {
    res.status(201).json(director.Director);
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err)
  });
});


//POST request to create a new user
app.post('/users', (req, res) => {
  Users.findOne({Username: req.body.Username}).then((user) => {
    if(user) {
      return res.status(400).send(req.body.Username + ' already exists.');
    } else {
      Users.create({
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      }).then((user) => {res.status(201).json(user)}).catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      })
    }
  }).catch((error) => {
    console.error(error);
    res.status(500).send('Error: ' + error);
  });
});

//PUT request to update an existing user
app.put('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username},
{ $set: {
  Username: req.body.Username,
  Password: req.body.Password,
  Email: req.body.Email,
  Birthday: req.body.Birthday
  }
},
{ new : true},
(err, updatedUser) => {
  if(err) {
    console.error(err);
    res.status(500).send('Error: ' + err);
  } else {
    res.json(updatedUser);
    };
  });
});

//POST request to add a movie (by movieID) to a user's favourite movie list.
app.post('/users/:Username/favourites/:MovieID', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username},
{$push: {FavoriteMovies: req.params.MovieID}},
{new: true},
(err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
      };
    });
  });

//DELETE request to remove a movie (by movieID) from a user's favourite movie list.
app.delete('/users/:Username/favourites/:MovieID', passport.authenticate('jwt', {session: false}), (req, res) => {
 Users.findOneAndUpdate({Username: req.params.Username},
 {$pull: {FavoriteMovies: req.params.MovieID}},
 {new: true},
 (err, updatedUser) => {
   if(err) {
     console.error(err);
     res.status(500).send('Error: ' + err);
   } else {
     res.json(updatedUser);
   };
 });
});

//DELETE request to delete a user (by username)
app.delete('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndRemove({Username: req.params.Username}).then((user) => {
    if(!user) {
      res.status(400).send(req.params.Username + ' was not found.');
    } else {
      res.status(200).send(req.params.Username + ' was deleted.');
    };
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
    });
  });


//Listen for requests
app.listen(8080, () => {
  console.log('This app is listening on Port 8080.');
})
