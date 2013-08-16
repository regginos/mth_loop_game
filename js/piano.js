/*
Code by regginos
*/

var piano = {};

piano.drawSVGpiano = function (startNote, endNote, elem, callback, scale) {
  this.startNote = startNote;
  this.endNote = endNote;
  this.containerElement = elem;
  this.callback = (arguments.length > 3) ? callback : false;
  this.scale = (arguments.length > 4) ? scale : 1;
  this.draw();
}

piano.draw = function() {
  this.createSVG();
  this.containerElement.innerHTML = this.svg;
  if (this.callback) {
    this.addEvents(this.callback);
  }
}

piano.createSVG = function() {
  var svg, whiteSVG, blackSVG, t, i,
      noteList = {white: [], black: []},
      s = this.decodeNote(this.startNote),
      e = this.decodeNote(this.endNote);
  for (i = this.startNote; i <= this.endNote; i++) {
    t = this.decodeNote(i);
    if (t.type == 'white') {
      whiteSVG += this.drawPianoKey(i, t.x - s.x, 0, t.type);
      noteList.white.push(i);
    }
    else if (t.type == 'black') {
      blackSVG += this.drawPianoKey(i, t.x - s.x, 0, t.type);
      noteList.black.push(i);
    }
  }
  svg = '<svg width="';
  svg += (e.x + 24) * this.scale;
  svg += '" height="' + (125 * this.scale) + '">';
  svg += '<g';
  svg += ' transform="scale(' + this.scale + ')"';
  svg += '>';
  svg += whiteSVG + blackSVG;
  svg += '</g></svg>';
  this.notelist = noteList.white.concat(noteList.black);
  this.svg = svg;
}

piano.addEvents = function(callback) {
  if (!callback.eventType) {
    callback.eventType = 'click';
  }
  var keys = this.containerElement.getElementsByTagName('rect')
  for (var i = 0; i < keys.length; i++) {
    keys[i].note = this.notelist[i];
    keys[i].addEventListener(callback.eventType, callback, false);
  }
}

piano.drawPianoKey = function (note, x, y, type) {
  var svg = '<rect ';
  svg += 'fill="' + type + '" ';
  svg += 'stroke="black" ';
  svg += 'x="' + x + '" y="' + y + '" ';
  svg += 'width="';
  svg += (type ==  'white') ? '23': '13'; 
  svg += '" height="';
  svg += (type ==  'white') ? '120': '80'; 
  svg += '" />';
  return svg;
}

piano.getKeyByNote = function (note) {
  var keys = this.containerElement.getElementsByTagName('rect')
  for (var i = 0; i < keys.length; i++) {
    if (keys[i].note == note) {
      return keys[i];
    }
  }
}

piano.decodeNote = function (note) {
  var x, type, name;
  var octave = Math.floor(note/12);
  var n = note % 12;
  switch (n) {
    case 0: x = 0; type = 'white'; name = 'C'; break;
    case 1: x = 14.3333; type = 'black'; name = 'C#/Db'; break;
    case 2: x = 23; type = 'white'; name = 'D'; break;
    case 3: x = 41.6666; type = 'black'; name = 'D#/Eb'; break;
    case 4: x = 46; type = 'white'; name = 'E'; break;
    case 5: x = 69; type = 'white'; name = 'F'; break;
    case 6: x = 82.25; type = 'black'; name = 'F#/Gb'; break;
    case 7: x = 92; type = 'white'; name = 'G'; break;
    case 8: x = 108.25; type = 'black'; name = 'G#/Ab'; break;
    case 9: x = 115; type = 'white'; name = 'A'; break;
    case 10: x = 134.75; type = 'black'; name = 'A#/Bb'; break;
    case 11: x = 138; type = 'white'; name = 'B'; break;
  }
  return {
    octave: octave,
    name: name,
    x: octave * 23 * 7 + x,
    type: type,
  };
}

if (typeof Object.create !== 'function') {
  Object.create = function(o) {
    var F = function(){};
    F.prototype = o;
    return new F();
  }
}
