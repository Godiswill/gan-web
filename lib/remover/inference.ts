export { initInference, runInference };

import { tensorResizeBilinear, tensorHWCtoBCHW } from './utils';
import { createOnnxSession, runOnnxSession } from './onnx';
import { validateConfig } from './schema';
import type { Config } from './schema';

import { loadAsBlob } from './resource';
import ndarray from 'ndarray';
import type { NdArray } from 'ndarray';
import { convertFloat32ToUint8 } from './utils';

async function initBase(config: Config): Promise<unknown> {
  const url = config.mInfo?.modelUrl;
  if (url) {
    if (config.debug) console.debug('Loading model...', url);
    const session = await createOnnxSession(url, config);
    return session;
  }

  if (config.debug) console.debug('Loading model...', config.model);
  const model = config.model;
  const blob = await loadAsBlob(`/models/${model}`, config);
  const arrayBuffer = await blob.arrayBuffer();
  const session = await createOnnxSession(arrayBuffer, config);
  return session;
}

async function initInference(
  config?: Config
): Promise<{ config: Config; session: { base: unknown } }> {
  config = validateConfig(config);
  const base = await initBase(config);
  console.log(config);
  return { config, session: { base } };
}

async function runInference(
  imageTensor: NdArray<Uint8Array>,
  config: Config,
  session: { base: unknown }
): Promise<[NdArray<Uint8Array>, NdArray<Uint8Array>]> {
  const resolution = config.mInfo?.size || 1024;
  const [srcHeight, srcWidth, srcChannels] = imageTensor.shape;
  const keepAspect = false;

  let resizedImageTensor = tensorResizeBilinear(
    imageTensor,
    resolution,
    resolution,
    keepAspect
  );

  const inputTensor = tensorHWCtoBCHW(resizedImageTensor); // this converts also from float to rgba

  let predictionsDict = await runOnnxSession(
    session.base,
    [[config.mInfo?.inputKey || 'input', inputTensor]],
    // ['output'],
    config
  );

  let alphamask = ndarray(predictionsDict[0].data, [resolution, resolution, 1]);

  let alphamaskU8 = convertFloat32ToUint8(alphamask);
  if (config.rescale) {
    alphamaskU8 = tensorResizeBilinear(
      alphamaskU8,
      srcWidth,
      srcHeight,
      keepAspect
    );
    return [alphamaskU8, imageTensor];
  } else {
    return [alphamaskU8, resizedImageTensor];
  }
}
