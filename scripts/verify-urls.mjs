import https from 'https';
import http from 'http';
import { URL } from 'url';

const urls = [
  // Projectile Motion
  "https://openstax.org/books/university-physics-volume-1/pages/4-3-projectile-motion",
  "https://openstax.org/books/university-physics-volume-1/pages/4-introduction",
  "https://openstax.org/books/university-physics-volume-1/pages/4-summary",
  
  // Optical Fiber NA
  "https://oc-iitr.vlabs.ac.in/exp/measurement-numerical-aperture/theory.html",
  "https://bop-iitk.vlabs.ac.in/exp/numerical-aperture-measurement/theory.html",
  "https://openstax.org/books/university-physics-volume-3/pages/1-4-total-internal-reflection",
  
  // Colour Sensor
  "https://learn.adafruit.com/adafruit-color-sensors",
  "https://ams-osram.com/products/sensor-solutions/ambient-light-color-spectral-proximity-sensors/ams-tcs34725-color-sensor",
  "https://www.sparkfun.com/products/retired/12829",
  
  // Diffraction Grating
  "https://openstax.org/books/university-physics-volume-3/pages/4-4-diffraction-gratings",
  "https://openstax.org/books/physics/pages/17-2-applications-of-diffraction-interference-and-coherence",
  "https://openstax.org/books/physics/pages/17-1-understanding-diffraction-and-interference",
  
  // Hall Effect
  "https://openstax.org/books/university-physics-volume-3/pages/9-introduction",
  "https://openstax.org/books/university-physics-volume-2/pages/11-7-magnetic-forces-on-current-carrying-conductors",
  "https://bop-iitk.vlabs.ac.in/",
  
  // Diode V-I
  "https://openstax.org/books/university-physics-volume-3/pages/9-7-semiconductor-devices",
  "https://www.electronics-tutorials.ws/diode/diode_1.html",
  "https://www.electronics-tutorials.ws/diode/diode_2.html",
  
  // POF Attenuation
  "https://onlinecourses-archive.nptel.ac.in/noc18_ph06/preview",
  "https://spark.iop.org/attenuation-radiation",
  "https://pmc.ncbi.nlm.nih.gov/articles/PMC3478834/",
  
  // Physics Sandbox
  "https://openstax.org/books/university-physics-volume-1/pages/5-3-newtons-second-law",
  "https://openstax.org/books/university-physics-volume-1/pages/7-introduction",
  "https://openstax.org/books/university-physics-volume-1/pages/preface"
];

function checkUrl(targetUrl, maxRedirects = 5) {
  return new Promise((resolve) => {
    if (maxRedirects < 0) {
      return resolve({ url: targetUrl, status: 0, error: 'Too many redirects' });
    }
    try {
      const u = new URL(targetUrl);
      const client = u.protocol === 'https:' ? https : http;
      const req = client.request(u, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        timeout: 8000
      }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const redirectUrl = new URL(res.headers.location, u).toString();
          return resolve(checkUrl(redirectUrl, maxRedirects - 1));
        }
        resolve({ url: targetUrl, status: res.statusCode, headers: res.headers });
      });
      req.on('error', (err) => {
        // Retry with GET if HEAD not supported
        const getReq = client.request(u, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          timeout: 8000
        }, (res) => {
          resolve({ url: targetUrl, status: res.statusCode });
        });
        getReq.on('error', (e) => resolve({ url: targetUrl, status: 0, error: e.message }));
        getReq.end();
      });
      req.on('timeout', () => {
        req.destroy();
        resolve({ url: targetUrl, status: 0, error: 'Timeout' });
      });
      req.end();
    } catch (e) {
      resolve({ url: targetUrl, status: 0, error: e.message });
    }
  });
}

async function run() {
  console.log(`Checking ${urls.length} URLs...`);
  for (const u of urls) {
    const res = await checkUrl(u);
    console.log(`[${res.status}] ${u} ${res.error ? '(' + res.error + ')' : ''}`);
  }
}

run();
