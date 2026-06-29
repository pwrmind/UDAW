// plugins/noisesweep.js
const plugin = {
  id: 'fx.noisesweep',
  name: '🌪️ Noise Sweep',
  category: 'fx',
  
  params: [
    { id: 'startFreq', type: 'knob', min: 100, max: 1000, default: 200, 
      label: 'Start', unit: 'Hz', taper: 'log', group: 'Filter', color: '#00f3ff' },
    { id: 'endFreq', type: 'knob', min: 2000, max: 12000, default: 7000, 
      label: 'End', unit: 'Hz', taper: 'log', group: 'Filter', color: '#ff0055' },
    { id: 'duration', type: 'knob', min: 0.3, max: 2, default: 1, 
      label: 'Duration', unit: 's', group: 'Envelope' },
    { id: 'resonance', type: 'knob', min: 1, max: 20, default: 5, 
      label: 'Reso', group: 'Filter', color: '#ff9900' }
  ],
  
  presets: [
    { name: 'Riser', params: { startFreq: 200, endFreq: 8000, duration: 1.5, resonance: 8 }},
    { name: 'Short', params: { startFreq: 500, endFreq: 5000, duration: 0.5, resonance: 5 }},
    { name: 'Wide', params: { startFreq: 100, endFreq: 10000, duration: 2, resonance: 12 }}
  ],
  
  init(ctx) { this.ctx = ctx; },
  dispose() {},
  
  trigger(time, on, p, out) {
    if (!on) return;
    const ctx = this.ctx;
    const duration = p.duration || 1;
    
    const buf = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(p.resonance || 5, time);
    filter.frequency.setValueAtTime(p.startFreq || 200, time);
    filter.frequency.exponentialRampToValueAtTime(p.endFreq || 7000, time + duration * 0.9);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.linearRampToValueAtTime(0.001, time + duration);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(out);
    noise.start(time);
    noise.stop(time + duration);
  }
};

window.CYBER_DAW.registry.register(plugin);
export default plugin;