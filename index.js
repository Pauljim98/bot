const dotenv = require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const apiRoute = require('./routes/index');

const port = 3001;
const app = express();

app.use(express.json());
app.use(cors());
app.use('/mediaFiles', express.static(__dirname + '/mediaFiles'));
app.use(apiRoute);

const server = http.Server(app);

server.listen(port, () => {
    console.log(`Servidor listo en el puerto ${port}`);
});


