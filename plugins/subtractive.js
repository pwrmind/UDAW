// plugins/subtractive.js
export default {
  id: 'synth.subtractive',
  name: '🎹 Subtractive Lead',
  category: 'synth',
  
  params: [
    { id: 'wave', type: 'wave', 
      options: [
        {value:'sawtooth', label:'Saw'},
        {value:'square', label:'Square'},
        {value:'triangle', label:'Tri'},
        {value:'sine', label:'Sine'}
      ],
      default: 'sawtooth', label: 'Osc', group: 'Oscillator' },
    { id: 'detune', type: 'knob', min: -100, max: 100, default: 0, 
      label: 'Detune', unit: 'ct', group: 'Oscillator', color: '#ff0055' },
    { id: 'filterType', type: 'select',
      options: [
        {value:'lowpass', label:'LP'},
        {value:'highpass', label:'HP'},
        {value:'bandpass', label:'BP'}
      ],
      default: 'lowpass', label: 'Type', group: 'Filter' },
    { id: 'cutoff', type: 'knob', min: 80, max: 12000, default: 2500, 
      label: 'Cutoff', unit: 'Hz', taper: 'log', group: 'Filter', color: '#39ff14' },
    { id: 'resonance', type: 'knob', min: 0.1, max: 25, default: 6, 
      label: 'Reso', group: 'Filter', color: '#39ff14' },
    { id: 'envMod', type: 'knob', min: -100, max: 100, default: 50, 
      label: 'Env→VCF', group: 'Filter', color: '#39ff14' },
    { id: 'env', type: 'envelope', 
      default: { a: 10, d: 200, s: 0.7, r: 300 },
      label: 'VCA', group: 'Envelope' },
    { id: 'fEnv', type: 'envelope',
      default: { a: 5, d: 300, s: 0.3, r: 400 },
      label: 'VCF', group: 'Envelope' },
    { id: 'drive', type: 'knob', min: 0, max: 100, default: 0, 
      label: 'Drive', unit: '%', group: 'FX', color: '#ff9900' }
  ],
  
  presets: [
    { name: 'Init', params: {
      wave:'sawtooth', detune:0, filterType:'lowpass',
      cutoff:2500, resonance:6, envMod:50, drive:0,
      env:{a:10,d:200,s:0.7,r:300}, fEnv:{a:5,d:300,s:0.3,r:400}
    }},
    { name: 'Pluck Bass', params: {
      wave:'sawtooth', cutoff:800, resonance:8, envMod:80,
      env:{a:1,d:400,s:0,r:100}, fEnv:{a:1,d:200,s:0,r:200}
    }},
    { name: 'Acid Lead', params: {
      wave:'square', cutoff:600, resonance:18, envMod:90, drive:30,
      env:{a:5,d:150,s:0.8,r:150}, fEnv:{a:1,d:100,s:0.2,r:200}
    }},
    { name: 'Soft Pad', params: {
      wave:'triangle', detune:15, cutoff:1800, resonance:2,
      env:{a:400,d:500,s:0.8,r:800}, fEnv:{a:400,d:500,s:0.8,r:800}
    }}
  ],
  
  init(ctx) { this.ctx = ctx; },
  dispose() {},
  
  trigger(time, freq, p, out) {
    if (!freq) return;
    const ctx = this.ctx;
    
    const osc = ctx.createOscillator();
    osc.type = p.wave || 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);
    if (p.detune) osc.detune.setValueAtTime(p.detune, time);
    
    let osc2 = null;
    if (Math.abs(p.detune || 0) > 5) {
      osc2 = ctx.createOscillator();
      osc2.type = p.wave || 'sawtooth';
      osc2.frequency.setValueAtTime(freq, time);
      osc2.detune.setValueAtTime(-(p.detune || 0), time);
    }
    
    const filter = ctx.createBiquadFilter();
    filter.type = p.filterType || 'lowpass';
    filter.Q.setValueAtTime(p.resonance || 1, time);
    
    const fEnv = p.fEnv || {a:5,d:300,s:0.3,r:400};
    const baseCutoff = p.cutoff || 2500;
    const envAmount = (p.envMod || 0) / 100;
    const peakCutoff = Math.min(20000, baseCutoff * Math.pow(10, envAmount));
    
    const a = fEnv.a / 1000, d = fEnv.d / 1000;
    filter.frequency.setValueAtTime(baseCutoff, time);
    filter.frequency.linearRampToValueAtTime(peakCutoff, time + a);
    filter.frequency.exponentialRampToValueAtTime(
      Math.max(20, baseCutoff * (1 + envAmount * (fEnv.s - 1))), 
      time + a + d
    );
    
    const vca = ctx.createGain();
    const aEnv = p.env || {a:10,d:200,s:0.7,r:300};
    const aa = aEnv.a / 1000, ad = aEnv.d / 1000, ar = aEnv.r / 1000;
    vca.gain.setValueAtTime(0, time);
    vca.gain.linearRampToValueAtTime(0.5, time + aa);
    vca.gain.linearRampToValueAtTime(0.5 * aEnv.s, time + aa + ad);
    
    let lastNode = filter;
    if (p.drive > 0) {
      const shaper = ctx.createWaveShaper();
      const amount = p.drive;
      const curve = new Float32Array(1024);
      for (let i = 0; i < 1024; i++) {
        const x = (i / 1024) * 2 - 1;
        curve[i] = Math.tanh(x * (1 + amount / 20));
      }
      shaper.curve = curve;
      filter.connect(shaper);
      lastNode = shaper;
    }
    
    osc.connect(filter);
    if (osc2) osc2.connect(filter);
    lastNode.connect(vca);
    vca.connect(out);
    
    osc.start(time);
    if (osc2) osc2.start(time);
    const stopTime = time + aa + ad + ar + 0.1;
    vca.gain.setValueAtTime(0.5 * aEnv.s, time + aa + ad);
    vca.gain.linearRampToValueAtTime(0.0001, stopTime);
    osc.stop(stopTime + 0.05);
    if (osc2) osc2.stop(stopTime + 0.05);
  }
};

window.CYBER_DAW.registry.register(window.CYBER_DAW.plugins.subtractive);