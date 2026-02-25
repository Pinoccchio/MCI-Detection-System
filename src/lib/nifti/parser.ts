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

  // Only log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[NIfTI Parser] File: ${filename}, Dims: ${dimX}x${dimY}x${dimZ}, Range: ${min}-${max}, NonZero: ${nonZeroCount}/${typedArray.length}`);
  }

  // Convert to 3D array (x, y, z) with normalized values
  // Pass precomputed min/max to avoid redundant calculation
  const volume = convertTo3DArray(typedArray, dimX, dimY, dimZ, header, min, max);

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
 * Options for fetchAndParseNIfTI
 */
export interface FetchNIfTIOptions {
  /** Timeout in milliseconds (default: 60000 = 60 seconds) */
  timeoutMs?: number;
  /** AbortSignal for external cancellation */
  signal?: AbortSignal;
  /** Progress callback for download tracking */
  onProgress?: (loaded: number, total: number) => void;
}

/**
 * Fetch a NIfTI file from a URL and parse it
 * Supports timeout, abort signal, and progress tracking for large files
 */
export async function fetchAndParseNIfTI(
  signedUrl: string,
  filename: string,
  options?: FetchNIfTIOptions
): Promise<NIfTIData> {
  const timeoutMs = options?.timeoutMs ?? 60000; // 60 second default
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  // Combine with external signal if provided
  let signal: AbortSignal;
  if (options?.signal) {
    // Create a combined abort signal
    const combinedController = new AbortController();

    // Abort if either signal fires
    const abortHandler = () => combinedController.abort();
    controller.signal.addEventListener('abort', abortHandler);
    options.signal.addEventListener('abort', abortHandler);

    // If external signal is already aborted, abort immediately
    if (options.signal.aborted) {
      combinedController.abort();
    }

    signal = combinedController.signal;
  } else {
    signal = controller.signal;
  }

  try {
    const response = await fetch(signedUrl, { signal });

    if (!response.ok) {
      throw new Error(`Failed to fetch NIfTI file: ${response.statusText}`);
    }

    // Get content length for progress
    const contentLength = response.headers.get('content-length');
    const total = contentLength ? parseInt(contentLength, 10) : 0;

    // If progress callback and content-length available, stream with progress
    if (options?.onProgress && total > 0 && response.body) {
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let loaded = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        loaded += value.length;
        options.onProgress(loaded, total);
      }

      // Combine chunks into single ArrayBuffer
      const arrayBuffer = new Uint8Array(loaded);
      let offset = 0;
      for (const chunk of chunks) {
        arrayBuffer.set(chunk, offset);
        offset += chunk.length;
      }
      return parseNIfTI(arrayBuffer.buffer, filename);
    }

    // Fallback to simple arrayBuffer() if no progress needed
    const arrayBuffer = await response.arrayBuffer();
    return parseNIfTI(arrayBuffer, filename);
  } catch (err: unknown) {
    // Provide more helpful error messages
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        // Check if it was a timeout or user cancellation
        if (options?.signal?.aborted) {
          throw new Error('Loading cancelled');
        }
        throw new Error(`Loading timed out after ${timeoutMs / 1000} seconds`);
      }
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
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
 * Optimized version: pre-allocates arrays and reuses min/max from stats
 */
function convertTo3DArray(
  typedArray: Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array,
  dimX: number,
  dimY: number,
  dimZ: number,
  header: nifti.NIFTI1 | nifti.NIFTI2,
  precomputedMin?: number,
  precomputedMax?: number
): number[][][] {
  // Use precomputed values if available, otherwise compute
  let min = precomputedMin ?? Infinity;
  let max = precomputedMax ?? -Infinity;

  if (precomputedMin === undefined || precomputedMax === undefined) {
    for (let i = 0; i < typedArray.length; i++) {
      const val = typedArray[i];
      if (val < min) min = val;
      if (val > max) max = val;
    }
  }

  // Apply scaling if present
  const slope = header.scl_slope || 1;
  const intercept = header.scl_inter || 0;
  const applyScaling = slope !== 0 && slope !== 1;

  if (applyScaling) {
    min = min * slope + intercept;
    max = max * slope + intercept;
  }

  const range = max - min;
  const invRange = range > 0 ? 1 / range : 0;

  // Pre-allocate 3D array for better performance
  const volume: number[][][] = new Array(dimX);

  for (let x = 0; x < dimX; x++) {
    const plane: number[][] = new Array(dimY);
    for (let y = 0; y < dimY; y++) {
      const row: number[] = new Array(dimZ);
      const baseIdx = x + y * dimX;
      for (let z = 0; z < dimZ; z++) {
        // NIfTI stores data in x-fastest order (column-major for 3D)
        const idx = baseIdx + z * dimX * dimY;
        let val = typedArray[idx];

        // Apply scaling
        if (applyScaling) {
          val = val * slope + intercept;
        }

        // Normalize to 0-1 range (using multiplication instead of division)
        row[z] = (val - min) * invRange;
      }
      plane[y] = row;
    }
    volume[x] = plane;
  }

  return volume;
}
