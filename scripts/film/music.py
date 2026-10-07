#!/usr/bin/env python3
"""
Miljonkraft, filmmusik.

Original composition, synthesized from scratch with numpy and scipy. No
samples, loops or presets from third parties are used, so the track is
royalty free by construction.

  120 BPM, D major, progression D - A - Bm - G (one chord per bar, 1 bar = 2 s)
  48 kHz stereo, length = film length + 1 s tail

Structure (seconds), aligned with the film scenes:
   0-8   intro: warm pad, soft plucked arpeggio, filter opening, noise riser 6-8
   8     drop: low boom + bright crash, then full groove
   8-20  groove: kick 4/4, claps on 2 and 4, hats, sub bass, sidechained pad
  20-30  breakdown: one bell pluck per step 21-28 (rising D major scale), build 28-30
  30-38  groove back
  38-46  groove + counter melody
  46     impact for the vision, groove + lifted melody
  50-57  outro: groove drops out, pad + arp, A resolves to a final D chord

Usage:
  python scripts/film/music.py --out path/to/music.wav [--mp3 public/film/miljonkraft-musik.mp3]
                               [--spectrogram path.png] [--ffmpeg /path/to/ffmpeg]
"""
import argparse
import json
import os
import subprocess
import sys

import numpy as np
from scipy import signal
from scipy.ndimage import minimum_filter1d, uniform_filter1d

SR = 48000
BPM = 120.0
BEAT = 60.0 / BPM          # 0.5 s
BAR = 4 * BEAT             # 2.0 s
FILM = 56.0
DUR = FILM + 1.0
N = int(round(DUR * SR))
TARGET_LUFS = -16.0
CEILING_DBTP = -1.0

rng = np.random.default_rng(20120612)


def sec(t):
    return int(round(t * SR))


def mhz(m):
    return 440.0 * 2.0 ** ((m - 69) / 12.0)


def db(x):
    return 20.0 * np.log10(np.maximum(x, 1e-12))


def undb(d):
    return 10.0 ** (d / 20.0)


# ----------------------------------------------------------------------------
# Harmony
# ----------------------------------------------------------------------------
LOOP = ['D', 'A', 'Bm', 'G']


def chord_at_bar(b):
    if b >= 26:
        return 'D'           # final resolution (A at bar 25 -> D)
    return LOOP[b % 4]


ROOT = {'D': 38, 'A': 33, 'Bm': 35, 'G': 31}            # D2 A1 B1 G1
PAD = {
    'D': [50, 57, 62, 66, 69, 74],
    'A': [52, 57, 61, 64, 69, 73],
    'Bm': [50, 54, 59, 62, 66, 71],
    'G': [50, 55, 59, 62, 67, 71],
}
ARP = {
    'D': [62, 66, 69, 74, 78],
    'A': [61, 64, 69, 73, 76],
    'Bm': [62, 66, 71, 74, 78],
    'G': [62, 67, 71, 74, 79],
}
ARP16 = [0, 2, 1, 3, 2, 4, 3, 1, 0, 2, 1, 3, 2, 4, 3, 2]
ARP8 = [0, 2, 3, 4, 1, 3, 2, 4]


# ----------------------------------------------------------------------------
# Building blocks
# ----------------------------------------------------------------------------
def pan2(x, p):
    th = (np.clip(p, -1, 1) + 1.0) * np.pi / 4.0
    return np.stack([x * np.cos(th), x * np.sin(th)], axis=1)


def place(bus, sig, t0, gain=1.0):
    i0 = sec(t0)
    if sig.ndim == 1:
        sig = np.stack([sig, sig], axis=1)
    if i0 < 0:
        sig = sig[-i0:]
        i0 = 0
    n = min(len(sig), N - i0)
    if n > 0:
        bus[i0:i0 + n] += sig[:n] * gain


def edge_fade(x, a=0.002, r=0.004):
    """Short raised-cosine fades at both ends so nothing starts or stops with a click."""
    n = len(x)
    na = max(1, min(n // 2, sec(a)))
    nr = max(1, min(n // 2, sec(r)))
    w = np.ones(n)
    w[:na] = 0.5 - 0.5 * np.cos(np.linspace(0, np.pi, na))
    w[n - nr:] = 0.5 + 0.5 * np.cos(np.linspace(0, np.pi, nr))
    return x * (w if x.ndim == 1 else w[:, None])


def smooth_attack(t, a):
    """sin^2 attack ramp: no corner at the end of the attack, so no broadband tick."""
    return np.sin(0.5 * np.pi * np.minimum(1.0, t / a)) ** 2


def saw_blep(freq, n, phase0=0.0):
    """Band-limited sawtooth (polyBLEP). freq may be a scalar or an array of length n."""
    f = np.broadcast_to(np.asarray(freq, dtype=float), (n,)).copy()
    dt = f / SR
    ph = (phase0 + np.cumsum(dt) - dt) % 1.0
    y = 2.0 * ph - 1.0
    m = ph < dt
    tt = ph[m] / dt[m]
    y[m] -= tt + tt - tt * tt - 1.0
    m = ph > 1.0 - dt
    tt = (ph[m] - 1.0) / dt[m]
    y[m] -= tt * tt + tt + tt + 1.0
    return y


def rbj(kind, fc, q=0.707, gain_db=0.0):
    fc = min(max(fc, 10.0), SR * 0.45)
    w0 = 2 * np.pi * fc / SR
    cw, sw = np.cos(w0), np.sin(w0)
    al = sw / (2 * q)
    A = 10 ** (gain_db / 40.0)
    if kind == 'lp':
        b = [(1 - cw) / 2, 1 - cw, (1 - cw) / 2]
        a = [1 + al, -2 * cw, 1 - al]
    elif kind == 'hp':
        b = [(1 + cw) / 2, -(1 + cw), (1 + cw) / 2]
        a = [1 + al, -2 * cw, 1 - al]
    elif kind == 'bp':
        b = [al, 0.0, -al]
        a = [1 + al, -2 * cw, 1 - al]
    elif kind == 'peak':
        b = [1 + al * A, -2 * cw, 1 - al * A]
        a = [1 + al / A, -2 * cw, 1 - al / A]
    elif kind == 'hshelf':
        sq = 2 * np.sqrt(A) * al
        b = [A * ((A + 1) + (A - 1) * cw + sq), -2 * A * ((A - 1) + (A + 1) * cw), A * ((A + 1) + (A - 1) * cw - sq)]
        a = [(A + 1) - (A - 1) * cw + sq, 2 * ((A - 1) - (A + 1) * cw), (A + 1) - (A - 1) * cw - sq]
    elif kind == 'lshelf':
        sq = 2 * np.sqrt(A) * al
        b = [A * ((A + 1) - (A - 1) * cw + sq), 2 * A * ((A - 1) - (A + 1) * cw), A * ((A + 1) - (A - 1) * cw - sq)]
        a = [(A + 1) + (A - 1) * cw + sq, -2 * ((A - 1) + (A + 1) * cw), (A + 1) + (A - 1) * cw - sq]
    else:
        raise ValueError(kind)
    b = np.array(b) / a[0]
    a = np.array(a) / a[0]
    return b, a


def filt(x, kind, fc, q=0.707, gain_db=0.0):
    b, a = rbj(kind, fc, q, gain_db)
    return signal.lfilter(b, a, x, axis=0)


def sweep(x, fc_of_t, kind='lp', q=0.707, t0=0.0, block=128, stages=1):
    """Time-varying biquad; coefficients updated every `block` samples, state carried over."""
    y = np.array(x, dtype=float, copy=True)
    nch = 1 if y.ndim == 1 else y.shape[1]
    for _ in range(stages):
        zi = np.zeros((2,) if nch == 1 else (2, nch))
        out = np.empty_like(y)
        for i in range(0, len(y), block):
            seg = y[i:i + block]
            tc = t0 + (i + len(seg) / 2) / SR
            b, a = rbj(kind, float(fc_of_t(tc)), q)
            out[i:i + block], zi = signal.lfilter(b, a, seg, axis=0, zi=zi)
        y = out
    return y


def butter_sos(order, fc, kind):
    return signal.butter(order, fc, kind, fs=SR, output='sos')


def noise(n, seed=None):
    g = rng if seed is None else np.random.default_rng(seed)
    return g.standard_normal(n)


def exp_ramp(t, t0, t1, v0, v1):
    u = np.clip((t - t0) / (t1 - t0), 0, 1)
    u = u * u * (3 - 2 * u)
    return v0 * (v1 / v0) ** u


# ----------------------------------------------------------------------------
# Instruments
# ----------------------------------------------------------------------------
def pluck(m, dur=0.9, bright=0.6, tau=0.32, seed=0):
    """Additive plucked tone: saw-like harmonic series, upper partials decay faster.
    Only partials below 15 kHz are generated, so it cannot alias."""
    f = mhz(m)
    n = sec(dur)
    t = np.arange(n) / SR
    y = np.zeros(n)
    kmax = int(min(15000.0 / f, 40))
    g = np.random.default_rng(seed + m)
    for k in range(1, kmax + 1):
        amp = (1.0 / k) * np.exp(-(k - 1) * (1.15 - bright) * 0.55)
        if amp < 1e-4:
            break
        tk = tau / (1.0 + 0.32 * (k - 1) * (1.25 - bright))
        y += amp * np.sin(2 * np.pi * f * k * t + g.uniform(-0.15, 0.15)) * np.exp(-t / tk)
    y *= smooth_attack(t, 0.004)
    return edge_fade(y, 0.0005, 0.03)


def bell(m, dur=3.2, seed=0):
    """Glassy bell for the eight model steps and the logo."""
    f = mhz(m)
    n = sec(dur)
    t = np.arange(n) / SR
    parts = [(1.0, 1.0, 2.6), (2.0, 0.55, 1.5), (3.0, 0.22, 0.9), (4.07, 0.20, 0.7),
             (5.43, 0.10, 0.45), (6.8, 0.06, 0.32), (0.5, 0.18, 1.8)]
    y = np.zeros(n)
    g = np.random.default_rng(seed + m)
    for r, a, d in parts:
        if f * r > 16000:
            continue
        y += a * np.sin(2 * np.pi * f * r * t + g.uniform(0, 2 * np.pi)) * np.exp(-t / d)
    y *= smooth_attack(t, 0.003)
    return edge_fade(y, 0.0005, 0.08)


def lead(m, dur, vel=1.0):
    """Soft saw-ish lead with delayed vibrato (additive, band-limited)."""
    f0 = mhz(m)
    rel = 0.18
    n = sec(dur + rel)
    t = np.arange(n) / SR
    vib = 1.0 + (2 ** (14 / 1200.0) - 1) * np.sin(2 * np.pi * 5.3 * t) * np.clip((t - 0.18) / 0.25, 0, 1)
    fi = f0 * vib
    ph = 2 * np.pi * np.cumsum(fi) / SR
    y = np.zeros(n)
    kmax = int(min(12000.0 / f0, 24))
    for k in range(1, kmax + 1):
        y += (1.0 / k ** 1.35) * np.sin(k * ph) * np.exp(-t * (k - 1) * 0.9)
    env = smooth_attack(t, 0.014) * (0.62 + 0.38 * np.exp(-t / 0.35))
    off = sec(dur)
    env[off:] *= np.exp(-(t[off:] - t[off]) / (rel / 4))
    return edge_fade(y * env * vel, 0.001, 0.02)


def kick_sample():
    n = sec(0.6)
    t = np.arange(n) / SR
    f = 47 + 125 * np.exp(-t / 0.028) + 38 * np.exp(-t / 0.11)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t / 0.21) * np.minimum(1, t / 0.0007)
    click = signal.sosfilt(butter_sos(2, 2500, 'high'), noise(n, 11)) * np.exp(-t / 0.0032) * 0.30
    x = np.tanh(1.7 * (body + click)) / np.tanh(1.7)
    return edge_fade(x, 0.0003, 0.05)


def clap_sample(seed):
    n = sec(0.5)
    t = np.arange(n) / SR
    env = np.zeros(n)
    for d in (0.0, 0.0105, 0.021):
        env += (t >= d) * np.exp(-np.maximum(t - d, 0) / 0.0055)
    env += 0.55 * (t >= 0.029) * np.exp(-np.maximum(t - 0.029, 0) / 0.12)
    out = []
    for ch in range(2):
        x = noise(n, seed + ch) * env
        x = signal.sosfilt(butter_sos(2, [850, 7000], 'bandpass'), x)
        x = filt(x, 'peak', 1350, 1.2, 3.0)
        x = filt(x, 'peak', 3200, 1.0, 3.5)
        out.append(x)
    return edge_fade(np.stack(out, 1) * 0.9, 0.0002, 0.04)


def hat_sample(decay, seed):
    n = sec(decay * 7 + 0.01)
    t = np.arange(n) / SR
    x = noise(n, seed)
    x = signal.sosfilt(butter_sos(4, 7200, 'high'), x)
    x = filt(x, 'peak', 10500, 2.0, 5.0)
    x = signal.sosfilt(butter_sos(2, 15500, 'low'), x)
    x *= np.exp(-t / decay) * np.minimum(1, t / 0.0004)
    return edge_fade(x * 0.6, 0.0002, 0.01)


def snare_sample(seed, tone=190.0):
    n = sec(0.35)
    t = np.arange(n) / SR
    nz = signal.sosfilt(butter_sos(2, [300, 9000], 'bandpass'), noise(n, seed)) * np.exp(-t / 0.075)
    body = np.sin(2 * np.pi * tone * t * (1 + 0.3 * np.exp(-t / 0.01))) * np.exp(-t / 0.05)
    x = 0.85 * nz + 0.5 * body
    return edge_fade(x * np.minimum(1, t / 0.0005), 0.0002, 0.03)


def impact(big=True, seed=5):
    """Low boom + bright crash."""
    n = sec(3.6)
    t = np.arange(n) / SR
    f = 33 + 60 * np.exp(-t / 0.09)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / (1.15 if big else 0.7))
    boom = np.tanh(1.4 * boom * np.minimum(1, t / 0.001)) / np.tanh(1.4)
    out = []
    for ch in range(2):
        cr = noise(n, seed + ch)
        cr = signal.sosfilt(butter_sos(2, 2600, 'high'), cr)
        cr = signal.sosfilt(butter_sos(2, 13000, 'low'), cr)
        cr = filt(cr, 'peak', 6200, 1.5, 3.0)
        env = np.minimum(1, t / 0.002) * (0.55 * np.exp(-t / 0.09) + 0.45 * np.exp(-t / (1.5 if big else 0.9)))
        out.append(cr * env)
    crash = np.stack(out, 1)
    return edge_fade(np.stack([boom, boom], 1) * 0.95 + crash * (0.42 if big else 0.3), 0.0002, 0.2)


def riser(dur, f0=300, f1=9000, seed=9):
    n = sec(dur)
    t = np.arange(n) / SR
    out = []
    for ch in range(2):
        x = noise(n, seed + ch)
        x = sweep(x, lambda tc: f0 * (f1 / f0) ** min(1.0, tc / dur), 'bp', q=1.6)
        out.append(x)
    x = np.stack(out, 1)
    amp = (t / dur) ** 2.2
    tone = np.sin(2 * np.pi * np.cumsum(220 * 4 ** (t / dur)) / SR) * 0.08 * (t / dur) ** 3
    x = x * amp[:, None] + tone[:, None]
    return edge_fade(x, 0.01, 0.006)


def downlifter(dur, seed=21):
    n = sec(dur)
    t = np.arange(n) / SR
    out = []
    for ch in range(2):
        x = noise(n, seed + ch)
        x = sweep(x, lambda tc: 7000 * (250 / 7000) ** min(1.0, tc / dur), 'bp', q=1.3)
        out.append(x)
    x = np.stack(out, 1) * (np.exp(-t / (dur * 0.35)))[:, None]
    return edge_fade(x, 0.004, 0.05)


def make_ir(seconds=3.0, rt=(2.7, 2.1, 1.15), predelay=0.016, seed=77):
    """Synthesized stereo reverb impulse response: band-wise exponentially decaying
    noise (longer lows, shorter highs) with early reflections."""
    g = np.random.default_rng(seed)
    n = sec(seconds)
    t = np.arange(n) / SR
    pre = sec(predelay)
    ir = np.zeros((n + pre, 2))
    lo_s = butter_sos(2, 450, 'low')
    hi_s = butter_sos(2, 4200, 'high')
    for ch in range(2):
        x = g.standard_normal(n)
        lo = signal.sosfilt(lo_s, x)
        hi = signal.sosfilt(hi_s, x)
        mid = x - lo - hi
        tail = (lo * np.exp(-6.9 * t / rt[0]) + mid * np.exp(-6.9 * t / rt[1]) + hi * np.exp(-6.9 * t / rt[2]))
        tail *= 1 - np.exp(-t / 0.02)
        ir[pre:, ch] = tail
        for _ in range(12):
            d = g.uniform(0.004, 0.075)
            ir[sec(d), ch] += g.choice([-1, 1]) * g.uniform(3, 9) * (1 - d / 0.09)
    ir /= np.sqrt(np.sum(ir ** 2, axis=0, keepdims=True))
    return ir


def reverb(send, ir):
    out = np.zeros_like(send)
    for ch in range(2):
        out[:, ch] = signal.fftconvolve(send[:, ch], ir[:, ch])[:len(send)]
    out = signal.sosfilt(butter_sos(2, 180, 'high'), out, axis=0)
    out = signal.sosfilt(butter_sos(2, 9500, 'low'), out, axis=0)
    return out


def pingpong(x, delay, fb, echoes, lp=4200):
    out = np.zeros_like(x)
    mono = x.mean(axis=1)
    sos = butter_sos(1, lp, 'low')
    hp = butter_sos(1, 250, 'high')
    s = mono
    for k in range(1, echoes + 1):
        s = signal.sosfilt(hp, signal.sosfilt(sos, s))
        d = sec(delay * k)
        if d >= N:
            break
        out[d:, (k + 1) % 2] += s[:N - d] * fb ** (k - 1)
    return out


# ----------------------------------------------------------------------------
# Loudness (ITU-R BS.1770-4) and true peak
# ----------------------------------------------------------------------------
def lufs(x):
    b1, a1 = [1.53512485958697, -2.69169618940638, 1.19839281085285], [1.0, -1.69065929318241, 0.73248077421585]
    b2, a2 = [1.0, -2.0, 1.0], [1.0, -1.99004745483398, 0.99007225036621]
    y = signal.lfilter(b2, a2, signal.lfilter(b1, a1, x, axis=0), axis=0)
    blk, hop = sec(0.4), sec(0.1)
    ms = []
    for i in range(0, len(y) - blk + 1, hop):
        ms.append(np.sum(np.mean(y[i:i + blk] ** 2, axis=0)))
    ms = np.array(ms)
    L = -0.691 + 10 * np.log10(np.maximum(ms, 1e-20))
    g1 = ms[L > -70]
    rel = -0.691 + 10 * np.log10(np.mean(g1)) - 10
    g2 = ms[(L > -70) & (L > rel)]
    return -0.691 + 10 * np.log10(np.mean(g2))


def true_peak_db(x):
    up = signal.resample_poly(x, 4, 1, axis=0)
    return db(np.max(np.abs(up)))


def soft_clip(x, knee=0.72):
    up = signal.resample_poly(x, 2, 1, axis=0)
    a = np.abs(up)
    over = a > knee
    up[over] = np.sign(up[over]) * (knee + (1 - knee) * np.tanh((a[over] - knee) / (1 - knee)))
    return signal.resample_poly(up, 1, 2, axis=0)[:len(x)]


def limiter(x, ceiling_db=-1.3, window=0.012):
    ceil = undb(ceiling_db)
    up = signal.resample_poly(x, 4, 1, axis=0)
    pk = np.max(np.abs(up[:len(x) * 4]).reshape(len(x), 4, 2), axis=(1, 2))
    g = np.minimum(1.0, ceil / np.maximum(pk, 1e-9))
    w = max(3, sec(window))
    gmin = minimum_filter1d(g, size=2 * w + 1, mode='nearest')
    gs = uniform_filter1d(gmin, size=w, mode='nearest')
    gs = np.minimum(gs, g)
    return x * gs[:, None], gs


# ----------------------------------------------------------------------------
# Arrangement
# ----------------------------------------------------------------------------
def build():
    T = np.arange(N) / SR
    bus = {k: np.zeros((N, 2)) for k in ['pad', 'arp', 'bass', 'sub', 'kick', 'clap', 'hat', 'perc', 'fx', 'bell', 'lead']}
    groove = lambda t: (8.0 <= t < 20.0) or (30.0 <= t < 50.0)

    # ---- pad: detuned polyBLEP saws per chord, crossfaded, one bus filter sweep
    detL = [-13.0, -3.0, 8.0]
    detR = [-7.0, 4.0, 14.0]
    for b in range(int(np.ceil(DUR / BAR))):
        t0 = b * BAR
        ch = chord_at_bar(b)
        if b >= 27:
            continue                        # bar 26 holds the final chord to the end
        length = BAR if b < 26 else DUR - t0
        att = 1.2 if b == 0 else 0.22
        rel = 0.55 if b < 26 else 0.2
        n = sec(length + rel)
        t = np.arange(n) / SR
        env = np.minimum(1.0, t / att)
        off = sec(length)
        env[off:] *= 0.5 + 0.5 * np.cos(np.pi * np.minimum(1, (t[off:] - length) / rel))
        start = t0 - (0.0 if b == 0 else 0.06)
        for m in PAD[ch]:
            f = mhz(m)
            vol = 0.16 if m < 55 else 0.13
            st = np.zeros((n, 2))
            for side, dets in ((0, detL), (1, detR)):
                for d in dets:
                    st[:, side] += saw_blep(f * 2 ** (d / 1200.0), n, rng.uniform())
            sp = 0.32 * (1 if (PAD[ch].index(m) % 2) else -1)
            gl, gr = np.cos((sp + 1) * np.pi / 4) * np.sqrt(2), np.sin((sp + 1) * np.pi / 4) * np.sqrt(2)
            st[:, 0] *= gl
            st[:, 1] *= gr
            place(bus['pad'], st * (env * vol / len(detL))[:, None], max(start, 0.0))

    def pad_cut(tc):
        if tc < 8.0:
            return 380 * (3200 / 380) ** ((tc / 8.0) ** 1.5)
        if tc < 20.0:
            return 6000
        if tc < 21.0:
            return 6000 * (1500 / 6000) ** (tc - 20.0)
        if tc < 28.0:
            return 1500 * (2800 / 1500) ** ((tc - 21.0) / 7.0)
        if tc < 30.0:
            return 2800 * (5200 / 2800) ** ((tc - 28.0) / 2.0)
        if tc < 50.0:
            return 6200
        return 6200 * (1100 / 6200) ** min(1.0, (tc - 50.0) / 7.0)
    bus['pad'] = sweep(bus['pad'], pad_cut, 'lp', q=0.62, stages=2)
    bus['pad'] = filt(bus['pad'], 'hp', 140, 0.7)
    bus['pad'] *= (np.minimum(1.0, T / 1.6) ** 1.5 * np.where(T < 8.0, 0.42 + 0.22 * (T / 8.0) ** 2, 1.0))[:, None]

    # ---- arpeggio
    cache = {}

    def arp_note(m, bright, tau):
        key = (m, round(bright, 2), round(tau, 2))
        if key not in cache:
            cache[key] = pluck(m, dur=1.0, bright=bright, tau=tau, seed=len(cache))
        return cache[key]

    t = 0.0
    step16 = BEAT / 4
    i = 0
    while t < 55.0 - 1e-9:
        b = int(t // BAR)
        ch = chord_at_bar(b)
        notes = ARP[ch]
        pos_in_bar = t - b * BAR
        if t < 8.0 or (50.0 <= t):
            # 8th notes in intro and outro
            if abs((pos_in_bar / (BEAT / 2)) - round(pos_in_bar / (BEAT / 2))) < 1e-6:
                k = int(round(pos_in_bar / (BEAT / 2))) % 8
                m = notes[ARP8[k]]
                if t < 8.0:
                    bright = 0.2 + 0.55 * (t / 8.0) ** 1.2
                    vel = 0.42 + 0.3 * (t / 8.0)
                else:
                    u = min(1.0, (t - 50.0) / 5.0)
                    bright = 0.6 - 0.4 * u
                    vel = 0.8 * (1 - u) ** 1.2 + 0.05
                if t >= 52.0:
                    notes = ARP['D']
                    m = notes[ARP8[k]]
                sig = arp_note(m, bright, 0.36)
                place(bus['arp'], pan2(sig, 0.28 * np.sin(i * 1.7)), t, vel)
        else:
            k = int(round(pos_in_bar / step16)) % 16
            m = notes[ARP16[k]]
            accent = 1.0 if k % 4 == 0 else (0.78 if k % 2 == 0 else 0.62)
            if 20.0 <= t < 30.0:
                bright, vel = 0.62, 0.62 * accent
            else:
                bright, vel = 0.92, 0.78 * accent
            sig = arp_note(m, bright, 0.22)
            place(bus['arp'], pan2(sig, 0.3 * np.sin(i * 1.7)), t, vel)
        i += 1
        t = round(t + step16, 6)
    bus['arp'] = filt(bus['arp'], 'hp', 200, 0.7)
    arp_delay = pingpong(bus['arp'], 0.375, 0.42, 6, lp=3800)

    # ---- bass: sub (sustained root, sidechained) + mid bass on off-beat 8ths
    for b in range(4, 25):
        t0 = b * BAR
        if not groove(t0):
            continue
        r = ROOT[chord_at_bar(b)]
        n = sec(BAR)
        tt = np.arange(n) / SR
        s = np.sin(2 * np.pi * mhz(r) * tt)
        s = np.tanh(1.3 * s) / np.tanh(1.3)            # a touch of harmonics for small speakers
        place(bus['sub'], edge_fade(s, 0.006, 0.02), t0, 1.0)
        for k in range(4):
            tn = t0 + k * BEAT + BEAT / 2
            nn = sec(0.21)
            tq = np.arange(nn) / SR
            x = saw_blep(mhz(r + 12), nn, 0.0) + 0.5 * saw_blep(mhz(r + 12) * 1.004, nn, 0.3)
            x = filt(x, 'lp', 520 + 900 * (0.5 if b % 4 == 3 else 0.3), 1.1)
            x *= np.exp(-tq / 0.16) * np.minimum(1, tq / 0.003)
            place(bus['bass'], edge_fade(x, 0.002, 0.02), tn, 0.55)
    # final low D swelling under the last chord
    n = sec(5.0)
    tt = np.arange(n) / SR
    s = np.sin(2 * np.pi * mhz(38) * tt) * np.minimum(1, tt / 0.04) * np.exp(-tt / 2.4)
    place(bus['sub'], edge_fade(s, 0.003, 0.5), 52.0, 0.45)

    # ---- drums
    kick = kick_sample()
    kick_times = []
    for k in range(int(DUR / BEAT)):
        tb = k * BEAT
        if groove(tb):
            kick_times.append(tb)
    for tb in kick_times:
        place(bus['kick'], kick, tb, 1.0)

    claps = [clap_sample(100 + i) for i in range(4)]
    for k, tb in enumerate(kick_times):
        beat_in_bar = int(round((tb % BAR) / BEAT))
        if beat_in_bar in (1, 3):
            place(bus['clap'], claps[k % 4], tb + 0.004, 1.0)

    hats_c = [hat_sample(0.028, 200 + i) for i in range(6)]
    hat_o = hat_sample(0.12, 300)
    for k in range(int(DUR / (BEAT / 4))):
        tb = k * BEAT / 4
        if not groove(tb):
            continue
        sub = k % 4
        vel = [0.32, 0.18, 0.62, 0.22][sub] * (1.0 + 0.08 * np.sin(k * 2.3))
        if sub == 2 and (38.0 <= tb < 50.0):
            place(bus['hat'], pan2(hat_o, 0.15), tb, 0.55)
        else:
            place(bus['hat'], pan2(hats_c[k % 6], -0.2 if sub % 2 else 0.12), tb, vel)
    # light hats in the late breakdown keep the pulse
    for k in range(int(24.0 / (BEAT / 2)), int(28.0 / (BEAT / 2))):
        tb = k * BEAT / 2
        if k % 2 == 1:
            place(bus['hat'], pan2(hats_c[k % 6], 0.1), tb, 0.22)

    # snare build 28-30
    sn = [snare_sample(400 + i, 185 + 3 * i) for i in range(32)]
    times = []
    t = 28.0
    while t < 29.0 - 1e-9:
        times.append(t); t += BEAT / 2
    while t < 29.5 - 1e-9:
        times.append(t); t += BEAT / 4
    while t < 29.875 - 1e-9:
        times.append(t); t += BEAT / 8
    for i, tb in enumerate(times):
        u = (tb - 28.0) / 1.875
        place(bus['perc'], pan2(sn[i % 32], 0.1 * np.sin(i)), tb, 0.12 + 0.38 * u ** 1.6)

    # ---- effects
    place(bus['fx'], riser(2.0, 260, 9500, 31), 6.0, 0.30)
    place(bus['fx'], riser(1.9, 400, 8000, 41), 28.0, 0.20)
    place(bus['fx'], riser(1.95, 300, 9000, 51), 44.0, 0.17)
    place(bus['fx'], downlifter(1.6), 20.0, 0.22)
    place(bus['fx'], impact(True, 61), 8.0, 0.85)
    place(bus['fx'], impact(False, 71), 30.0, 0.55)
    place(bus['fx'], impact(True, 81), 46.0, 0.85)

    # ---- bells: logo, eight steps (21-28, rising D major scale, panned left to right), end card
    place(bus['bell'], pan2(bell(74, 3.5, 1), -0.15), 0.40, 0.32)
    place(bus['bell'], pan2(bell(81, 3.5, 2), 0.15), 0.42, 0.20)
    scale = [74, 76, 78, 79, 81, 83, 85, 86]
    for i, m in enumerate(scale):
        place(bus['bell'], pan2(bell(m, 3.0, 10 + i), -0.55 + i * (1.1 / 7)), 21.0 + i, 0.42 + 0.03 * i)
    place(bus['bell'], pan2(bell(86, 4.0, 30), -0.12), 53.0, 0.34)
    place(bus['bell'], pan2(bell(81, 4.0, 31), 0.12), 53.02, 0.22)
    place(bus['bell'], pan2(bell(78, 4.0, 32), 0.0), 53.04, 0.16)

    # ---- counter melody (proof 38-46) and lifted line (vision 46-52)
    mel = [
        # bar 19 (G) 38-40
        (38.00, 79, 0.50), (38.50, 81, 0.25), (38.75, 83, 0.75), (39.50, 81, 0.25), (39.75, 79, 0.25),
        # bar 20 (D) 40-42
        (40.00, 78, 0.75), (40.75, 81, 0.50), (41.25, 78, 0.25), (41.50, 76, 0.25), (41.75, 74, 0.25),
        # bar 21 (A) 42-44
        (42.00, 76, 0.50), (42.50, 73, 0.25), (42.75, 76, 0.50), (43.25, 81, 0.50), (43.75, 78, 0.25),
        # bar 22 (Bm) 44-46
        (44.00, 78, 0.75), (44.75, 74, 0.25), (45.00, 71, 0.50), (45.50, 73, 0.25), (45.75, 74, 0.25),
        # bar 23 (G) 46-48, lifted
        (46.00, 83, 0.75), (46.75, 86, 0.50), (47.25, 83, 0.25), (47.50, 81, 0.50),
        # bar 24 (D) 48-50
        (48.00, 81, 0.50), (48.50, 78, 0.50), (49.00, 81, 0.50), (49.50, 86, 0.50),
        # bar 25 (A) 50-52
        (50.00, 85, 1.50),
    ]
    for tn, m, d in mel:
        vel = 0.8 if tn < 46 else 0.95
        if tn >= 50:
            vel = 0.55
        place(bus['lead'], pan2(lead(m, d * 0.92, vel), 0.0), tn, 1.0)
    bus['lead'] = filt(bus['lead'], 'hp', 250, 0.7)
    lead_delay = pingpong(bus['lead'], 0.25, 0.3, 4, lp=3000)

    # ---- sidechain (from kick times)
    pump = np.zeros(N)
    shape_n = sec(0.42)
    ts = np.arange(shape_n) / SR
    shape = np.minimum(1, ts / 0.004) * np.exp(-ts / 0.11)
    shape[:sec(0.004)] = np.linspace(0, 1, sec(0.004))
    for tb in kick_times:
        i0 = sec(tb)
        n = min(shape_n, N - i0)
        pump[i0:i0 + n] = np.maximum(pump[i0:i0 + n], shape[:n])
    duck = lambda depth: (1 - depth * pump)[:, None]

    # ---- mix
    gains = {'pad': 1.05, 'arp': 0.80, 'bass': 0.36, 'sub': 0.25, 'kick': 0.66, 'clap': 0.46,
             'hat': 0.62, 'perc': 0.60, 'fx': 0.70, 'bell': 0.62, 'lead': 0.50}
    pad = bus['pad'] * duck(0.55) * gains['pad']
    arp = (bus['arp'] + 0.33 * arp_delay) * duck(0.25) * gains['arp']
    sub = bus['sub'] * duck(0.85) * gains['sub']
    bass = bus['bass'] * gains['bass']
    lead_ = (bus['lead'] + 0.28 * lead_delay) * duck(0.12) * gains['lead']
    dry = (pad + arp + sub + bass + lead_ + bus['kick'] * gains['kick'] + bus['clap'] * gains['clap']
           + bus['hat'] * gains['hat'] + bus['perc'] * gains['perc'] + bus['fx'] * gains['fx']
           + bus['bell'] * gains['bell'])
    send = (pad * 0.32 + arp * 0.30 + lead_ * 0.38 + bus['clap'] * gains['clap'] * 0.30
            + bus['perc'] * gains['perc'] * 0.30 + bus['fx'] * gains['fx'] * 0.32
            + bus['bell'] * gains['bell'] * 0.65 + bus['hat'] * gains['hat'] * 0.05)
    ir = make_ir()
    wet = reverb(send, ir) * duck(0.25)
    mix = dry + 0.55 * wet
    stems = {'dry': dry, 'wet': wet}
    return mix, stems, kick_times


def master(mix):
    T = np.arange(N) / SR
    x = signal.sosfilt(butter_sos(2, 30, 'high'), mix, axis=0)       # high-pass 30 Hz, removes DC
    x = filt(x, 'peak', 4600, 1.4, -0.8)                            # tame 3-6 kHz harshness
    x = filt(x, 'peak', 280, 0.8, -1.5)                             # a little less boxiness
    x = filt(x, 'lshelf', 90, 0.7, -1.5)                            # keep the low end tidy
    x = filt(x, 'hshelf', 9500, 0.7, 2.0)                           # gentle air
    # end: gentle fade, the last chord rings out
    fade = np.ones(N)
    a, b = 53.6, DUR - 0.2
    u = np.clip((T - a) / (b - a), 0, 1)
    fade = (0.5 + 0.5 * np.cos(np.pi * u)) ** 1.3
    fade[T >= b] = 0.0
    x *= fade[:, None]
    gain_db = 0.0
    for _ in range(4):
        y = soft_clip(x * undb(gain_db))
        y, _g = limiter(y, CEILING_DBTP - 0.3)
        L = lufs(y)
        gain_db += TARGET_LUFS - L
        if abs(TARGET_LUFS - L) < 0.05:
            break
    y = soft_clip(x * undb(gain_db))
    y, g = limiter(y, CEILING_DBTP - 0.3)
    return y, gain_db, g


def write_wav(path, y):
    from scipy.io import wavfile
    pcm = np.clip(np.round(y * 32767.0), -32768, 32767).astype(np.int16)
    wavfile.write(path, SR, pcm)


def spectrogram_png(y, path, ffmpeg):
    """Log-frequency spectrogram computed with numpy, written as PGM and converted to PNG with ffmpeg."""
    mono = y.mean(axis=1)
    f, t, Z = signal.stft(mono, fs=SR, nperseg=4096, noverlap=4096 - 480)
    mag = db(np.abs(Z) + 1e-12)
    width, height = 1600, 720
    fl = np.geomspace(25, 20000, height)[::-1]
    idx = np.clip(np.searchsorted(f, fl), 1, len(f) - 1)
    cols = np.linspace(0, mag.shape[1] - 1, width).astype(int)
    img = mag[idx][:, cols]
    img = np.clip((img + 110) / 110, 0, 1)
    img = (255 * (1 - img) ** 1.0).astype(np.uint8)       # dark = loud
    # second markers every 2 s (one bar), stronger every 8 s
    for s in np.arange(0, DUR, 2.0):
        c = int(s / DUR * (width - 1))
        img[:: 6 if s % 8 else 2, c] = 0 if s % 8 == 0 else 128
    pgm = path + '.pgm'
    with open(pgm, 'wb') as fh:
        fh.write(b'P5\n%d %d\n255\n' % (width, height))
        fh.write(img.tobytes())
    subprocess.run([ffmpeg, '-y', '-loglevel', 'error', '-i', pgm, path], check=True)
    os.remove(pgm)


def check_clicks(y):
    """Report sample-to-sample jumps far above the local high-frequency activity."""
    hp = signal.sosfilt(butter_sos(4, 12000, 'high'), y.mean(axis=1))
    env = uniform_filter1d(np.abs(hp), size=sec(0.02)) + 1e-6
    ratio = np.abs(hp) / env
    hits = np.where(ratio > 14)[0]
    return len(hits), [round(h / SR, 3) for h in hits[:10]]


def main():
    ap = argparse.ArgumentParser()
    here = os.path.dirname(os.path.abspath(__file__))
    ap.add_argument('--out', default=os.path.join(here, '.work', 'miljonkraft-musik.wav'))
    ap.add_argument('--mp3', default=None)
    ap.add_argument('--spectrogram', default=None)
    ap.add_argument('--ffmpeg', default=os.environ.get('FFMPEG', 'ffmpeg'))
    args = ap.parse_args()
    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)

    mix, stems, kick_times = build()
    y, gain_db, g = master(mix)
    write_wav(args.out, y)

    report = {
        'file': args.out,
        'seconds': round(N / SR, 3),
        'sample_rate': SR,
        'makeup_gain_db': round(gain_db, 2),
        'integrated_lufs_internal': round(lufs(y), 2),
        'true_peak_dbtp_internal': round(true_peak_db(y), 2),
        'sample_peak_dbfs': round(db(np.max(np.abs(y))), 2),
        'dc_offset': [float(f'{v:.2e}') for v in np.mean(y, axis=0)],
        'limiter_max_reduction_db': round(float(db(np.min(g))), 2),
        'clipped_samples': int(np.sum(np.abs(y) >= 0.9999)),
        'click_candidates': check_clicks(y),
    }
    if args.spectrogram:
        spectrogram_png(y, args.spectrogram, args.ffmpeg)
        report['spectrogram'] = args.spectrogram
    if args.mp3:
        os.makedirs(os.path.dirname(os.path.abspath(args.mp3)), exist_ok=True)
        subprocess.run([args.ffmpeg, '-y', '-loglevel', 'error', '-i', args.out, '-c:a', 'libmp3lame', '-b:a', '192k',
                        '-ar', str(SR), '-metadata', 'title=Miljonkraft (filmmusik)',
                        '-metadata', 'artist=Miljonbemanning', '-metadata', 'comment=Original music generated by scripts/film/music.py',
                        args.mp3], check=True)
        report['mp3'] = args.mp3
    print(json.dumps(report, indent=2))


if __name__ == '__main__':
    main()
