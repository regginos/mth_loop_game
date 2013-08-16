window.onload = function() {
  notePicker.init();
};

var notePicker = {
  notes: window.dialogArguments['notes'],
  allNotes: window.dialogArguments['allNotes'],
  //pianoContainer: document.getElementById('keyboard'),
};

notePicker.finish = function() {
  window.returnValue = this.notes.toString();
  window.close();
};

notePicker.cancel = function() {
  window.close();
};

notePicker.init = function() {
  this.updateNotes();
};

notePicker.managePianoClick = function(event) {
  var note = event.target.note;
  var compare = function(a,b){
    return a - b;
  }
  var index = notePicker.notes.indexOf(note);
  if (index === -1) {
    notePicker.notes.push(note);
    notePicker.notes.sort(compare);
  }
  if (index !== -1) {
    notePicker.notes.splice(index, 1);
    notePicker.notes.sort(compare);
  }
  notePicker.updateNotes();
}

notePicker.drawPiano = function() {
  var keyboardElem = document.getElementById('keyboard');
  piano.drawSVGpiano(48, 84, keyboardElem, this.managePianoClick);
}

notePicker.colorSelected = function() {
  for (var i = 0; i < this.notes.length; i++) {
    var key = document.getElementById('piano-' + this.notes[i]);
    key.setAttribute('style', 'fill:red;stroke:black;'); // check this, when update the piano!
  }
}

notePicker.updateNotes = function() {
  document.getElementById('notes').innerHTML = 'Selected notes: ' + this.notes.toString();
  notePicker.drawPiano();
  this.colorSelected();
}
