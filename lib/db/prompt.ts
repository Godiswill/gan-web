const promptMap = {
  One01: {
    name: 'Illustration to Figure',
    name_zh: '插画变手办',
    prompt:
      "turn this photo into a character figure. Behind it, place a box with the character's image printed on it, and a computer showing the Blender modeling process on its screen. In front of the box, add a round plastic base with the character figure standing on it. set the scene indoors if possible",
    prompt_zh:
      '将这张照片变成角色手办。在它后面放置一个印有角色图像的盒子，盒子上有一台电脑显示Blender建模过程。在盒子前面添加一个圆形塑料底座，角色手办站在上面。如果可能的话，将场景设置在室内',
  },
  One02: {
    name: 'Anime to Real Coser',
    zh: '动漫转真人Coser',
    prompt:
      'Generate a photo of a girl cosplaying this illustration, with the background set at Comiket',
    prompt_zh: '生成一个女孩cosplay这张插画的照片，背景设置在Comiket',
  },
  One03: {
    name: 'Generate Character Design',
    name_zh: '生成角色设定',
    prompt:
      'Generate character design for me (Character Design). Proportion design (different height comparisons, head-to-body ratio, etc). Three views (front, side, back). Expression design (Expression Sheet) → like the image you sent. Pose design (Pose Sheet) → various common poses. Costume design (Costume Design)',
    prompt_zh:
      '为我生成人物的角色设定（Character Design）。比例设定（不同身高对比、头身比等）。三视图（正面、侧面、背面）。表情设定（Expression Sheet） → 就是你发的那种图。动作设定（Pose Sheet） → 各种常见姿势。服装设定（Costume Design）',
  },
  One04: {
    name: 'Change Multiple Hairstyles',
    name_zh: '',
    prompt:
      'Generate avatars of this person with different hairstyles in a 3x3 grid format',
    prompt_zh: '',
  },
  One05: {
    name: 'Custom Marble Sculpture',
    name_zh: '',
    prompt:
      "A photorealistic image of an ultra-detailed sculpture of the subject in image made of shining marble. The sculpture should display smooth and reflective marble surface, emphasizing its luster and artistic craftsmanship. The design is elegant, highlighting the beauty and depth of marble. The lighting in the image should enhance the sculpture's contours and textures, creating a visually stunning and mesmerizing effect",
    prompt_zh: '',
  },
  One06: {
    name: 'Old Photo Colorization',
    name_zh: '',
    prompt: 'restore and colorize this photo.',
    prompt_zh: '',
  },
  One07: {
    name: 'Movie Storyboard',
    name_zh: '',
    prompt:
      'Create an addictively intriguing 12 part story with 12 images with these two characters in a classic black and white film noir detective story. Make it about missing treasure that they get clues for throughout and then finally discover. The story is thrilling throughout with emotional highs and lows and ending on a great twist and high note. Do not include any words or text on the images but tell the story purely through the imagery itself.',
    prompt_zh: '',
  },
  One08: {
    name: 'Illustration Drawing Process Four-Panel',
    name_zh: '',
    prompt:
      'Generate a four-panel drawing process for the character: Step 1: Line art, Step 2: Flat colors, Step 3: Add shadows, Step 4: Refine and complete. No text.',
    prompt_zh: '',
  },
  One09: {
    name: 'Multiple Character Poses Generation',
    name_zh: '',
    prompt:
      'Please create a pose sheet for this illustration, making various poses!',
    prompt_zh: '',
  },
  One10: {
    name: 'LEGO Minifigure',
    name_zh: '',
    prompt:
      "Transform the person in the photo into a LEGO minifigure packaging box style, presented in isometric perspective. Label the box with the title 'bgg.one'. Inside the box, display the LEGO minifigure based on the person in the photo, along with their essential items (such as makeup, bags, or other items) as LEGO accessories. Beside the box, also display the actual LEGO minifigure itself, unpackaged, rendered in a realistic and vivid style.",
    prompt_zh: '',
  },
  One11: {
    name: 'Place Anime Statue in Real Life',
    name_zh: '',
    prompt:
      'A realistic photographic work. A gigantic statue of this person has been placed in a square in the center of Tokyo, with people looking up at it.',
    prompt_zh: '',
  },
  One12: {
    name: 'Manga Style Conversion',
    name_zh: '',
    prompt:
      'Convert the input photo into a black-and-white manga-style line drawing.',
    prompt_zh: '',
  },
  One13: {
    name: 'Isometric Holographic Wireframe',
    name_zh: '',
    prompt:
      'Based on the uploaded image, convert it into a holographic depiction using wireframe lines only.',
    prompt_zh: '',
  },
  One14: {
    name: 'Create an ID Photo',
    name_zh: '',
    prompt:
      'Crop the head and create a 2-inch ID photo with: 1. Blue background; 2. Professional business attire; 3. Frontal face; 4. Slight smile',
    prompt_zh: '',
  },
  One15: {
    name: 'Generate Miniature Scene from Image',
    name_zh: '',
    prompt: 'Convert the image to isometric view',
    prompt_zh: '',
  },
  One16: {
    name: 'Pirate Wanted Poster',
    name_zh: '',
    prompt:
      "Using the original image, recreate a pirate's wanted poster drawn on parchment. Brown monochrome, with the texture of aged parchment. Retain the style and character design of the original image down to the smallest detail, and paste it large at the top of the wanted poster. A close-up of the face. Have the character wear a pirate hat. Write the bounty amount at the bottom of the poster. The bounty amount will be random, and a fictitious currency unit will be used. Below the bounty amount, write the crime in small letters. Use a fictitious language. English or Chinese characters may not be used.",
    prompt_zh: '',
  },
  One17: {
    name: 'Glass Bottle Souvenir',
    name_zh: '',
    prompt:
      'A 1/7 scale commercialized collectible figure of the character from the photo, crafted in a highly realistic style. The figure is placed in a detailed beach environment with sand, seashells, and gentle ocean waves. The entire toy display is enclosed inside a clear souvenir glass bottle, giving it a premium miniature diorama look, with realistic lighting and shadows',
    prompt_zh: '',
  },
  One18: {
    name: 'Drawing on a Pen Display',
    name_zh: '',
    prompt:
      'Photorealistic pen tablet screen. Realistic first-person hand holding the pen tablet and pen. The original image is reproduced on the pen tablet in an unfinished state. The line art has been extracted from the original image. Portions of the line art have been colored with the same coloring as the original image. Unfinished coloring. Must not be monochrome. About 70% of the coloring is done. Close-up. The pen tip is touching the tablet screen.',
    prompt_zh: '',
  },
  One19: {
    name: '',
    name_zh: '',
    prompt: '',
    prompt_zh: '',
  },
};

type PromptsObject = typeof promptMap;
export type PromptsKey = keyof PromptsObject;
export type PromptsVal = (typeof promptMap)['One01'];

export default promptMap;
