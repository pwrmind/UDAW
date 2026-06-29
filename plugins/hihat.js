// plugins/snare.js
const plugin = {
  id: 'drum.snare',
  name: '🥁 Snare',
  category: 'drum',
  
  params: [
    { id: 'decay', type: 'knob', min: 50, max: 500, default: 200, 
      label: 'Decay', unit: 'ms', group: 'Envelope' },
    { id: 'tone', type: 'knob', min: 500, max: 5000, default: 1500, 
      label: 'Tone', unit: 'Hz', taper: 'log', group: 'Tone', color: '#00f3ff' },
    { id: 'snappy', type: 'knob', min: 0, max: 100, default: 70, 
      label: 'Snappy', unit: '%', group: 'Tone', color: '#ff0055' },
    { id: 'body', type: 'knob', min: 0, max: 100, default: 50, 
      label: 'Body', unit: '%', group: 'Tone' }
  ],
  
  presets: [
    { name: 'Tight', params: { decay: 120, tone: 2000, snappy: 80, body: 40 }},
    { name: 'Fat', params: { decay: 300, tone: 1200, snappy: 60, body: 70 }},
    { name: 'Electronic', params: { decay: 150, tone: 3000, snappy: 90, body: 30 }}
  ],
  
  init(ctx) { this.ctx = ctx; },
  dispose() {},
  
  trigger(time, on, p, out) {
    if (!on) return;
    const ctx = this.ctx;
    const decay = (p.decay || 200) / 1000;
    
    if ((p.body || 0) > 0) {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, time);
      osc.frequency.exponentialRampToValueAtTime(100, time + decay * 0.5);
      oscGain.gain.setValueAtTime((p.body || 50) / 100 * 0.5, time);
      oscGain.gain.exponentialRampToValueAtTime(0.001, time + decay);
      osc.connect(oscGain);
      oscGain.connect(out);
      osc.start(time);
      osc.stop(time + decay);
    }
    
    if ((p.snappy || 0) > 0) {
      const buf = ctx.createBuffer(1, ctx.sampleRate * decay, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(p.tone || 1500, time);
      
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime((p.snappy || 70) / 100 * 0.7, time);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, time + decay);
      
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(out);
      noise.start(time);
      noise.stop(time + decay);
    }
  }
};

window.CYBER_DAW.registry.register(plugin);
export default plugin;