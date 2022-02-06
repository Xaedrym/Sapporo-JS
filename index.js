/********************************************************** 
 *              Chargement des modules 
 **********************************************************/

// FileSystem : lecture de fichiers
const fs = require('fs');
const readline = require('readline');

// Express : serveur web 
var express = require('express');


/*****************************************************
 *             Lancement du serveur web
 *****************************************************/
var app = express();

app.listen(8080, function() {
    console.log("C'est parti ! En attente de connexion sur le port 8080...");
});

// Configuration d'express pour utiliser le répertoire "public"
app.use(express.static('public'));
// par défaut, envoie le fichier index.html 
app.get('/', function(req, res) {  
    res.sendFile(__dirname + '/public/metro.html');
});


/********************************************************
 *          Définition de routes spécifiques 
 ********************************************************/
var lines = {};
var stations = [];

app.get('/lines', function(req, res) {
  console.log("Reçu : GET /lines");
  res.setHeader('Content-type', 'application/json');
  res.json(lines);
});

app.get('/stations/:couleur', function(req, res) {
  let color = req.params.couleur;
  console.log("Reçu : GET /stations/" + color);
  res.setHeader('Content-type', 'application/json');
  let tab_return = [];
  for(const sta of stations){
    if(sta.lignes[color] != null){
      tab_return.push(sta);
    }
  }
  tab_return.sort(function(a, b){return a.lignes[color] - b.lignes[color];});
  res.json(tab_return);
});


/******************************************************************************
 *                      Gestion des stations et des lignes
 ******************************************************************************/

// lecture et initialisation de l'ensemble des stations
// source : https://nodejs.org/api/readline.html#readline_example_read_file_stream_line_by_line
(async function processLineByLine(file) {
  const fileStream = fs.createReadStream(file);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    let station = line.split(", ");
    let lig = {};
    for(let i = 3; station[i] != null; i+=2){
      lig[station[i]] = parseInt(station[i+1]);
      if(lines[station[i]] == null){
        lines[station[i]] = [];
      }
      lines[station[i]].push([parseFloat(station[1]), parseFloat(station[2]), parseInt(station[i+1])]);
    }
    stations.push({nom_station:station[0], lat:parseFloat(station[1]), long:parseFloat(station[2]),lignes: lig });
  }
  for(let line in lines){
    lines[line].sort(function(a, b){return a[2] - b[2];});
  }
})('./stations.csv');
    