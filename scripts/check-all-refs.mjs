async function checkRefs() {
  const exp = await import('../src/experiment-details-data.js');
  const details = exp.EXPERIMENT_DETAILS;
  const list = ['projectile', 'optical', 'colour-sensor', 'diffraction', 'hall-effect', 'diode', 'pof-attenuation', 'sandbox'];
  for (const id of list) {
    console.log(`\n=================== ${id} ===================`);
    const data = details[id];
    if (!data) {
      console.log('NOT FOUND');
      continue;
    }
    console.log(`Title: ${data.title}`);
    console.log('Reference books count:', data.referenceBooks ? data.referenceBooks.length : 0);
    if (data.referenceBooks) {
      data.referenceBooks.forEach((r, idx) => {
        console.log(`  [${idx + 1}] ${r.title} | ${r.source} | ${r.url}`);
        console.log(`      ${r.description}`);
      });
    }
  }
}

checkRefs().catch(console.error);
