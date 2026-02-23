/**
 * NIfTI Parser Utility
 * Parses NIfTI (.nii, .nii.gz) files for MRI visualization
 */

import * as nifti from 'nifti-reader-js';

export interface NIfTIData {
  data: number[][][];
  dimensions: [number, number, number];
  voxelDimensions?: [number, number, number];
  datatype?: number;
  description?: string;
  stats?: {
    min: number;
    max: number;
    nonZeroCount: number;
    totalVoxels: number;
  };
}

/**
 * Parse a NIfTI file from an ArrayBuffer
 */
export async function parseNIfTI(
  arrayBuffer: ArrayBuffer,
  filename: string
): Promise<NIfTIData> {
  let data = arrayBuffer;

  // Decompress if gzipped
  if (nifti.isCompressed(data)) {
    data = await nifti.decompressAsync(data);
  }

  // Validate NIfTI format
  if (!nifti.isNIFTI(data)) {
    throw new Error('Invalid NIfTI file format');
  }

  // Read header
  const header = nifti.readHeader(data);
  if (!header) {
    throw new Error('Failed to read NIfTI header');
  }

  // Get dimensions (dims[0] is number of dimensions, dims[1-3] are x,y,z)
  const dims = header.dims;
  const dimX = dims[1];
  const dimY = dims[2];
  const dimZ = dims[3];

  // Get voxel dimensions
  const pixDims = header.pixDims;
  const voxelDimensions: [number, number, number] = [
    pixDims[1],
    pixDims[2],
    pixDims[3],
  ];

  // Read image data
  const imageData = nifti.readImage(header, data);

  // Convert based on datatype
  const typedArray = getTypedArray(header.datatypeCode, imageData);

  // Calculate statistics for debugging
  let min = Infinity;
  let max = -Infinity;
  let nonZeroCount = 0;
  for (let i = 0; i < typedArray.length; i++) {
    const val = typedArray[i];
    if (val < min) min = val;
    if (val > max) max = val;
    if (val !== 0) nonZeroCount++;
  }

  console.log(`[NIfTI Parser] File: ${filename}`);
  console.log(`[NIfTI Parser] Dimensions: ${dimX} x ${dimY} x ${dimZ}`);
  console.log(`[NIfTI Parser] Datatype: ${header.datatypeCode}`);
  console.log(`[NIfTI Parser] Value range: ${min} to ${max}`);
  console.log(`[NIfTI Parser] Non-zero voxels: ${nonZeroCount} / ${typedArray.length} (${(nonZeroCount / typedArray.length * 100).toFixed(2)}%)`);
  console.log(`[NIfTI Parser] Scale slope: ${header.scl_slope}, intercept: ${header.scl_inter}`);

  // Convert to 3D array (x, y, z) with normalized values
  const volume = convertTo3DArray(typedArray, dimX, dimY, dimZ, header);

  return {
    data: volume,
    dimensions: [dimX, dimY, dimZ],
    voxelDimensions,
    datatype: header.datatypeCode,
    description: header.description,
    stats: {
      min,
      max,
      nonZeroCount,
      totalVoxels: typedArray.length,
    },
  };
}

/**
 * Fetch a NIfTI file from a URL and parse it
 */
export async function fetchAndParseNIfTI(
  signedUrl: string,
  filename: string
): Promise<NIfTIData> {
  const response = await fetch(signedUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch NIfTI file: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return parseNIfTI(arrayBuffer, filename);
}

/**
 * Get the appropriate TypedArray for the NIfTI datatype
 */
function getTypedArray(
  datatypeCode: number,
  buffer: ArrayBuffer
): Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array {
  switch (datatypeCode) {
    case 2: // UINT8
      return new Uint8Array(buffer);
    case 4: // INT16
      return new Int16Array(buffer);
    case 8: // INT32
      return new Int32Array(buffer);
    case 16: // FLOAT32
      return new Float32Array(buffer);
    case 64: // FLOAT64
      return new Float64Array(buffer);
    case 256: // INT8
      return new Int8Array(buffer);
    case 512: // UINT16
      return new Uint16Array(buffer);
    case 768: // UINT32
      return new Uint32Array(buffer);
    default:
      // Default to Float32 for unknown types
      console.warn(`Unknown NIfTI datatype: ${datatypeCode}, defaulting to Float32`);
      return new Float32Array(buffer);
  }
}

/**
 * Convert flat typed array to 3D array with normalized values
 */
function convertTo3DArray(
  typedArray: Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array,
  dimX: number,
  dimY: number,
  dimZ: number,
  header: nifti.NIFTI1 | nifti.NIFTI2
): number[][][] {
  // Find min and max for normalization
  let min = Infinity;
  let max = -Infinity;

  for (let i = 0; i < typedArray.length; i++) {
    const val = typedArray[i];
    if (val < min) min = val;
    if (val > max) max = val;
  }

  // Apply scaling if present
  const slope = header.scl_slope || 1;
  const intercept = header.scl_inter || 0;

  if (slope !== 0 && slope !== 1) {
    min = min * slope + intercept;
    max = max * slope + intercept;
  }

  const range = max - min;

  // Create 3D array (x, y, z)
  const volume: number[][][] = [];

  for (let x = 0; x < dimX; x++) {
    const plane: number[][] = [];
    for (let y = 0; y < dimY; y++) {
      const row: number[] = [];
      for (let z = 0; z < dimZ; z++) {
        // NIfTI stores data in x-fastest order (column-major for 3D)
        const idx = x + y * dimX + z * dimX * dimY;
        let val = typedArray[idx];

        // Apply scaling
        if (slope !== 0 && slope !== 1) {
          val = val * slope + intercept;
        }

        // Normalize to 0-1 range
        const normalized = range > 0 ? (val - min) / range : 0;
        row.push(normalized);
      }
      plane.push(row);
    }
    volume.push(plane);
  }

  return volume;
}
