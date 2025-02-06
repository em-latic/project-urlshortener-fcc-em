require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({extended:false}));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// __________URL helper methods_______________________
let urlCounter = 0;
const urlMap = new Map();

const mapURL = (origUrl) => {
  urlCounter++;
  const shortUrl = urlCounter.toString();
  urlMap.set(shortUrl, origUrl);
  console.log('urlMap', JSON.stringify([...urlMap]));
  return urlCounter;
};

// GET short URL and redirect
app.get('/api/shorturl/:shorturl', (req, res) => {
  const shorturl = req.params.shorturl;

  // redirect to original URL
  const redirectUrl = urlMap.get(shorturl);

  console.log('urlMap: ', JSON.stringify([...urlMap]));
  console.log(redirectUrl);

  if(!redirectUrl){
    res.status(404).send('Page not found for this short URL');
  }
  else {
    res.redirect(redirectUrl);
  }
  //window.location.replace(redirectURL); -> only as client-side 
  //res.status(200);
});

// POST long URL to be shortened
app.post('/api/shorturl', (req, res) => {
  //console.log('Req body', JSON.stringify(req.body));
  const longUrl = req.body.url;
  let realUrl;
  //verify for valid URL
  try {
    realUrl = new URL(longUrl);
  } catch(error) {
    console.error('URL error:', error);
    res.status(400).json({ error: 'invalid url' });
  }
  
  dns.lookup(realUrl.hostname, (err, address, family) => {
    if(err){
      res.status(400).json({ error: 'invalid url' });
    }
    else {
      const shortUrl = mapURL(longUrl);
      const newUrl = {
        "original_url": longUrl,
        "short_url": shortUrl
      };
      res.status(201).json(newUrl);
    }
  });
  
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
