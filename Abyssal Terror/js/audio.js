const _sharedAudioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playHeartbeat() {
    const audioCtx = _sharedAudioCtx;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(60, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
}

function triggerJumpscare() {
    if (gameOver) return;
    gameOver = true;
    jumpEl.style.display = 'flex';
    jumpEl.classList.add('flash');
    
    const audioCtx = _sharedAudioCtx;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    // High pitched screech
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    // Low rumble noise
    const noise = audioCtx.createOscillator();
    const noiseGain = audioCtx.createGain();
    noise.type = 'square';
    noise.frequency.setValueAtTime(40, audioCtx.currentTime);
    noiseGain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1);
    noise.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);

    osc.start();
    noise.start();
    osc.stop(audioCtx.currentTime + 1);
    noise.stop(audioCtx.currentTime + 1);

    document.body.style.animation = 'flash-red 0.05s infinite';

    setTimeout(() => {
        location.reload();
    }, 2500);
}
