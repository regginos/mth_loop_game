/*
code by regginos
*/

var loopGame = {
  loopLength: 16,
  currentBeat: 0,
  isLoopPlaying: false,
  tempo: 80,
  notes: [60,62,64,67,69,72],
  notesURL: [],
  BUFFERS: [],
  pattern: [],
  context: null,
  soundsPath: '', //TODO: think of a logical stucture for the sounds directory
  warningHTML: '',
  timeId: null,
};

jQuery(document).ready(function() {
  /*
  Loop game is originaly designed as a Drupal 7 module, and the following
  line is a convienient way of passing settings from the server. 
  It can be replaced with something like this:
  var importedSettings = {
    soundsPath: 'path/to/directory/with/sounds',
    warningHTML: '<h1>Message to user</h1><p>How stupid can you be, not to use a browser that supports <a href="http://link.to.some/web/page">web audio</a>!</p>',
  }
  */
  var importedSettings = Drupal.settings.mth_loop_game;
  loopGame.importSettings(importedSettings);
  loopGame.init();
});

loopGame.importSettings = function(settings) {
  for (prop in settings) {
    if (loopGame.hasOwnProperty(prop)) {
      loopGame[prop] = settings[prop];
    }
  }
}

loopGame.init = function() {
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!window.AudioContext) {
    //alert(Drupal.t('Your browser most probably does not support web audio.'));
    var newElem = document.createElement('div');
    newElem.innerHTML = loopGame.warningHTML;
    var elem = document.getElementById('ready');
    elem.appendChild(newElem);
  }
  for (var i = 0; i < loopGame.notes.length; i++) {
    loopGame.pattern[i] = [];
    for (var j = 0; j < loopGame.loopLength; j++) {
      loopGame.pattern[i][j] = false;
    }
  }
  for (var i = 0; i < loopGame.notes.length; i++) {
    var url = loopGame.soundsPath + '/notes_piano_mp3/p' + loopGame.notes[i] + '.mp3';
    loopGame.notesURL.push(url);
  }
  loopGame.context = new AudioContext();
  bufferLoader = new BufferLoader(
    loopGame.context,
    loopGame.notesURL,
    loopGame.finishedLoading
    );
  bufferLoader.load();
}

loopGame.finishedLoading = function(bufferList) {
  for (var i = 0; i < loopGame.notes.length; i++) {
    loopGame.BUFFERS.push(bufferList[i]);
  }
  loopGame.showReady();
  loopGame.createForm();
  loopGame.createTempoControl();
  loopGame.startLoop();
}

loopGame.createForm = function() {
  var text = '';
  text += '<table><form>';
  for (var i = 0; i < loopGame.notes.length; i++) {
    text += '<tr>';
    for (var j = 0; j < loopGame.loopLength; j++) {
      text += '<td>';
      text += '<input type="checkbox" onchange="loopGame.updateBeat(' + i + ',' + j + ',this.checked)">';
      text += '</td>';
    }
    text += '</tr>';
  }
  text += '</form></table>';
  document.getElementById('loopGame').innerHTML = text;
}

loopGame.showReady = function() {
  var r = document.getElementById('ready');
  r.innerHTML = '<p>READY!</p><p>click on some checkboxes. Make sure your speakers are on.</p>';
}

loopGame.createTempoControl = function() {
  document.getElementById('tempo').innerHTML = 'Tempo: <input type="range" min="40" max="200" value="80" onchange="loopGame.updateTempo(this.value);"><span id="tempoValue">80</span>';
}

loopGame.nextBeat = function() {
  loopGame.currentBeat++;
  if (loopGame.currentBeat == loopGame.loopLength) {
    loopGame.currentBeat = 0;
  }
}

loopGame.playBeat = function() {
  for (var i = 0; i < loopGame.notes.length; i++) {
    if (loopGame.pattern[i][loopGame.currentBeat]) {
      loopGame.playNote(i);
    }
  }
  loopGame.nextBeat();
}

loopGame.startLoop = function() {
  if (!loopGame.isLoopPlaying) {
    var interval = (60000 / loopGame.tempo) / 4;
    loopGame.timeId = setInterval(loopGame.playBeat, interval);
    loopGame.isLoopPlaying = true;
    document.getElementById('start_stop').innerHTML = '<input type="button" onclick="loopGame.stopLoop()" value="Stop">';
  }
}

loopGame.stopLoop = function() {
  if (loopGame.isLoopPlaying) {
    clearInterval(loopGame.timeId);
    loopGame.currentBeat = 0;
    loopGame.isLoopPlaying = false;
    document.getElementById('start_stop').innerHTML = '<input type="button" onclick="loopGame.startLoop()" value="Play">';
  }
}

loopGame.playNote = function(index) {
  loopGame.playSound(loopGame.BUFFERS[index], 0);
}

loopGame.playSound = function(buffer, time) {
  var source = loopGame.context.createBufferSource();
  source.buffer = buffer;
  source.connect(loopGame.context.destination);
  if (!source.start) {source.start = source.noteOn;}
  source.start(time);
}

loopGame.updateBeat = function(row,beat,value) {
  loopGame.pattern[row][beat] = value;
}

loopGame.updateTempo = function(value) {
  loopGame.tempo = value;
  document.getElementById('tempoValue').innerHTML = loopGame.tempo;
  if (loopGame.isLoopPlaying) {
    clearInterval(loopGame.timeId);
    var interval = (60000 / loopGame.tempo) / 4;
    loopGame.timeId = setInterval(loopGame.playBeat, interval);
  }
}


/*
var game = new LoopGame('sites/all/modules/mth_loop_game/sounds');
var timeId; //the timeOut or setInterval ID
//window.onload = game.init();

function LoopGame(path) { //constructor function
  this.loopLength = 16;
  this.currentBeat = 0;
  this.isLoopPlaying = false;
  this.tempo = 80;
  //this.notes = notes || [60,62,64,67,69,72];
  this.notes = [60,62,64,67,69,72];
  this.game = [];
  for (var i = 0; i < this.notes.length; i++) {
    this.game[i] = [];
    for (var j = 0; j < this.loopLength; j++) {
      this.game[i][j] = (i === 0 && j === 0) ? true : false;
    }
  }
  this.context;
  this.BUFFERS = [];
  this.notesURL = [];
  for (var i = 0; i < this.notes.length; i++) {
    var url = path + '/notes_piano_mp3/p' + this.notes[i] + '.mp3';
    this.notesURL.push(url);
  }
}

LoopGame.prototype.init = function() {
  var g = this;
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  this.context = new AudioContext();
  this.bufferLoader = new BufferLoader(
    this.context,
    this.notesURL,
    function(bufferList) {
      g.setBuffers(bufferList);
      g.showReady();
      g.createForm();
      g.createTempoControl();
      g.startLoop();
    }
  );
  this.bufferLoader.load();
}

LoopGame.prototype.setBuffers = function(bufferList) {
  for (var i = 0; i < bufferList.length; i++) {
    this.BUFFERS.push(bufferList[i]);
  }
}

LoopGame.prototype.showReady = function() {
  var r = document.getElementById('ready');
  r.innerHTML = '<p>READY!</p><p>click on some checkboxes. Make sure your speakers are on.</p>';
}

LoopGame.prototype.createForm = function() {
  var text = '';
  text += '<table><form>';
  for (var i = 0; i < this.notes.length; i++) {
    text += '<tr>';
    for (var j = 0; j < this.loopLength; j++) {
      text += '<td>';
      text += '<input type="checkbox" onchange="game.updateBeat(' + i + ',' + j + ',this.checked)">';
      text += '</td>';
    }
    text += '</tr>';
  }
  text += '</form></table>';
  document.getElementById('loopGame').innerHTML = text;
}

LoopGame.prototype.createTempoControl = function() {
  document.getElementById('tempo').innerHTML = 'Tempo: <input type="range" min="30" max="220" value="80" onchange="game.updateTempo(this.value);"><span id="tempoValue">80</span>';
}

LoopGame.prototype.startLoop = function() {
  if (!this.isLoopPlaying) {
    var interval = (60000 / this.tempo) / 4;
    timeId = setInterval(this.playBeat, interval);
    this.isLoopPlaying = true;
    document.getElementById('start_stop').innerHTML = '<input type="button" onclick="game.stopLoop()" value="Stop">';
  }
}

LoopGame.prototype.playBeat = function() {
  alert(this.notes);
  for (var i = 0; i < this.notes.length; i++) {
    if (this.game[i][this.currentBeat]) {
      this.playNote(i);
    }
  }
  this.nextBeat();
}

LoopGame.prototype.nextBeat = function() {
  this.currentBeat++;
  if (this.currentBeat == this.loopLength) {
    this.currentBeat = 0;
  }
}

LoopGame.prototype.stopLoop = function() {
  if (this.isLoopPlaying) {
    clearInterval(timeId);
    this.currentBeat = 0;
    this.isLoopPlaying = false;
    document.getElementById('start_stop').innerHTML = '<input type="button" onclick="game.startLoop()" value="Play">';
  }
}

LoopGame.prototype.playNote = function(index) {
  this.playSound(this.BUFFERS[index], 0);
}

LoopGame.prototype.playSound = function(buffer, time) {
  var source = this.context.createBufferSource();
  source.buffer = buffer;
  source.connect(this.context.destination);
  if (!source.start) {source.start = source.noteOn;}
  source.start(time);
}

LoopGame.prototype.updateBeat = function(row,beat,value) {
  this.game[row][beat] = value;
}

LoopGame.prototype.updateTempo = function(value) {
  this.tempo = value;
  document.getElementById('tempoValue').innerHTML = this.tempo;
  if (this.isLoopPlaying) {
    clearInterval(timeId);
    var interval = (60000 / this.tempo) / 4;
    var p = this.playBeat();
    timeId = setInterval(p, interval);
  }
}
*/