window.onload = function() {
  notePicker.init();
};

var notePicker = {
  notes: window.dialogArguments['notes'],
  allNotes: window.dialogArguments['allNotes'],
  //pianoContainer: document.getElementById('keyboard'),
};

notePicker.finish = function() {
  window.returnValue = this.notes;
  window.close();
};

notePicker.cancel = function() {
  window.close();
};

notePicker.init = function() {
  this.updateNotes();
};

notePicker.indexOf = function(se, arr) {
  var i = arr.length;
  if (i === 0) {
    return -1;
  }
  while (i--) {
    if (arr[i] == se) {
      return i;
    }
  }
  return -1;
};

notePicker.managePianoClick = function(event) {
  var note = event.target.note;
  var compare = function(a, b) {
    return a - b;
  }
  var index = notePicker.indexOf(note, notePicker.notes);
  if (index == -1) {
    notePicker.notes.push(note);
  }
  else {
    notePicker.notes.splice(index, 1);
  }
  notePicker.notes.sort(compare);
  notePicker.updateNotes();
}

notePicker.drawPiano = function() {
  var startNote = this.allNotes[0];
  var endNote = this.allNotes[this.allNotes.length - 1];
  var keyboardElem = document.getElementById('keyboard');
  piano.drawSVGpiano(startNote, endNote, keyboardElem, this.managePianoClick);
  this.colorSelectedNotes();
}

notePicker.colorSelectedNotes = function() {
  for (var i = 0; i < this.notes.length; i++) {
    var key = piano.getKeyByNote(this.notes[i]);
    key.setAttribute('fill', 'red');
  }
}

notePicker.updateNotes = function() {
  document.getElementById('notes').innerHTML = 'Selected notes: ' + this.notes.toString();
  this.drawPiano();
}
