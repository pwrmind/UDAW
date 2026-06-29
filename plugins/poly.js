// plugins/poly.js
const plugin = {
  id: 'synth.poly',
  name: '🎛️ Poly Chords',
  category: 'synth',
  
  params: [
    { id: 'detune', type: 'knob', min: 0, max: 30, default: 8, 
      label: 'Detune', unit: 'ct', group: 'Oscillator', color: '#ff0055' },
    { id: 'attack', type: 'knob', min: 10, max: 1000, default: 50, 
      label: 'Attack', unit: 'ms', group: 'Envelope' },
    { id: 'release', type: 'knob', min: 100, max: 2000, default: 800, 
      label: 'Release', unit: 'ms', group: 'Envelope' }
  ],
  
  presets: [
    { name: 'Soft Pad', params: { detune: 5, attack: 200, release: 1000 }},
    { name: 'Pluck', params: { detune: 10, attack: 10, release: 400 }},
    { name: 'Wide', params: { detune: 20, attack: 100, release: 1200 }}
  ],
  
  chords: {
    'OFF': [],
    'Min7': [130.81, 155.56, 196.00, 233.08],
    'Maj7': [130.81, 164.81, 196.00, 246.94],
    'Sus4': [146.83, 196.00, 220.00, 293.66],
    'Dim':  [116.54, 138.59, 164.81, 233.08]
  },
  
  init(ctx) { this.ctx = ctx; },
  dispose() {},
  
  trigger(time, chordName, p, out) {
    const freqs = this.chords[chordName];
    if (!freqs || freqs.length === 0) return;
    const ctx = this.ctx;
    
    const mainGain = ctx.createGain();
    const attack = (p.attack || 50) / 1000;
    const release = (p.release || 800) / 1000;
    mainGain.gain.setValueAtTime(0, time);
    mainGain.gain.linearRampToValueAtTime(0.25, time + attack);
    mainGain.gain.exponentialRampToValueAtTime(0.001, time + attack + release);
    
    const detune = p.detune || 8;
    freqs.forEach(f => {
      const o = ctx.createOscillator();
      o.type = 'triangle';
      o.frequency.setValueAtTime(f, time);
      o.detune.setValueAtTime(Math.random() * detune * 2 - detune, time);
      o.connect(mainGain);
      o.start(time);
      o.stop(time + attack + release + 0.1);
    });
    
    mainGain.connect(out);
  }
};

window.CYBER_DAW.registry.register(plugin);
export default plugin;