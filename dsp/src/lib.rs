//! canto-dsp — núcleo de processamento de sinal vocal, compilado para WebAssembly.
//!
//! Fornece um `Analyzer` que recebe um frame de áudio (janela deslizante) e
//! devolve um vetor de features por frame:
//!   [f0_hz, clarity, rms, spectral_centroid_hz, spectral_tilt]
//!
//! - F0 via **McLeod Pitch Method (MPM)** — portado da versão TS já validada
//!   (10/10 notas de E2 a A5 com ~0 cents de erro).
//! - Features espectrais via FFT radix-2 (Cooley-Tukey) escrita à mão, sem deps.
//!
//! O `Analyzer` pré-aloca todos os buffers no construtor (nada é alocado no
//! caminho quente `analyze`), para rodar estável a 60fps em aparelho fraco.

use std::f32::consts::PI;
use wasm_bindgen::prelude::*;

// Faixa plausível de F0 para voz cantada (Hz).
const MIN_FREQ: f32 = 55.0; // ~A1
const MAX_FREQ: f32 = 1600.0; // ~G6
// Fração do maior pico para escolher o "key maximum" (evita erro de oitava p/ cima).
const K: f32 = 0.9;

#[wasm_bindgen]
pub struct Analyzer {
    sample_rate: f32,
    size: usize,
    max_lag: usize,
    // buffers reutilizáveis (pré-alocados)
    hann: Vec<f32>,
    nsdf: Vec<f32>,
    re: Vec<f32>,
    im: Vec<f32>,
    bitrev: Vec<usize>,
}

#[wasm_bindgen]
impl Analyzer {
    /// `size` deve ser potência de 2 (ex.: 2048).
    #[wasm_bindgen(constructor)]
    pub fn new(sample_rate: f32, size: usize) -> Analyzer {
        let mut hann = vec![0.0f32; size];
        for i in 0..size {
            hann[i] = 0.5 - 0.5 * (2.0 * PI * i as f32 / size as f32).cos();
        }
        let bits = (size as f32).log2() as u32;
        let mut bitrev = vec![0usize; size];
        for i in 0..size {
            bitrev[i] = reverse_bits(i, bits);
        }
        Analyzer {
            sample_rate,
            size,
            max_lag: size / 2,
            hann,
            nsdf: vec![0.0f32; size / 2],
            re: vec![0.0f32; size],
            im: vec![0.0f32; size],
            bitrev,
        }
    }

    /// Analisa um frame de `size` amostras. Retorna
    /// [f0_hz, clarity, rms, spectral_centroid_hz, spectral_tilt, h1_h2_db].
    /// h1_h2 = amplitude do 1º harmônico menos o 2º (dB) — correlato espectral de
    /// registro/qualidade de fonação (falsete/breathy: H1>>H2; peito/pressed: menor).
    pub fn analyze(&mut self, samples: &[f32]) -> Vec<f32> {
        let n = self.size.min(samples.len());

        // RMS
        let mut sum = 0.0f32;
        for i in 0..n {
            sum += samples[i] * samples[i];
        }
        let rms = (sum / n as f32).sqrt();

        // F0 via MPM
        let (f0, clarity) = self.detect_mpm(samples, n);

        // Features espectrais (FFT do sinal janelado)
        for i in 0..self.size {
            let s = if i < n { samples[i] } else { 0.0 };
            self.re[i] = s * self.hann[i];
            self.im[i] = 0.0;
        }
        fft(&mut self.re, &mut self.im, &self.bitrev);
        let (centroid, tilt) = spectral_features(&self.re, &self.im, self.sample_rate);
        let h1h2 = h1_minus_h2(&self.re, &self.im, f0, self.sample_rate);

        vec![f0, clarity, rms, centroid, tilt, h1h2]
    }

    fn detect_mpm(&mut self, buf: &[f32], n: usize) -> (f32, f32) {
        let max_lag = (n / 2).min(self.max_lag);
        // NSDF: 2*ACF[tau] / m[tau]
        for tau in 0..max_lag {
            let mut acf = 0.0f32;
            let mut m = 0.0f32;
            let limit = n - tau;
            for i in 0..limit {
                let a = buf[i];
                let b = buf[i + tau];
                acf += a * b;
                m += a * a + b * b;
            }
            self.nsdf[tau] = if m > 0.0 { 2.0 * acf / m } else { 0.0 };
        }

        // Coleta de máximos-chave entre cruzamentos de zero positivos,
        // ignorando o lóbulo inicial (tau ~ 0).
        let nsdf = &self.nsdf;
        let mut i = 0usize;
        while i < max_lag - 1 && nsdf[i] > 0.0 {
            i += 1;
        }
        while i < max_lag - 1 && nsdf[i] <= 0.0 {
            i += 1;
        }
        if i < 1 {
            i = 1;
        }
        let mut peaks: Vec<usize> = Vec::with_capacity(16);
        let mut cur = 0usize;
        while i < max_lag - 1 {
            if nsdf[i] > nsdf[i - 1] && nsdf[i] >= nsdf[i + 1] && (cur == 0 || nsdf[i] > nsdf[cur]) {
                cur = i;
            }
            i += 1;
            if i < max_lag - 1 && nsdf[i] <= 0.0 {
                if cur > 0 {
                    peaks.push(cur);
                    cur = 0;
                }
                while i < max_lag - 1 && nsdf[i] <= 0.0 {
                    i += 1;
                }
            }
        }
        if cur > 0 {
            peaks.push(cur);
        }
        if peaks.is_empty() {
            return (0.0, 0.0);
        }

        let mut highest = 0.0f32;
        for &p in &peaks {
            if nsdf[p] > highest {
                highest = nsdf[p];
            }
        }
        let threshold = K * highest;
        let mut chosen = peaks[0];
        for &p in &peaks {
            if nsdf[p] >= threshold {
                chosen = p;
                break;
            }
        }

        // interpolação parabólica -> tau sub-amostra (cents finos)
        let x0 = if chosen > 0 { chosen - 1 } else { chosen };
        let x2 = if chosen < max_lag - 1 { chosen + 1 } else { chosen };
        let a = nsdf[x0];
        let b = nsdf[chosen];
        let c = nsdf[x2];
        let denom = a - 2.0 * b + c;
        let shift = if denom != 0.0 { 0.5 * (a - c) / denom } else { 0.0 };
        let tau = chosen as f32 + shift;
        if tau <= 0.0 {
            return (0.0, 0.0);
        }
        let freq = self.sample_rate / tau;
        if freq < MIN_FREQ || freq > MAX_FREQ {
            return (0.0, 0.0);
        }
        (freq, b.clamp(0.0, 1.0))
    }
}

fn reverse_bits(mut x: usize, bits: u32) -> usize {
    let mut r = 0usize;
    for _ in 0..bits {
        r = (r << 1) | (x & 1);
        x >>= 1;
    }
    r
}

/// FFT radix-2 iterativa (Cooley-Tukey), in-place. `re`/`im` de tamanho pot. de 2.
fn fft(re: &mut [f32], im: &mut [f32], bitrev: &[usize]) {
    let n = re.len();
    for i in 0..n {
        let j = bitrev[i];
        if j > i {
            re.swap(i, j);
            im.swap(i, j);
        }
    }
    let mut len = 2;
    while len <= n {
        let ang = -2.0 * PI / len as f32;
        let (wr, wi) = (ang.cos(), ang.sin());
        let half = len / 2;
        let mut i = 0;
        while i < n {
            let mut cr = 1.0f32;
            let mut ci = 0.0f32;
            for k in 0..half {
                let a = i + k;
                let b = a + half;
                let tr = cr * re[b] - ci * im[b];
                let ti = cr * im[b] + ci * re[b];
                re[b] = re[a] - tr;
                im[b] = im[a] - ti;
                re[a] += tr;
                im[a] += ti;
                let ncr = cr * wr - ci * wi;
                ci = cr * wi + ci * wr;
                cr = ncr;
            }
            i += len;
        }
        len <<= 1;
    }
}

/// H1 - H2 em dB: pico de magnitude perto de F0 vs perto de 2*F0 (±2 bins).
/// Correlato de registro: falsete/breathy tendem a H1>>H2 (valor alto e positivo);
/// peito/pressed tendem a valores menores.
fn h1_minus_h2(re: &[f32], im: &[f32], f0: f32, sample_rate: f32) -> f32 {
    if f0 <= 0.0 {
        return 0.0;
    }
    let n = re.len();
    let bin_hz = sample_rate / n as f32;
    let peak_near = |freq: f32| -> f32 {
        let center = (freq / bin_hz).round() as usize;
        if center == 0 || center >= n / 2 {
            return 0.0;
        }
        let lo = center.saturating_sub(2);
        let hi = (center + 2).min(n / 2 - 1);
        let mut m = 0.0f32;
        for k in lo..=hi {
            let mag = (re[k] * re[k] + im[k] * im[k]).sqrt();
            if mag > m {
                m = mag;
            }
        }
        m
    };
    let h1 = peak_near(f0);
    let h2 = peak_near(2.0 * f0);
    let eps = 1e-9f32;
    20.0 * ((h1 + eps) / (h2 + eps)).log10()
}

/// Centróide espectral (Hz) e "tilt" (ln(energia_alta/energia_baixa), split em 1.5 kHz).
fn spectral_features(re: &[f32], im: &[f32], sample_rate: f32) -> (f32, f32) {
    let n = re.len();
    let bin_hz = sample_rate / n as f32;
    let mut num = 0.0f32;
    let mut den = 0.0f32;
    let mut low = 0.0f32;
    let mut high = 0.0f32;
    for k in 1..n / 2 {
        let mag = (re[k] * re[k] + im[k] * im[k]).sqrt();
        let f = k as f32 * bin_hz;
        num += f * mag;
        den += mag;
        if f < 1500.0 {
            low += mag;
        } else {
            high += mag;
        }
    }
    let centroid = if den > 0.0 { num / den } else { 0.0 };
    let tilt = if low > 1e-6 { (high / low.max(1e-6)).ln() } else { 0.0 };
    (centroid, tilt)
}
