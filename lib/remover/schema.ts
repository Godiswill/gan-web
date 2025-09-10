export { ConfigSchema, validateConfig };
export type { Config };

import { z } from 'zod';

import { webgpu } from './features';

// import pkg from '../package.json';

const ConfigSchema = z
  .object({
    publicPath: z
      .string()
      .optional()
      .describe('The public path to the wasm files and the onnx model.')
      .default(
        'https://staticimgly.com/@imgly/background-removal-data/${PACKAGE_VERSION}/dist/'
      )
      .transform((val) => {
        return (
          val
            // .replace('${PACKAGE_NAME}', pkg.name)
            // .replace('${PACKAGE_VERSION}', pkg.version);
            .replace('${PACKAGE_VERSION}', '1.5.3')
        );
      }),
    debug: z
      .boolean()
      .default(false)
      .describe('Whether to enable debug logging.'),
    rescale: z
      .boolean()
      .default(true)
      .optional()
      .describe('Whether to rescale the image.'),
    device: z
      .enum(['cpu', 'gpu'])
      .default('cpu')
      .describe('The device to run the model on.'),
    proxyToWorker: z
      .boolean()
      .default(true)
      .optional()
      .describe('Whether to proxy inference to a web worker.'),
    fetchArgs: z
      .any()
      .default({})
      .optional()
      .describe('Arguments to pass to fetch when loading the model.'),
    progress: z
      .function({
        input: [z.string(), z.number(), z.number()],
        output: z.void(),
      })
      // .args(z.string(), z.number(), z.number())
      // .returns(z.void())
      .describe('Progress callback.')
      .optional(),
    model: z
      .preprocess((val) => {
        switch (val) {
          case 'large':
            return 'isnet';
          case 'small':
            return 'isnet_quint8';
          case 'medium':
            return 'isnet_fp16';
          default:
            return val;
        }
      }, z.enum(['isnet', 'isnet_fp16', 'isnet_quint8']))
      .default('isnet_fp16')
      .optional(),
    mInfo: z
      .object({
        inputKey: z.string(),
        size: z.number(),
        modelUrl: z.string(),
      })
      .default({
        inputKey: 'input',
        size: 1024,
        modelUrl: '',
      })
      .optional(),
    output: z
      .object({
        format: z.enum([
          'image/png',
          'image/jpeg',
          'image/webp',
          'image/x-rgba8',
          'image/x-alpha8',
        ]),
        quality: z.number(),
      })
      .default({
        format: 'image/png',
        quality: 0.8,
      }),
  })
  .transform((config) => {
    if (config.debug) console.log('Config:', config);
    if (config.debug && !config.progress) {
      config.progress =
        config.progress ??
        ((key, current, total) => {
          console.debug(`Downloading ${key}: ${current} of ${total}`);
        });

      if (!crossOriginIsolated) {
        if (config.debug)
          console.debug(
            'Cross-Origin-Isolated is not enabled. Performance will be degraded. Please see  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer.'
          );
      }
    }

    // always switch to gpu

    if (config.device == 'gpu') {
      if (!webgpu()) {
        if (config.debug)
          console.debug('Switching to CPU for GPU not supported.');
        config.device = 'cpu';
      }
    }
    return config;
  });

type Config = z.infer<typeof ConfigSchema>;

function validateConfig(configuration?: Config): Config {
  return ConfigSchema.parse(configuration ?? {});
}
