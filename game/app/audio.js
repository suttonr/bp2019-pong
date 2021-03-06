let audioCtx;
let oscillator;

window.onload = function() {
  audioCtx = new AudioContext();
  audioCtx.suspend().then(function() {
    let alert = document.getElementById('alert');
    alert.textContent = 'click playfield to play sound and remove this alert';
  });
};

function PlayOscillator(hz, duration) {
  oscillator = audioCtx.createOscillator();
  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(hz, audioCtx.currentTime); // value in hertz
  oscillator.connect(audioCtx.destination);

  oscillator.start(audioCtx.currentTime);
  oscillator.stop(audioCtx.currentTime + duration);
}

function ClickToEnable(element) {
  element.addEventListener('click', function() {
    const alert = document.getElementById('alert');
    if (alert.hidden) return;
    alert.hidden = true;
    audioCtx.resume().then(() => {
      console.log('User enabled Audio by clicking canvas');
    });
  });
}

function Paddle() {
  PlayOscillator(459, 0.0196);
}

function Point() {
  PlayOscillator(290, 0.257);
}

function Bounce() {
  PlayOscillator(226, 0.016);
}

module.exports = {
  ClickToEnable,
  Point,
  Paddle,
  Bounce
};
