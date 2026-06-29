// plugins/subbass.js
export default {
  id: 'synth.subbass',
  name: '📉 Sub Bass',
  category: 'synth',
  
  params: [
    { id: 'octave', type: 'knob', min: 0.25, max: 1, default: 0.25, 
      label: 'Octave', group: 'Oscillator', color: '#ff0055' },
    { id: 'decay', type: 'knob', min: 100, max: 1000, default: 400, 
      label: 'Decay', unit: 'ms', group: 'Envelope' }
  ],
  
  presets: [
    { name: 'Deep Sub', params: { octave: 0.25, decay: 500 }},
    { name: 'Mid Bass', params: { octave: 0.5, decay: 300 }},
    { name: 'Short', params: { octave: 0.25, decay: 150 }}
  ],
  
  init(ctx) { this.ctx = ctx; },
  dispose() {},
  
  trigger(time, freq, p, out) {
    if (!freq) return;
    const ctx = this.ctx;
    const octave = p.octave || 0.25;
    const decay = (p.decay || 400) / 1000;
    
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(freq * octave, time);
    g.gain.setValueAtTime(0.6, time);
    g.gain.linearRampToValueAtTime(0.001, time + decay);
    
    o.connect(g);
    g.connect(out);
    o.start(time);
    o.stop(time + decay);
  }
};

window.CYBER_DAW.registry.register(window.CYBER_DAW.plugins.subbass);