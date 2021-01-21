const express = require('express');

//Importando as requests para a DB.
const Request = require('tedious').Request;
const connection = require('./database/index');
const routes = require('./routes');

const app = express();
app.use(express.static("public"));
app.use(routes)
app.set('view engine', 'ejs');


//Rodando servidor na porta 3000
app.listen(3000, () => {
    console.log('Servidor rodando...');
}) 