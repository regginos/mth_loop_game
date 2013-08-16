/*
code by regginos
*/

var loopGame = {
  loopLength: 16,
  currentBeat: 0,
  isLoopPlaying: false,
  tempo: 80,
  notes: [60,62,64,67,69,72],
  allNotes: [],
  notesURL: [],
  BUFFERS: [],
  pattern: [],
  context: null,
  soundsPath: '', //TODO: think of a logical stucture for the sounds directory
  loadPath: '',
  savePath: '',
  notesPath: '',
  noslPath: '',
  nosl: 3,
  waitHTML: '',
  warningHTML: '',
  beatColor: '',
  currentBeatColor: '',
  timeId: null,
};

jQuery(document).ready(function() {
  /*
  Loop game is designed as a Drupal 7 module, and the following
  line is a convienient way of passing settings from the server. 
  */
  var importedSettings = Drupal.settings.mth_loop_game;
  loopGame.importSettings(importedSettings);
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!window.AudioContext) {
    document.getElementById('ready').innerHTML = loopGame.warningHTML;
  }
  else {
    loopGame.context = new AudioContext();
    if (loopGame.pattern.length === 0) {
      loopGame.setPattern();
    }
    loopGame.init();
  }
});

loopGame.ModDialNotes = function() {
  var arg = {notes: loopGame.notes, allNotes: loopGame.allNotes};
  var r = window.showModalDialog(loopGame.notesPath,
      arg, "dialogwidth: 600; dialogheight: 300; resizable: yes");
  if (r) {
    document.getElementById('notes').value = r;
  }
}

loopGame.processNewForm = function(form) {
  for (var i = 0; i < form.length; i++) {
    switch (form[i].name) {
      case 'notes': loopGame.setNotes(form[i].value); break;
      case 'loopLength': loopGame.setLoopLength(form[i].value); break;
    }
  }
  loopGame.makeNewLoop();
}

loopGame.setNotes = function(notesString) {
  //TODO: do some validation
  var arr = notesString.split(',');
  for (var i = 0; i < arr.length; i++) {
    arr[i] = arr[i].trim();
  }
  loopGame.notes = arr;
}

loopGame.setLoopLength = function(string) {
  loopGame.loopLength = parseInt(string, 10);
}

loopGame.makeNewLoop = function(settings) {
/*
  if (arguments.length > 0) {
    loopGame.importSettings(settings);
  }
*/
  loopGame.stopLoop();
  document.getElementById('ready').innerHTML = loopGame.waitHTML;
  document.getElementById('loopGame').innerHTML = '';
  loopGame.setPattern();
  loopGame.init();
}

loopGame.saveOnServer = function() {
  var string = JSON.stringify(loopGame,
      ['loopLength','notes','tempo','pattern']);
  var request = new XMLHttpRequest();
  var url =  loopGame.savePath + '/' + string;
  request.open("GET", url, true);
  request.onload = function() {
    alert(request.response);
    loopGame.getNumberOfLoopsOnServer();
  }
  request.onerror = function() {
    alert('Error: failed saving loop on server.');
  }
  request.send();
}

loopGame.proccesFormRetrieve = function(form) {
  for (var i = 0; i < form.length; i++) {
    if (form[i].name === 'server_loops') {
      var value = form[i].value;
    }
  }
  if (isNumber(value)) {
    var path = loopGame.loadPath + '/' + value;
    loopGame.loadFromServer(path);
  }
  else {
    alert('Invalid input! The loop ID is a number.');
  }
  function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }
}

loopGame.loadFromServer = function(url) {
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.onload = function() {
    if (request.response.charAt(0) != '{') { //TODO: do a better check for correct response, than checking first character.
      alert(request.response);
    }
    else {
      loopGame.loadLoop(JSON.parse(request.response));
    }
  }
  request.onerror = function() {
    alert('Error: failed loading loop from server.');
  }
  request.send();
}

loopGame.proccesLoadForm = function(form) {
  for (var i = 0; i < form.length; i++) {
    if (form[i].name === 'loop_settings') {
      //TODO: do some validation
      var loop = JSON.parse(form[i].value);
    }
  }
  loopGame.loadLoop(loop);
}

loopGame.exportLoop = function() {
  var string = JSON.stringify(loopGame, ['loopLength','notes','tempo','pattern']);
  var newWindow = window.open('','','width=400,height=300');
  newWindow.document.write(string);
}

loopGame.loadLoop = function(loop) {
  loopGame.stopLoop();
  document.getElementById('ready').innerHTML = loopGame.waitHTML;
  document.getElementById('loopGame').innerHTML = '';
  loopGame.importSettings(loop);
  loopGame.init();
}

loopGame.importSettings = function(settings) {
  for (prop in settings) {
    if (loopGame.hasOwnProperty(prop)) {
      loopGame[prop] = settings[prop];
    }
  }
}

loopGame.getNumberOfLoopsOnServer = function() {
  var url = loopGame.noslPath;
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.onload = function() {
    loopGame.nosl = request.response;
    loopGame.createFormSaveRetrieve();
  }
  request.onerror = function() {
    alert('Error: failed getting number of saved loops from server.');
  }
  request.send();
}

loopGame.createFormSaveRetrieve = function() {
  var text = '<form id="form_save_retrieve">';
  text += '<input type="button" value="Save Loop Online" onclick="loopGame.saveOnServer();">';
  text += '<input type="text" name="server_loops" value="type the loop ID">';
  //text += '<input type="number" name="server_loops" min="1" max="' + loopGame.nosl + '">';
  //text += '<select name="server_loops"><option value="1">1</option><option value="2">2</option><option value="3">3</option></select>';
  text += '<input type="button" value="Retrieve Loop" onclick="loopGame.proccesFormRetrieve(this.form);">';
  text += '</form>';
  document.getElementById('save_loop').innerHTML = text;
}

loopGame.createFormLoad = function() {
  var text = '<form id="form_load">';
  text += '<input type="button" value="Export loop" onclick="loopGame.exportLoop();">';
  text += '<input type="textarea" name="loop_settings">';
  text += '<input type="button" value="Import Loop" onclick="loopGame.proccesLoadForm(this.form);">';
  text += '</form>';
  document.getElementById('load_loop').innerHTML = text;
}

loopGame.createFormCustomize = function() {
  var text = '<p><br/>Customize the loop (make changes and then click "Make new loop"):</p>';
  text += '<form id="form_new_loop">';
  text += '<table>';
  text += '<tr><td>Loop length (max 32):</td>';
  text += '<td><input type="number" name="loopLength" min="2" max="32" value="' + loopGame.loopLength + '"></td></tr>';//<input type="text" name="loopLength" value="' + loopGame.loopLength + '"> 
  text += '<tr><td>Notes (comma separated values 21-109, kick, snare, hihat, tom1, tom2, tom3):</td>';
  text += '<td><input id="notes" type="text" name="notes" value="'
  text += loopGame.notes.toString();
  text += '" onclick="loopGame.ModDialNotes();"></td></tr>';
  text += '<tr><td>Tempo:</td>';
  text += '<td><input type="range" name="tempo" min="40" max="200" value="80" onchange="loopGame.updateTempo(this.value);">';
  text += '<span id="tempoValue">80</span></td></tr>';
  text += '</table>';
  text += '<input type="button" value="Make new loop" onclick="loopGame.processNewForm(this.form);">';
  text += '</form>';
  document.getElementById('customize').innerHTML = text;
}

loopGame.setNotesURL = function() {
  for (var i = 0; i < loopGame.notes.length; i++) {
    switch (loopGame.notes[i]) {
      case 'kick': 
        var url = loopGame.soundsPath + '/drum_kit/kick.wav';
        break;
      case 'hihat':
        var url = loopGame.soundsPath + '/drum_kit/hihat.wav';
        break;
      case 'snare':
        var url = loopGame.soundsPath + '/drum_kit/snare.wav';
        break;
      case 'tom1':
        var url = loopGame.soundsPath + '/drum_kit/tom1.wav';
        break;
      case 'tom2':
        var url = loopGame.soundsPath + '/drum_kit/tom2.wav';
        break;
      case 'tom3':
        var url = loopGame.soundsPath + '/drum_kit/tom3.wav';
        break;
      default:
        var url = loopGame.soundsPath + '/notes_piano_mp3/p' + loopGame.notes[i] + '.mp3';
        break;
    }
    loopGame.notesURL[i] = url;
  }
}

loopGame.setPattern = function(pattern) {
  if (arguments.length > 0) {
    loopGame.pattern = pattern;
  }
  else {
    loopGame.pattern = [];
    for (var i = 0; i < loopGame.notes.length; i++) {
      loopGame.pattern[i] = [];
      for (var j = 0; j < loopGame.loopLength; j++) {
        loopGame.pattern[i][j] = 0;
      }
    }
  }
}

loopGame.init = function() {
  loopGame.setNotesURL();
  bufferLoader = new BufferLoader(
    loopGame.context,
    loopGame.notesURL,
    loopGame.finishedLoading
    );
  bufferLoader.load();
}

loopGame.finishedLoading = function(bufferList) {
  for (var i = 0; i < loopGame.notes.length; i++) {
    loopGame.BUFFERS[i] = bufferList[i];
  }
  loopGame.showReady();
  loopGame.createFormGame();
  loopGame.startLoop();
  loopGame.createFormCustomize();
  loopGame.createFormLoad();
  loopGame.createFormSaveRetrieve();
}

loopGame.createFormGame = function() {
  var text = '';
  text += '<table><form>';
  for (var i = 0; i < loopGame.notes.length; i++) {
    text += '<tr>';
    for (var j = 0; j < loopGame.loopLength; j++) {
      text += '<td class="beat-' + j + '" style="background:' + loopGame.beatColor + ';">';
      text += '<input type="checkbox"';
      text += (loopGame.pattern[i][j]) ? ' checked="checked"' : '';
      text += ' onchange="loopGame.updateBeat(' + i + ',' + j + ',this.checked)">';
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
  loopGame.unmarkPreviousBeat();
  loopGame.markCurrentBeat();
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
    loopGame.unmarkPreviousBeat();
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
  loopGame.pattern[row][beat] = (value) ? 1 : 0;
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

loopGame.markCurrentBeat = function() {
  jQuery('.beat-' + loopGame.currentBeat).css('background-color', loopGame.currentBeatColor);
}

loopGame.unmarkPreviousBeat = function() {
  var previous = (loopGame.currentBeat) ? loopGame.currentBeat - 1 : loopGame.loopLength - 1;
  jQuery('.beat-' + (previous)).css('background-color', loopGame.beatColor);
}
