const pdfParse = require('pdf-parse');
async function go() {
  const response = await fetch('https://example.com/priya-resume.pdf');
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const data = await pdfParse(buffer);
  console.log('Result:', data.text);
}
go().catch(console.error);
