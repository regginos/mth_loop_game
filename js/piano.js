var piano = {};

/**
  Creates a keyboard where key widths are
  accurately in position. 

  See http://www.mathpages.com/home/kmath043.htm
  for the math.

  This keyboard has following properties (x=octave width).
  1. All white keys have equal width in front (W=x/7).
  2. All black keys have equal width (B=x/12).
  3. The narrow part of white keys C, D and E is W - B*2/3
  4. The narrow part of white keys F, G, A, and B is W - B*3/4
 */
piano.drawSVGpiano = function (startNote, endNote, elem, callback) {
  this.startNote = startNote;
  this.endNote = endNote;
  this.containerElement = elem;
  var svg = '',
      whiteSVG = '',
      blackSVG = '',
      s = this.decodeNote(this.startNote),
      e = this.decodeNote(this.endNote),
      t, i;
  for (i = this.startNote; i <= this.endNote; i++) {
    t = this.decodeNote(i);
    if (t.type == 'white') {
      whiteSVG += this.drawPianoKey(i, t.x - s.x, 0, t.type);
    }
    else if (t.type == 'black') {
      blackSVG += this.drawPianoKey(i, t.x - s.x, 0, t.type);
    }
  }
  svg += '<svg width="' + (e.x + 24) + '" height="125">' + whiteSVG + blackSVG + '</svg>';
  this.containerElement .innerHTML = svg;
  if (callback) {
    this.addEvents(callback);
    //this.callback = function(note, el) {
    //  callback(note, el);
    //}
  }
}

piano.addEvents = function(callback) {
  for (i = this.startNote; i <= this.endNote; i++) {
    var el = document.getElementById('piano-' + i);
    el.note = i;
    el.addEventListener('click', callback, false);
  }
}

piano.drawPianoKey = function (note, x, y, type) {
  var svg = '<rect id="piano-' + note + '" ';
  svg += 'style="fill:' + type + ';stroke:black" ';
  svg += 'x="' + x + '" y="' + y + '" ';
  svg += 'width="';
  svg += (type ==  'white') ? '23': '13'; 
  svg += '" height="';
  svg += (type ==  'white') ? '120': '80'; 
  svg += '" />';
  return svg;
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
