// plugins/hihat.js
export default {
  id: 'drum.hihat',
  name: '🔔 HiHat',
  category: 'drum',
  
  params: [
    { id: 'decay', type: 'knob', min: 20, max: 300, default: 80, 
      label: 'Decay', unit: 'ms', group: 'Envelope' },
    { id: 'tone', type: 'knob', min: 3000, max: 12000, default: 7000, 
      label: 'Tone', unit: 'Hz', taper: 'log', group: 'Tone', color: '#00f3ff' },
    { id: 'metallic', type: 'knob', min: 0, max: 100, default: 50, 
      label: 'Metal', unit: '%', group: 'Tone', color: '#ff9900' }
  ],
  
  presets: [
    { name: 'Closed', params: { decay: 50, tone: 8000, metallic: 60 }},
    { name: 'Open', params: { decay: 200, tone: 6000, metallic: 40 }},
    { name: 'Bright', params: { decay: 80, tone: 10000, metallic: 80 }}
  ],
  
  init(ctx) { this.ctx = ctx; },
  dispose() {},
  
  trigger(time, on, p, out) {
    if (!on) return;
    const ctx = this.ctx;
    const decay = (p.decay || 80) / 1000;
    
    const buf = ctx.createBuffer(1, ctx.sampleRate * decay, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(p.tone || 7000, time);
    filter.Q.setValueAtTime(1 + (p.metallic || 50) / 20, time);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + decay);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(out);
    noise.start(time);
    noise.stop(time + decay);
  }
};

window.CYBER_DAW.registry.register(window.CYBER_DAW.plugins.hihat);