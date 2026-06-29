// plugins/tom.js
export default {
  id: 'drum.tom',
  name: '🪘 Tom',
  category: 'drum',
  
  params: [
    { id: 'pitch', type: 'knob', min: 60, max: 200, default: 120, 
      label: 'Pitch', unit: 'Hz', group: 'Oscillator', color: '#ff0055' },
    { id: 'decay', type: 'knob', min: 100, max: 800, default: 400, 
      label: 'Decay', unit: 'ms', group: 'Envelope' },
    { id: 'bend', type: 'knob', min: 0, max: 100, default: 50, 
      label: 'Bend', unit: '%', group: 'Oscillator', color: '#00f3ff' }
  ],
  
  presets: [
    { name: 'Low Tom', params: { pitch: 80, decay: 500, bend: 60 }},
    { name: 'High Tom', params: { pitch: 160, decay: 300, bend: 40 }},
    { name: 'Floor Tom', params: { pitch: 70, decay: 600, bend: 70 }}
  ],
  
  init(ctx) { this.ctx = ctx; },
  dispose() {},
  
  trigger(time, on, p, out) {
    if (!on) return;
    const ctx = this.ctx;
    const decay = (p.decay || 400) / 1000;
    const pitch = p.pitch || 120;
    const bend = (p.bend || 50) / 100;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch * (1 + bend), time);
    osc.frequency.exponentialRampToValueAtTime(pitch, time + decay * 0.3);
    gain.gain.setValueAtTime(0.8, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + decay);
    
    osc.connect(gain);
    gain.connect(out);
    osc.start(time);
    osc.stop(time + decay);
  }
};

window.CYBER_DAW.registry.register(window.CYBER_DAW.plugins.tom);