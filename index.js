const express = require('express'),
morgan = require('morgan');

const app = express();

const cors = require('cors');
app.use(cors());

const { check, validationResult } = require('express-validator');

const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

//mongoose.connect('mongodb://localhost:27017/movieApiDB', {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connect(process.env.CONNECTION_URI, {useNewUrlParser: true, useUnifiedTopology: true});

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
  res.send('Welcome to FlixInfo!')
});

/**
 * This method makes a call to the movies endpoint,
 * authenticates the user using passport and jwt
 * and returns an array of movies objects.
 * @method getMovies
 * @param {string} moviesEndpoint - https://flixinfo.herokuapp.com/movies
 * @param {func} passportAuthentication - Authenticates JavaScript Web Token using the passport node package.
 * @param {func} callback - Uses Movies schema to find list of movies.
 * @returns {Array} - Returns array of movie objects.
 */
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find().then((movies) => {
    res.status(201).json(movies);
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err)
  });
});

/**
 * This method makes a call to the movie title endpoint,
 * authenticates the user using passport and jwt
 * and returns a single movies object.
 * @method getMovieByTitle
 * @param {string} movieEndpoint - https://flixinfo.herokuapp.com/movies/:Title
 * @param {func} passportAuthentication - Authenticates JavaScript Web Token using the passport node package.
 * @param {func} callback - Uses Movies schema to find one movie by title.
 * @returns {Object} - Returns single movie object.
 */
app.get('/movies/:Title', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.findOne({ Title: req.params.Title }).then((movie) => {
    res.status(201).json(movie);
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err)
  });
});

/**
 * This method makes a call to the movie genre name endpoint,
 * authenticates the user using passport and jwt
 * and returns a genre object.
 * @method getGenreByName
 * @param {string} genreEndpoint - https://flixinfo.herokuapp.com/movies/genres/:Name
 * @param {func} passportAuthentication - Authenticates JavaScript Web Token using the passport node package.
 * @param {func} callback - Uses Movies schema to find genre by name.
 * @returns {Object} - Returns genre info object.
 */
app.get('/movies/genres/:Genre', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.findOne({'Genre.Name': req.params.Genre}).then((genre) => {
    res.status(201).json(genre.Genre);
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err)
  });
});

/**
 * This method makes a call to the movie director name endpoint,
 * authenticates the user using passport and jwt
 * and returns a director object.
 * @method getDirectorByName
 * @param {string} directorEndpoint - https://flixinfo.herokuapp.com/movies/directors/:Name
 * @param {func} passportAuthentication - Authenticates JavaScript Web Token using the passport node package.
 * @param {func} callback - Uses Movies schema to find director by name.
 * @returns {Object} - Returns director info object.
 */
app.get('/movies/directors/:Name', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.findOne({'Director.Name': req.params.Name}).then((director) => {
    res.status(201).json(director.Director);
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err)
  });
});


/**
* This method makes a call to the users endpoint,
* validates the object sent through the request
* and creates a user object.
* @method addUser
* @param {string} usersEndpoint - https://flixinfo.herokuapp.com/users
* @param {Array} expressValidator - Validate form input using the express-validator package.
* @param {func} callback - Uses Users schema to register user.
 */

app.post('/users',
[
check('Username', 'Username is required').isLength({min:5}),
check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
check('Password', 'Password is required').not().isEmpty(),
check('Email', 'Email does not appear to be valid').isEmail()
], (req, res) => {
  let errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOne({Username: req.body.Username}).then((user) => {
    if(user) {
      return res.status(400).send(req.body.Username + ' already exists.');
    } else {
      Users.create({
        Username: req.body.Username,
        Password: hashedPassword,
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

/**
* Update a user's info, by username.
* @method updateUser
* @param {string} userNameEndpoint - https://flixinfo.herokuapp.com/users/:Username
* @param {Array} expressValidator - Validate form input using the express-validator package.
* @param {func} callback - Uses Users schema to update user's info by username.
 */
app.put('/users/:Username', passport.authenticate('jwt', {session: false}),
[
check('Username', 'Username is required').isLength({min:5}),
check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
check('Password', 'Password is required').not().isEmpty(),
check('Email', 'Email does not appear to be valid').isEmail()
], (req, res) => {
  let errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOneAndUpdate({ Username: req.params.Username},
{ $set: {
  Username: req.body.Username,
  Password: hashedPassword,
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

/**
* This method makes a call to the user's movies endpoint,
* and pushes the movieID in the FavoriteMovies array.
* @method addToFavorites
* @param {string} userNameMoviesEndpoint - https://flixinfo.herokuapp.com/users/:username/favourites/:MovieID
* @param {Array} expressValidator - Validate form input using the express-validator package.
* @param {func} callback - Uses Users schema to add movieID to list of favorite movies.
 */
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


  /**
  * This method makes a call to the user's movies endpoint,
  * and deletes the movieID from the FavoriteMovies array.
  * @method removeFromFavorites
  * @param {string} userNameMoviesEndpoint - https://flixinfo.herokuapp.com/users/:username/favourites/:MovieID
  * @param {Array} expressValidator - Validate form input using the express-validator package.
  * @param {func} callback - Uses Users schema to remove movieID from list of favorite movies.
   */
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

/**
 * DELETE request to delete a user (by username)
 */
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
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port' + port);
})
