const fs = require('fs');

const fn = `
const normalizeValStr = (val) => {
  if (val === null || val === undefined) return '';
  let str = String(val).trim();
  if (str.endsWith('%')) str = str.slice(0, -1).trim();
  return str.toLowerCase();
};

`;

['AddPolicy.jsx', 'EditPolicy.jsx', 'RenewPolicy.jsx'].forEach(file => {
  const filePath = 'src/views/Policy/' + file;
  let code = fs.readFileSync(filePath, 'utf8');

  if (!code.includes('const normalizeValStr')) {
    code = code.replace(/import React/, fn + 'import React');
  }

  // Find all gstData?.find and replace the inside
  code = code.replace(/gstData\?\s*\.\s*find\(\(i\)\s*=>\s*String\(i\._id\)\s*===\s*String\(tpGstId\)\s*\|\|\s*String\(i\.value\)\s*===\s*String\(tpGstId\)\)/g, 'gstData?.find((i) => String(i._id) === String(tpGstId) || normalizeValStr(i.value) === normalizeValStr(tpGstId))');
  code = code.replace(/gstData\?\s*\.\s*find\(\(i\)\s*=>\s*String\(i\._id\)\s*===\s*String\(odGstId\)\s*\|\|\s*String\(i\.value\)\s*===\s*String\(odGstId\)\)/g, 'gstData?.find((i) => String(i._id) === String(odGstId) || normalizeValStr(i.value) === normalizeValStr(odGstId))');
  code = code.replace(/gstData\?\s*\.\s*find\(\(i\)\s*=>\s*String\(i\._id\)\s*===\s*String\(form\.gst\)\s*\|\|\s*String\(i\.value\)\s*===\s*String\(form\.gst\)\)/g, 'gstData?.find((i) => String(i._id) === String(form.gst) || normalizeValStr(i.value) === normalizeValStr(form.gst))');
  code = code.replace(/gstData\?\s*\.\s*find\(\(g\)\s*=>\s*String\(g\._id\)\s*===\s*String\(gstId\)\s*\|\|\s*String\(g\.value\)\s*===\s*String\(gstId\)\)/g, 'gstData?.find((g) => String(g._id) === String(gstId) || normalizeValStr(g.value) === normalizeValStr(gstId))');

  // For AddPolicy and RenewPolicy where it might just be the strict match without String()
  code = code.replace(/gstData\?\s*\.\s*find\(\(i\)\s*=>\s*i\._id\s*===\s*tpGstId\)/g, 'gstData?.find((i) => String(i._id) === String(tpGstId) || normalizeValStr(i.value) === normalizeValStr(tpGstId))');
  code = code.replace(/gstData\?\s*\.\s*find\(\(i\)\s*=>\s*i\._id\s*===\s*odGstId\)/g, 'gstData?.find((i) => String(i._id) === String(odGstId) || normalizeValStr(i.value) === normalizeValStr(odGstId))');
  code = code.replace(/gstData\?\s*\.\s*find\(\(i\)\s*=>\s*i\._id\s*===\s*form\.gst\)/g, 'gstData?.find((i) => String(i._id) === String(form.gst) || normalizeValStr(i.value) === normalizeValStr(form.gst))');
  code = code.replace(/gstData\?\s*\.\s*find\(\(g\)\s*=>\s*g\._id\s*===\s*gstId\)/g, 'gstData?.find((g) => String(g._id) === String(gstId) || normalizeValStr(g.value) === normalizeValStr(gstId))');


  fs.writeFileSync(filePath, code);
  console.log('Fixed ' + file);
});
