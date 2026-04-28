/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

/**
 * Generates synthetic PNG image buffers for testing
 */
export function generatePngBuffer(sizeBytes: number): Buffer {
  // PNG file signature
  const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR chunk (13 bytes of data: width, height, bit depth, color type, etc.)
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(1, 0); // width: 1
  ihdrData.writeUInt32BE(1, 4); // height: 1
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // color type (RGB)
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const ihdrChunk = createChunk('IHDR', ihdrData);

  // IDAT chunk (image data) - padded with zeros to reach desired size
  const idatPayloadSize = Math.max(10, sizeBytes - pngSignature.length - ihdrChunk.length - 100);
  const idatData = Buffer.alloc(idatPayloadSize, 0);
  const idatChunk = createChunk('IDAT', idatData);

  // IEND chunk (0 bytes of data)
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([pngSignature, ihdrChunk, idatChunk, iendChunk]);
}

/**
 * Generates synthetic JPEG image buffers for testing
 * Note: This creates a minimal but valid JPEG structure
 */
export function generateJpegBuffer(sizeBytes: number): Buffer {
  // Minimal valid JPEG structure
  const jpegStart = Buffer.from([0xff, 0xd8, 0xff, 0xe0]); // SOI + APP0
  const jfifHeader = Buffer.from([
    0x00, 0x10, // APP0 length
    0x4a, 0x46, 0x49, 0x46, 0x00, // 'JFIF\0'
    0x01, 0x01, // version
    0x00, // units (no units)
    0x00, 0x01, 0x00, 0x01, // X and Y density
    0x00, 0x00 // thumbnail dimensions
  ]);

  // SOF0 (Start of Frame - Baseline DCT)
  const sof0 = Buffer.from([
    0xff, 0xc0, // SOF0 marker
    0x00, 0x11, // length
    0x08, // precision
    0x00, 0x01, 0x00, 0x01, // height and width (1x1)
    0x03, // components
    0x01, 0x22, 0x00, // Y component
    0x02, 0x11, 0x01, // Cb component
    0x03, 0x11, 0x01  // Cr component
  ]);

  // DHT (Define Huffman Table) - minimal table
  const dht = Buffer.from([
    0xff, 0xc4, // DHT marker
    0x00, 0x1f, // length
    0x00, // table class and destination
    0x00, 0x01, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01,
    0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
    0x08, 0x09, 0x0a, 0x0b
  ]);

  // SOS (Start of Scan)
  const sos = Buffer.from([
    0xff, 0xda, // SOS marker
    0x00, 0x0c, // length
    0x03, // components
    0x01, 0x00, // Y component
    0x02, 0x11, // Cb component
    0x03, 0x11, // Cr component
    0x00, 0x3f, 0x00 // spectral selection
  ]);

  // Minimal scan data (can be padded)
  const scanData = Buffer.alloc(Math.max(10, sizeBytes - jpegStart.length - jfifHeader.length - sof0.length - dht.length - sos.length - 10), 0x00);

  // EOI (End of Image)
  const eoi = Buffer.from([0xff, 0xd9]);

  return Buffer.concat([jpegStart, jfifHeader, sof0, dht, sos, scanData, eoi]);
}

/**
 * Helper to create a PNG chunk
 */
function createChunk(type: string, data: Buffer): Buffer {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(0, 0); // Simplified: use 0 for CRC (not proper, but valid for testing)

  return Buffer.concat([length, typeBuffer, data, crc]);
}

/**
 * Creates a buffer of a specific size filled with a pattern
 * Used for testing file size validations
 */
export function generateBufferOfSize(sizeBytes: number, format: 'png' | 'jpeg'): Buffer {
  if (format === 'png') {
    return generatePngBuffer(sizeBytes);
  } else {
    return generateJpegBuffer(sizeBytes);
  }
}
