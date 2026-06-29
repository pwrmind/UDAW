// plugins/fmbell.js
const plugin = {
  id: 'synth.fmbell',
  name: '🔔 FM Bell',
  category: 'synth',
  
  params: [
    { id: 'ratio', type: 'knob', min: 0.1, max: 8, default: 1.414, 
      label: 'Ratio', taper: 'log', group: 'Modulator', color: '#ff0055' },
    { id: 'depth', type: 'knob', min: 0, max: 3000, default: 800, 
      label: 'Depth', group: 'Modulator', color: '#ff0055' },
    { id: 'dDecay', type: 'knob', min: 50, max: 2000, default: 300, 
      label: 'D.Decay', unit: 'ms', group: 'Modulator' },
    { id: 'cWave', type: 'select',
      options: [{value:'sine',label:'Sine'},{value:'triangle',label:'Tri'}],
      default: 'sine', label: 'Carrier', group: 'Carrier' },
    { id: 'mWave', type: 'select',
      options: [{value:'sine',label:'Sine'},{value:'triangle',label:'Tri'}],
      default: 'sine', label: 'Mod', group: 'Carrier' },
    { id: 'env', type: 'envelope',
      default: {a:1,d:400,s:0,r:600},
      label: 'Amp', group: 'Envelope' }
  ],
  
  presets: [
    { name: 'Glass Bell', params: { ratio: 1.414, depth: 800, dDecay: 300, cWave:'sine', mWave:'sine', env:{a:1,d:400,s:0,r:600} }},
    { name: 'Metallic', params: { ratio: 3.5, depth: 1500, dDecay: 200, env:{a:1,d:200,s:0,r:400} }},
    { name: 'Marimba', params: { ratio: 4, depth: 400, dDecay: 100, env:{a:1,d:150,s:0,r:200} }},
    { name: 'E-Piano', params: { ratio: 1, depth: 600, dDecay: 800, env:{a:5,d:600,s:0.3,r:400} }}
  ],
  
  init(ctx) { this.ctx = ctx; },
  dispose() {},
  
  trigger(time, freq, p, out) {
    if (!freq) return;
    const ctx = this.ctx;
    
    const car = ctx.createOscillator();
    const mod = ctx.createOscillator();
    const modGain = ctx.createGain();
    const vca = ctx.createGain();
    
    car.type = p.cWave || 'sine';
    mod.type = p.mWave || 'sine';
    car.frequency.setValueAtTime(freq, time);
    mod.frequency.setValueAtTime(freq * (p.ratio || 1.414), time);
    
    const dDecay = (p.dDecay || 300) / 1000;
    modGain.gain.setValueAtTime(p.depth || 800, time);
    modGain.gain.exponentialRampToValueAtTime(0.01, time + dDecay);
    
    const env = p.env || {a:1,d:400,s:0,r:600};
    const a = env.a/1000, d = env.d/1000, r = env.r/1000;
    vca.gain.setValueAtTime(0, time);
    vca.gain.linearRampToValueAtTime(0.4, time + a);
    vca.gain.exponentialRampToValueAtTime(0.001, time + a + d + r);
    
    mod.connect(modGain);
    modGain.connect(car.frequency);
    car.connect(vca);
    vca.connect(out);
    
    const stop = time + a + d + r + 0.1;
    mod.start(time); car.start(time);
    mod.stop(stop); car.stop(stop);
  }
};

window.CYBER_DAW.registry.register(plugin);
export default plugin;