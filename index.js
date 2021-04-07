const express = require('express'),
morgan = require('morgan');

const app = express();


let movies = [
  {
    title: 'Black Panther',
    description: 'Black Panther is a 2018 American superhero film based on the Marvel Comics character of the same name. ',
    director: 'Ryan Koogler',
    genre:'Adventure',
    image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQPpcKQ9eWZGxJe6eXyCW91eayLVm4KqruvJz3GP0F2T2w46yKZ',
    featured: true
  }
]

//Middleware

app.use(bodyParser.json());

app.use(morgan('common'));

app.use(express.static('public'));

app.use((err, req, res, next) => {
  console.err(err.stack);
  res.status(500).send('Error!');
});


//GET requests
app.get('/', (req, res) => {
  res.send('Welcome to MoviesInfo!')
});

app.get('/movies', (req, res) => {
  res.json(movies);
});

app.get('/movies/:title', (req, res) => {
  res.json(movies.find((movie) => {
  return movie.title === req.params.title
  }));
});

app.get('/movies/genres/:genre', (req, res) => {
  res.send('Successful GET request returning a description of the genre')
});

app.get('/movies/directors/:name', (req, res) => {
  res.send('Successful GET request returning a description of the Director')
});

app.post('/users', (req, res) => {
  res.send('Registration succesful!')
});

app.put('/users/:username', (req, res) => {
 res.send('The user: ' + req.params.username + ' was successfully updated')
});

app.post('/users/:username/favourites', (req, res) => {
  res.send('Movie: ' + req.params.title + ' was added to favourites.');
  });

app.delete('/users/:username/favourites/:title', (req, res) => {
 res.send('Movie: ' + req.params.title + ' was removed from favourites.');
});

app.delete('/users/:username', (req, res) => {
  res.send('User ' + req.params.id + ' was deleted.');
  });


//Listen for requests
app.listen(8080, () => {
  console.log('This app is listening on Port 8080.');
})
