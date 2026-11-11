# Compose les sons de la C204 à partir des packs Kenney (CC0) + bourdonnement 60 Hz synthétisé.
import numpy as np, subprocess, wave, os
SR = 48000; S = 'sci-fi-sounds/Audio/'; I = 'interface-sounds/Audio/'; M = 'impact-sounds/Audio/'
OUT = 'out'; os.makedirs(OUT, exist_ok=True)
def load(f):
    r = subprocess.run(['ffmpeg','-v','error','-i',f,'-ac','1','-ar',str(SR),'-f','f32le','-'],capture_output=True, check=True)
    return np.frombuffer(r.stdout, np.float32).astype(np.float64)
def sec(x): return int(round(x*SR))
def fade(a, i=0.005, o=0.01):
    a = a.copy(); ni, no = sec(i), sec(o)
    if ni: a[:ni] *= np.linspace(0,1,ni)
    if no: a[-no:] *= np.linspace(1,0,no)
    return a
def put(dst, src, t, g=1.0):
    i = sec(t); n = min(len(src), len(dst)-i); dst[i:i+n] += src[:n]*g
def put_wrap(dst, src, t, g=1.0):
    i = sec(t)
    for k, v in enumerate(src): pass
    idx = (np.arange(len(src)) + i) % len(dst); np.add.at(dst, idx, src*g)
def lowpass(a, fc):
    sp = np.fft.rfft(a); f = np.fft.rfftfreq(len(a), 1/SR); sp *= 1/np.sqrt(1+(f/fc)**4); return np.fft.irfft(sp, len(a))
def highpass(a, fc):
    sp = np.fft.rfft(a); f = np.fft.rfftfreq(len(a), 1/SR); sp *= 1/np.sqrt(1+(fc/np.maximum(f,1e-3))**4); return np.fft.irfft(sp, len(a))
def loopify(a, L, X):
    # boucle de L s : les X premières secondes sont fondues avec ce qui suit L -> raccord sans clic
    n, x = sec(L), sec(X); out = a[:n].copy(); w = np.sin(np.linspace(0, np.pi/2, x))**2
    out[:x] = a[:x]*w + a[n:n+x]*(1-w); return out
def varispeed(a, rate):  # rate: tableau de vitesses de lecture par échantillon de sortie
    pos = np.cumsum(rate); pos = pos[pos < len(a)-1]; return np.interp(pos, np.arange(len(a)), a)
def norm(a, peak): m = np.abs(a).max(); return a*(peak/m) if m else a
def save(name, a):
    a = np.clip(a, -1, 1); p = f'{OUT}/{name}.wav'
    with wave.open(p,'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((a*32767).astype('<i2').tobytes())
    print(name, f'{len(a)/SR:.3f}s')

# 1) ambiance : moteur grave Kenney + bourdonnement électrique 60 Hz (harmoniques, légère saturation), boucle 4,5 s
L = 4.5
eng = lowpass(load(S+'spaceEngineLow_004.ogg'), 700)
t = np.arange(sec(5.0))/SR
buzz = sum((1/k)*np.sin(2*np.pi*60*k*t + k) for k in range(1,8)); buzz = np.tanh(1.5*buzz)
buzz *= 1 + 0.08*np.sin(2*np.pi*(1/L)*2*t)  # légère vibration, période multiple de la boucle
mix = norm(eng[:len(t)],1)*0.75 + norm(lowpass(buzz,900),1)*0.35
save('amb_hum', norm(loopify(mix, L, 0.4), 0.7))

# 2) rotation des singularités : turbine circulaire, boucle 4 s
spin = highpass(load(S+'engineCircular_002.ogg'), 120)
save('spin_loop', norm(loopify(spin, 4.0, 0.5), 0.6))

# 3) pulsation du champ : 4 impulsions « force field » par boucle de 4 s, queues repliées (raccord parfait) + nappe grave
L = 4.0; fld = np.zeros(sec(L))
for k in range(4): put_wrap(fld, fade(load(S+f'forceField_00{k}.ogg'),0.002,0.05), k*1.0)
bed = lowpass(load(S+'spaceEngineLow_001.ogg'), 300); bed = loopify(bed, L, 0.5)
save('field_loop', norm(norm(fld,1) + 0.3*norm(bed,1), 0.6))

# 4) clic interrupteur / boutons
save('click', norm(fade(load(I+'switch_003.ogg'),0.001,0.03), 0.8))
# 5) tic du compte à rebours : tick + petit relais métallique
tk = np.zeros(sec(0.35)); put(tk, load(I+'tick_004.ogg'), 0); put(tk, load(M+'impactMetal_light_002.ogg'), 0.0, 0.35)
save('tick', norm(fade(tk,0.001,0.05), 0.8))
# 6) bip doux (visite, fiches)
save('beep_soft', norm(fade(load(I+'confirmation_001.ogg'),0.002,0.05), 0.45))
# 7) ouverture du couvercle : loquet, charnière, choc grave, montée en tension
lid = np.zeros(sec(2.6))
put(lid, load(M+'impactMetal_medium_001.ogg'), 0.0, 0.8)
put(lid, load(I+'switch_005.ogg'), 0.12, 0.6)
put(lid, load(S+'doorOpen_002.ogg'), 0.25, 0.9)
put(lid, load(S+'impactMetal_001.ogg'), 0.85, 0.9)
whine = load(S+'spaceEngineSmall_002.ogg')[:sec(1.6)]
whine = varispeed(np.tile(whine,2), np.linspace(0.5, 1.2, sec(1.6)))[:sec(1.6)]
whine *= np.linspace(0,1,len(whine))**2 * np.r_[np.ones(len(whine)-sec(0.3)), np.linspace(1,0,sec(0.3))]
put(lid, whine, 1.0, 0.5)
save('lid_open', norm(fade(lid,0.002,0.1), 0.85))
# 8) saut : décharge qui crépite (0–1,4 s), explosion grave + souffle (1,4–3,6 s)
J = np.zeros(sec(3.6))
crk = highpass(load(S+'computerNoise_003.ogg')[:sec(1.45)], 400); crk *= np.linspace(0.1,1,len(crk))**1.5
put(J, crk, 0.0, 0.6)
for k,tt in enumerate([0.3,0.7,1.0,1.2]): put(J, load(S+f'laserLarge_00{k}.ogg'), tt, 0.25+0.1*k)
put(J, load(S+'lowFrequency_explosion_000.ogg'), 1.35, 1.0)
ws = load(S+'thrusterFire_001.ogg')[:sec(2.2)]; ws *= np.r_[np.linspace(0,1,sec(0.15)), np.linspace(1,0,sec(2.05))**2]
put(J, ws, 1.35, 1.2)
save('jump', norm(fade(J,0.005,0.2), 0.9))
# 9) vue éclatée : servos, glissières, cliquets
E = np.zeros(sec(1.4))
srv = varispeed(highpass(load(S+'spaceEngineSmall_000.ogg'),200), np.r_[np.linspace(0.8,1.5,sec(0.6)), np.linspace(1.5,0.9,sec(0.6))])
srv = srv[:sec(1.2)] * np.sin(np.linspace(0,np.pi,len(srv[:sec(1.2)])))
put(E, srv, 0.0, 0.5)
put(E, load(S+'doorOpen_000.ogg'), 0.05, 0.7)
for k,tt in enumerate([0.25,0.5,0.75,1.0]): put(E, load(M+f'impactMetal_light_00{k}.ogg'), tt, 0.5)
put(E, load(M+'impactMetal_medium_003.ogg'), 1.1, 0.7)
save('explode', norm(fade(E,0.002,0.08), 0.8))
# 10) arrêt d'urgence : alarme puis chute de régime
A = np.zeros(sec(2.4))
for tt in [0, 0.22, 0.44]: put(A, load(I+'error_007.ogg'), tt, 0.7)
pd = load(S+'spaceEngine_001.ogg'); pd = varispeed(pd, np.linspace(1.0, 0.25, sec(1.9))); pd *= np.linspace(1,0,len(pd))**1.5
put(A, pd, 0.45, 0.6)
save('abort', norm(fade(A,0.002,0.1), 0.85))
