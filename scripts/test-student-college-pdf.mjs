import fs from 'fs';
import path from 'path';
import { generateLabReportPdf } from '../src/pdf-export.js';

// Setup mock global localStorage
const storage = {};
global.localStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; },
  clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
};

console.log('=== TEST 1: Config explicitly provides student & college ===');
{
  const doc = generateLabReportPdf({
    experimentCode: 'EXP-01',
    studentName: 'Dr. Eleanor Vance',
    collegeName: 'CERN Particle Accelerator Lab'
  });
  const buf = Buffer.from(doc.output('arraybuffer'));
  const text = buf.toString('latin1');
  if (!text.includes('Dr. Eleanor Vance')) throw new Error('Failed to find student name in explicit PDF');
  if (!text.includes('CERN Particle Accelerator Lab')) throw new Error('Failed to find college name in explicit PDF');
  console.log('✓ Explicit test passed');
}

console.log('=== TEST 2: Fallback to localStorage (saved profile with college) ===');
{
  global.localStorage.setItem('physix_user_profile', JSON.stringify({
    name: 'Jeshurun Selvakumar',
    college: 'SIES Graduate School of Technology',
    edu: 'Undergraduate Researcher'
  }));

  const doc = generateLabReportPdf({
    experimentCode: 'EXP-02'
    // studentName and collegeName omitted
  });
  const buf = Buffer.from(doc.output('arraybuffer'));
  const text = buf.toString('latin1');
  if (!text.includes('Jeshurun Selvakumar')) throw new Error('Failed to retrieve student name from localStorage fallback');
  if (!text.includes('SIES Graduate School of Technology')) throw new Error('Failed to retrieve college name from localStorage fallback');
  console.log('✓ Fallback from localStorage (college field) test passed');
}

console.log('=== TEST 3: Fallback to legacy occ field in localStorage ===');
{
  global.localStorage.setItem('physix_user_profile', JSON.stringify({
    name: 'Kshitij Jadhav',
    occ: 'MIT Physics Lab / Student'
  }));

  const doc = generateLabReportPdf({
    experimentCode: 'EXP-06-DIODE',
    studentName: 'Guest Student', // generic default passed by experiment
    collegeName: '---' // default passed by experiment
  });
  const buf = Buffer.from(doc.output('arraybuffer'));
  const text = buf.toString('latin1');
  if (!text.includes('Kshitij Jadhav')) throw new Error('Failed to override generic Guest Student with localStorage profile');
  if (!text.includes('MIT Physics Lab / Student')) throw new Error('Failed to retrieve college from legacy occ field in localStorage');
  console.log('✓ Fallback from legacy occ field test passed');
}

console.log('=== TEST 4: Genuinely empty profile displays Guest Student and exact "---" ===');
{
  global.localStorage.clear();
  const doc = generateLabReportPdf({
    experimentCode: 'EXP-04'
  });
  const buf = Buffer.from(doc.output('arraybuffer'));
  const text = buf.toString('latin1');
  if (!text.includes('Guest Student')) throw new Error('Expected Guest Student for empty profile');
  if (!text.includes('---')) throw new Error('Expected --- for unavailable college');
  if (text.includes('(undefined)') || text.includes('(null)')) throw new Error('Defective literal undefined/null text in PDF');
  console.log('✓ Empty profile fallback test passed: "Guest Student" and exact "---" displayed without undefined/null');
}

console.log('\nALL 4 STUDENT & COLLEGE PDF RESOLUTION TESTS PASSED SUCCESSFULLY!');
