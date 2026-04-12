import type { VirtualArray } from '../src/granite/meteo/meteo-meta.ts';
import { execFile as execFileRaw } from 'node:child_process';
import { promisify } from 'node:util';
import { decode } from 'fast-png';
import { readFile, unlink } from 'node:fs/promises';
import tempfile from 'tempfile';

const execFile = promisify(execFileRaw);

export async function readAvifNode(path: string): Promise<VirtualArray> {
  const recovered = decode(await avifToPng(path));
  return {
    data: (i) => recovered.data[i],
    length: recovered.data.length,
  };
}

async function avifToPng(path: string): Promise<Buffer> {
  const temp = tempfile({
    extension: '.png',
  });

  try {
    await execFile('avifdec', [path, temp]);
    return await readFile(temp);
  } finally {
    await unlink(temp);
  }
}
