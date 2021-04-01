const express = require('express'),
  morgan = require('morgan');

const app = express();


let topMovies = [
  {
    title: 'The Godfather'
  },
  {
    title: 'Mad Max: Fury Road'
  },
  {
    title: 'Moonlight'
  },
  {
    title: 'Brokeback Mountain'
  },
  {
    title: 'Jaws'
  },
  {
    title: 'Iron Man'
  },
  {
    title: 'Mean Girls'
  },
  {
    title: '12 Angry Men'
  },
  {
    title: 'Get Out'
  },
  {
    title: 'The Good, the Bad and the Ugly'
  }
]

//Middleware
app.use(morgan('common'));

app.use(express.static('public'));

app.use((err, req, res, next) => {
  console.err(error.stack);
  res.status(500).send('Error!');
});


//GET requests

app.get('/', (req, res) => {
  res.send('Welcome to MoviesInfo!')
});

app.get('/movies', (req, res) => {
  res.json(topMovies);
});

//Listen for requests
app.listen(8080, () => {
  console.log('This app is listening on Port 8080.');
})
