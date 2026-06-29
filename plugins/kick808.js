// plugins/kick808.js
import { registry } from '../main.js'; // или используйте window.CYBER_DAW.registry

export default {
  id: 'drum.kick808',
  name: '🥁 808 Kick',
  category: 'drum',
  version: '1.0.0',
  author: '@cyberdaw',
  
  params: [
    { id: 'pitch', type: 'knob', min: 30, max: 200, default: 50, 
      label: 'Pitch', unit: 'Hz', group: 'Oscillator', color: '#ff0055' },
    { id: 'pitchDecay', type: 'knob', min: 10, max: 500, default: 80, 
      label: 'P.Decay', unit: 'ms', group: 'Oscillator' },
    { id: 'ampDecay', type: 'knob', min: 100, max: 2000, default: 600, 
      label: 'A.Decay', unit: 'ms', group: 'Oscillator' },
    { id: 'click', type: 'knob', min: 0, max: 100, default: 30, 
      label: 'Click', unit: '%', group: 'Tone', color: '#00f3ff' },
    { id: 'drive', type: 'knob', min: 0, max: 100, default: 20, 
      label: 'Drive', unit: '%', group: 'Tone', color: '#ff9900' },
    { id: 'lpf', type: 'knob', min: 500, max: 10000, default: 4000, 
      label: 'LPF', unit: 'Hz', taper: 'log', group: 'Tone' }
  ],
  
  presets: [
    { name: 'Deep 808', params: { pitch: 40, pitchDecay: 120, ampDecay: 900, click: 10, drive: 30, lpf: 3000 }},
    { name: 'Punchy', params: { pitch: 60, pitchDecay: 50, ampDecay: 300, click: 60, drive: 15, lpf: 5000 }},
    { name: 'Long Sub', params: { pitch: 35, pitchDecay: 200, ampDecay: 1500, click: 5, drive: 40, lpf: 2000 }}
  ],
  
  init(ctx) { this.ctx = ctx; },
  dispose() {},
  
  trigger(time, on, p, out) {
    if (!on) return;
    const ctx = this.ctx;
    
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    const pitch = p.pitch || 50;
    const pitchDecay = (p.pitchDecay || 80) / 1000;
    osc.frequency.setValueAtTime(pitch * 4, time);
    osc.frequency.exponentialRampToValueAtTime(pitch, time + pitchDecay);
    
    const clickGain = ctx.createGain();
    if ((p.click || 0) > 0) {
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.02, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length * 0.2));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      clickGain.gain.setValueAtTime((p.click || 0) / 100, time);
      clickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
      noise.connect(clickGain);
      clickGain.connect(out);
      noise.start(time); noise.stop(time + 0.03);
    }
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(p.lpf || 4000, time);
    filter.Q.setValueAtTime(0.7, time);
    
    const ampGain = ctx.createGain();
    const ampDecay = (p.ampDecay || 600) / 1000;
    ampGain.gain.setValueAtTime(1, time);
    ampGain.gain.exponentialRampToValueAtTime(0.001, time + ampDecay);
    
    osc.connect(filter);
    
    let lastNode = filter;
    if ((p.drive || 0) > 0) {
      const shaper = ctx.createWaveShaper();
      const amt = p.drive / 20;
      const curve = new Float32Array(1024);
      for (let i = 0; i < 1024; i++) {
        const x = (i / 1024) * 2 - 1;
        curve[i] = Math.tanh(x * (1 + amt));
      }
      shaper.curve = curve;
      filter.connect(shaper);
      lastNode = shaper;
    }
    
    lastNode.connect(ampGain);
    ampGain.connect(out);
    
    osc.start(time);
    osc.stop(time + ampDecay + 0.05);
  }
};

window.CYBER_DAW.registry.register(window.CYBER_DAW.plugins.kick808);