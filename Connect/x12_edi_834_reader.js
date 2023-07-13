//This is to parse and extract the contents of X12EDI-834 file

const fs = require('fs');
const path = require('path');

// Read EDI 834 file
const fileContent = fs.readFileSync('FilePath or file', 'utf8');

// Replace the linefeed-LF with ~CRLF and Split the file into segments
const segments = fileContent.replace(/\n/g,'~\r\n').split(/~\r?\n/);
//console.log(segments);

// Initialize an empty array to store the extracted data
const extractedData = [];

// Initialize a flag to determine whether to skip segments
let skipSegments = false;

// Loop over each segment
for (let i = 0; i < segments.length; i++) {
  const segment = segments[i];

  // Extract the segment ID (e.g. INS, NM1, etc.)
  const segmentId = segment.substring(0, 3);

  // Check if the current segment is a DMG segment
  if (segmentId === 'DMG') {
    // Add the DMG segment to the extracted data array
    extractedData.push(segment);

    // Set the skipSegments flag to true to skip segments until the DTP segment is reached
    skipSegments = true;
  } else if (segmentId === 'INS') {
    // Add the DTP segment to the extracted data array
    extractedData.push(segment);

    // Set the skipSegments flag to false to include segments until the next DMG segment is reached
    skipSegments = false;
  } else if (!skipSegments) {
    // Add the segment to the extracted data array if skipSegments is false
    extractedData.push(segment);
  }
}
// Join the extracted segments into a single string
const outputContent = extractedData.join('~\r\n');
console.log(outputContent);

//define an array
const output = [];
const modSegments = outputContent.split(/\r?\n/);
for (let j = 0; j < modSegments.length; j++) {
  const modSegment = modSegments[j];
  if (typeof modSegment === 'string') {
    const fields = modSegment.split('*');
    const segmentCode = fields[0];
    
    //Process INS Segment
    if (segmentCode === 'INS') {
      const updateCode = fields[3];
      output.push({ updateCode: updateCode});
    }
    
    //Process REF Segment
    if (segmentCode === 'REF') {
      const subscriberQualfierrID = fields[1];
      const subscriberId = fields[2];
        if(subscriberQualfierrID === '0F'){
          output[output.length - 1].subscriberId = subscriberId.substring(0,subscriberId.length - 1);
        }
    }

    //Process NM1 Segment
    if (segmentCode === 'NM1') {
      const firstName = fields[4];
      const lastName = fields[3];
      const ssnFlag = fields[8];
      const ssn = fields[9];
      output[output.length - 1].firstName = firstName;
      output[output.length - 1].lastName = lastName;
      if(ssnFlag === '34'){
        output[output.length - 1].ssn = ssn.substring(0,ssn.length - 1 );
      }
    }
    

    //Process DMG Segment 
    else if (segmentCode === 'DMG') {
      const dob = fields[2];
      const gender = fields[3];
      output[output.length - 1].dob = dob;
      output[output.length - 1].gender = gender;
    }

    //Process N3 Segment
    else if (segmentCode === 'N3') {
      const address = fields[1];
      output[output.length - 1].address = address.substring(0,address.length - 1);
    }

    //Process N4 Segment
    else if (segmentCode === 'N4') {
      const city = fields[1];
      const state = fields[2];
      const zip = fields[3];
      output[output.length - 1].city = city;
      output[output.length - 1].state = state;
      output[output.length - 1].zip = zip;
    }

  }
}
fs.writeFileSync('outputfilepath/test_4_op.json', JSON.stringify(output));
console.log(output);
