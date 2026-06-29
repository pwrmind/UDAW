// plugins/chiptune.js
export default {
  id: 'synth.chiptune',
  name: '👾 Chiptune',
  category: 'synth',
  
  params: [
    { id: 'speed', type: 'knob', min: 0.05, max: 0.3, default: 0.1, 
      label: 'Speed', unit: 's', group: 'Oscillator', color: '#39ff14' },
    { id: 'depth', type: 'knob', min: 0.5, max: 4, default: 2, 
      label: 'Depth', group: 'Oscillator', color: '#ff0055' }
  ],
  
  presets: [
    { name: 'Fast', params: { speed: 0.05, depth: 3 }},
    { name: 'Slow', params: { speed: 0.2, depth: 1.5 }},
    { name: 'Classic', params: { speed: 0.1, depth: 2 }}
  ],
  
  init(ctx) { this.ctx = ctx; },
  dispose() {},
  
  trigger(time, freq, p, out) {
    if (!freq) return;
    const ctx = this.ctx;
    const speed = p.speed || 0.1;
    const depth = p.depth || 2;
    
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'square';
    o.frequency.setValueAtTime(freq * depth, time);
    o.frequency.linearRampToValueAtTime(freq / depth, time + speed);
    g.gain.setValueAtTime(0.2, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + speed);
    
    o.connect(g);
    g.connect(out);
    o.start(time);
    o.stop(time + speed);
  }
};

window.CYBER_DAW.registry.register(window.CYBER_DAW.plugins.chiptune);