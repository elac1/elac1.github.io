// Run with: node scripts/generate-post-covers.mjs
// Experimental images come from the articles; diagrams describe their actual subjects.
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const output = new URL('../public/images/covers/', import.meta.url)
await mkdir(output, { recursive: true })
const palette = { blue: '#9cbcd5', violet: '#bca9d9', gold: '#d4b98d', text: '#e7e7ec', muted: '#8c94a8' }
const text = (x, y, content, size = 30, color = palette.text, anchor = 'start') =>
  `<text x="${x}" y="${y}" fill="${color}" font-family="ui-monospace,monospace" font-size="${size}" text-anchor="${anchor}">${content}</text>`
const line = (d, color = palette.blue, extra = '', width = 5) =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`
const box = (x, y, w, h, color = palette.blue) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="#1c2230" stroke="${color}" stroke-width="3"/>`
const dot = (x, y, color = palette.blue, radius = 13) =>
  `<circle cx="${x}" cy="${y}" r="${radius}" fill="#151923" stroke="${color}" stroke-width="5"/>`
function svg(title, content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540" role="img" aria-label="${title}">
<title>${title}</title><rect width="960" height="540" fill="#151923"/>
${content}</svg>`
}
async function diagram(name, title, content) {
  await writeFile(new URL(`${name}.svg`, output), svg(title, content))
}

// PCA: preserve the four actual eigenfaces, removing plot margins for a wide thumbnail.
const faces = fileURLToPath(new URL('../public/images/face-recognition/eigenfaces-cover.png', import.meta.url))
const faceCrops = [
  { left: 65, top: 47, width: 307, height: 373 },
  { left: 529, top: 47, width: 307, height: 373 },
  { left: 65, top: 496, width: 307, height: 373 },
  { left: 529, top: 496, width: 307, height: 373 }
]
const faceTiles = await Promise.all(
  faceCrops.map(async (crop, i) => ({
    input: await sharp(faces).extract(crop).resize(190, 300, { fit: 'contain', background: '#202431' }).toBuffer(),
    left: 55 + i * 220,
    top: 110
  }))
)
await sharp({ create: { width: 960, height: 540, channels: 3, background: '#151923' } })
  .composite([
    ...faceTiles,
    {
      input: Buffer.from(
        svg(
          'PCA eigenfaces',
          text(55, 68, 'PCA / EIGENFACES', 28, palette.violet) +
            [3, 4, 8, 9].map((pc, i) => text(150 + i * 220, 465, `PC ${pc}`, 27, palette.muted, 'middle')).join('')
        ).replace('<rect width="960" height="540" fill="#151923"/>', '')
      ),
      left: 0,
      top: 0
    }
  ])
  .webp({ quality: 90 })
  .toFile(new URL('opencv-face-recognition.webp', output).pathname)

// LBP: the article's disaster scene and its corresponding texture result, not a face.
const ruins = fileURLToPath(new URL('../public/images/lbp/lbp-ruins.png', import.meta.url))
const sceneTiles = await Promise.all(
  [21, 1077].map(async (left, i) => ({
    input: await sharp(ruins).extract({ left, top: 16, width: 500, height: 500 }).resize(390, 390).toBuffer(),
    left: i === 0 ? 55 : 515,
    top: 74
  }))
)
await sharp({ create: { width: 960, height: 540, channels: 3, background: '#151923' } })
  .composite([
    ...sceneTiles,
    {
      input: Buffer.from(
        svg(
          'Disaster scene and LBP texture',
          text(250, 510, 'SCENE', 26, palette.muted, 'middle') +
            text(710, 510, 'LBP TEXTURE', 26, palette.violet, 'middle') +
            line('M463 270 H497 M486 259 L497 270 L486 281', palette.violet)
        ).replace('<rect width="960" height="540" fill="#151923"/>', '')
      ),
      left: 0,
      top: 0
    }
  ])
  .webp({ quality: 90 })
  .toFile(new URL('lbp-disaster-recognition.webp', output).pathname)

await diagram(
  'gazebo-zombie-process',
  'Gazebo: a remaining gzserver occupies port 11345',
  text(64, 68, 'GAZEBO / PROCESS DEBUGGING', 27, palette.muted) +
    box(64, 125, 330, 125, palette.gold) +
    text(100, 181, 'gzserver', 40) +
    text(100, 221, 'still running', 26, palette.gold) +
    box(64, 315, 330, 125, palette.muted) +
    text(100, 373, 'gzserver', 40) +
    text(100, 414, 'new instance', 26, palette.muted) +
    box(603, 204, 292, 160, palette.gold) +
    text(749, 272, '11345', 56, palette.gold, 'middle') +
    text(749, 319, 'PORT IN USE', 26, palette.muted, 'middle') +
    line('M394 185 H488 Q516 185 516 213 V250 H603', palette.gold) +
    line('M394 378 H516 V315 H555', palette.muted, 'stroke-dasharray="10 12"') +
    line('M563 297 L593 327 M593 297 L563 327', '#c88f8f')
)

await diagram(
  'ros2-launch-file',
  'ROS 2: a launch file starts Gazebo, robot state publisher, and RViz2',
  text(64, 68, 'ROS 2 / LAUNCH', 27, palette.muted) +
    box(282, 116, 396, 112, palette.blue) +
    text(480, 185, 'launch.py', 44, palette.blue, 'middle') +
    line('M480 228 V283 M176 283 H784 M176 283 V338 M480 283 V338 M784 283 V338', palette.blue) +
    dot(480, 283, palette.blue, 9) +
    box(60, 338, 232, 128, palette.gold) +
    text(176, 415, 'Gazebo', 36, palette.gold, 'middle') +
    box(364, 338, 232, 128, palette.violet) +
    text(480, 390, 'robot_state', 26, palette.violet, 'middle') +
    text(480, 431, 'publisher', 28, palette.violet, 'middle') +
    box(668, 338, 232, 128, palette.blue) +
    text(784, 415, 'RViz2', 36, palette.blue, 'middle')
)

// Top view follows the article: + arms, four rotors, four corner wheels, central IMU.
const rotors = [
  [360, 114],
  [360, 426],
  [204, 270],
  [516, 270]
]
const wheels = [
  [273, 183],
  [447, 183],
  [273, 357],
  [447, 357]
]
await diagram(
  'land-air-robot-urdf',
  'URDF: plus-frame quadrotor with four wheels and a central IMU',
  line('M204 270 H516 M360 114 V426', palette.blue, '', 14) +
    `<rect x="288" y="198" width="144" height="144" rx="10" fill="#222c3b" stroke="${palette.blue}" stroke-width="4"/>` +
    wheels
      .map(([x, y]) => `<rect x="${x - 30}" y="${y - 10}" width="60" height="20" rx="7" fill="${palette.gold}"/>`)
      .join('') +
    rotors
      .map(
        ([x, y]) =>
          `<circle cx="${x}" cy="${y}" r="60" fill="#1b2130" stroke="${palette.blue}" stroke-width="3"/>` +
          `<ellipse cx="${x}" cy="${y}" rx="48" ry="9" fill="${palette.blue}" transform="rotate(-30 ${x} ${y})"/>` +
          dot(x, y, palette.blue, 7)
      )
      .join('') +
    `<rect x="345" y="255" width="30" height="30" rx="4" fill="${palette.violet}"/>` +
    text(650, 151, 'URDF', 52, palette.blue) +
    text(650, 194, '+ XACRO', 28, palette.muted) +
    line('M652 231 V391 M652 251 H695 M652 321 H695 M652 391 H695', palette.muted) +
    text(715, 261, '4 rotors', 28) +
    text(715, 331, '4 wheels', 28) +
    text(715, 401, 'IMU', 28, palette.violet)
)

await diagram(
  'hardware-basics',
  'Control board, servo, and IMU: PWM output and I2C sensing',
  text(64, 68, 'ROBOTICS / HARDWARE', 27, palette.muted) +
    box(92, 170, 300, 228, palette.blue) +
    `<rect x="175" y="226" width="132" height="112" rx="8" fill="#29364a" stroke="${palette.blue}" stroke-width="3"/>` +
    [0, 1, 2, 3, 4, 5]
      .map(
        (i) =>
          `<rect x="${121 + i * 44}" y="184" width="15" height="14" fill="${palette.gold}"/><rect x="${121 + i * 44}" y="370" width="15" height="14" fill="${palette.gold}"/>`
      )
      .join('') +
    text(241, 295, 'MCU', 39, palette.blue, 'middle') +
    line('M392 227 H555 V167 H654', palette.gold) +
    text(475, 206, 'PWM', 25, palette.gold) +
    box(654, 104, 210, 135, palette.gold) +
    `<circle cx="759" cy="132" r="29" fill="#151923" stroke="${palette.gold}" stroke-width="4"/>` +
    line('M730 132 H788', palette.gold) +
    text(759, 213, 'SERVO', 31, palette.gold, 'middle') +
    line('M654 385 H498 V335 H392', palette.violet) +
    text(490, 420, 'I2C', 25, palette.violet) +
    box(654, 319, 210, 133, palette.violet) +
    text(759, 398, 'IMU', 40, palette.violet, 'middle')
)

await diagram(
  'git-knowledge',
  'Git: commits, a feature branch, and a merge back to main',
  text(64, 68, 'GIT / BRANCH &amp; MERGE', 27, palette.muted) +
    text(86, 191, 'main', 30, palette.blue) +
    text(347, 417, 'feature', 30, palette.violet) +
    line('M100 260 H860', palette.blue) +
    line('M260 260 C322 260 320 350 390 350 H570 C640 350 638 260 700 260', palette.violet) +
    [100, 260, 480, 700, 860].map((x) => dot(x, 260, palette.blue, 17)).join('') +
    [390, 570].map((x) => dot(x, 350, palette.violet, 17)).join('') +
    dot(700, 260, palette.gold, 18) +
    text(700, 191, 'merge', 30, palette.gold, 'middle')
)

process.stdout.write('Generated seven article covers in public/images/covers/\n')
