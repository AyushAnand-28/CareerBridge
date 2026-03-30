const fs = require('fs');
const pdfParse = require('pdf-parse');

async function test() {
  const content = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 135 >>
stream
BT
/F1 12 Tf
50 750 Td
(Test Application Resume) Tj
0 -20 Td
(Skills: React, Node.js, Frontend, TypeScript) Tj
0 -20 Td
(Experience: 5 years) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000244 00000 n
0000000430 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
518
%%EOF`;

  fs.writeFileSync('test.pdf', content);
  const buffer = fs.readFileSync('test.pdf');
  try {
    const data = await pdfParse(buffer);
    console.log('EXTRACTED TEXT:', data.text);
    console.log('PAGES:', data.numpages);
  } catch (e) {
    console.error('PARSE ERROR', e);
  }
}
test();
