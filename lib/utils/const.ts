export const exampleImgs = [
  { src: '/images/car.jpg', alt: 'Car | AI Background Remover - BgGone' },
  { src: '/images/dog.jpg', alt: 'Pet | AI Background Removal - BgGone' },
  { src: '/images/eagle.jpg', alt: 'Animal | AI Remove Background - BgGone' },
  {
    src: '/images/love.jpg',
    alt: 'People | AI Remove the Background of people - BgGone',
  },
  { src: '/images/motorcycle.jpg', alt: 'Sports | AI Remove Bg - BgGone' },
];

export const smallModelKey = 'WasmOnnxModel';

export const inputId = 'input-select-img';

export const IMAGE_SIZES = [
  { label: 'Landscape 4:3 (1024×768)', value: 'landscape_4_3' },
  { label: 'Landscape 16:9 (1024×576)', value: 'landscape_16_9' },
  { label: 'Square 1:1 (512×512)', value: 'square' },
  { label: 'Square HD 1:1 (1024×1024)', value: 'square_hd' },
  { label: 'Portrait 3:4 (768×1024)', value: 'portrait_4_3' },
  { label: 'Portrait 9:16 (576×1024)', value: 'portrait_16_9' },
];

export const OUTPUT_FORMATS = [
  { label: 'PNG', value: 'png' },
  { label: 'JPEG', value: 'jpeg' },
];

export const NUMBER_OF_IMAGES = [
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4', value: 4 },
];
