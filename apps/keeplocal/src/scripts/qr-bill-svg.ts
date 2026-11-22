/**
 * Draws the shapes of a QR-bill (src/lib/qr-bill-layout.ts) in the browser:
 * as SVG for the preview, and the QR code alone as SVG or PNG file.
 */
import { QR_SIZE, qrCodeShapes, qrPath, scissorsPath, type Shape } from '../lib/qr-bill-layout';

const SVG_NS = 'http://www.w3.org/2000/svg';
const MM_PER_PT = 25.4 / 72;
/** The font of the PDF (public/fonts, loaded with @font-face in SwissQrBill.astro); the others look the same. */
const FONT = "'QR Bill Sans', Arial, Helvetica, sans-serif";

function element(name: string, attributes: Record<string, string | number>): SVGElement {
  const node = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, String(value));
  return node;
}

/** One shape as SVG element(s). Units are mm (the <svg> has viewBox "0 0 210 105"). */
function shapeElements(shape: Shape): SVGElement[] {
  switch (shape.type) {
    case 'text': {
      const node = element('text', {
        x: shape.x,
        y: shape.y,
        'font-family': FONT,
        'font-size': shape.size * MM_PER_PT,
        'font-weight': shape.bold ? 700 : 400,
        'text-anchor': shape.align === 'right' ? 'end' : 'start',
      });
      node.textContent = shape.text; // names and addresses: always as text, never as HTML
      return [node];
    }
    case 'line':
      return [
        element('line', {
          x1: shape.x1,
          y1: shape.y1,
          x2: shape.x2,
          y2: shape.y2,
          stroke: '#000',
          'stroke-width': shape.width * MM_PER_PT,
          ...(shape.dashed ? { 'stroke-dasharray': `${4 * MM_PER_PT} ${3 * MM_PER_PT}` } : {}),
        }),
      ];
    case 'rect':
      return [element('rect', { x: shape.x, y: shape.y, width: shape.width, height: shape.height, fill: shape.color === 'black' ? '#000' : '#fff' })];
    case 'qr':
      return [
        element('path', {
          d: qrPath(shape),
          transform: `translate(${shape.x} ${shape.y}) scale(${shape.size / shape.count})`,
          fill: '#000',
          'shape-rendering': 'crispEdges',
        }),
      ];
    case 'scissors': {
      const half = shape.size / 2;
      return [
        element('rect', { x: shape.x - half, y: shape.y - half, width: shape.size, height: shape.size, fill: '#fff' }),
        element('path', { d: scissorsPath(shape), fill: 'none', stroke: '#000', 'stroke-width': shape.size / 12, 'stroke-linecap': 'round' }),
      ];
    }
  }
}

/** Replaces the content of an <svg> with the given shapes. */
export function drawShapes(svg: SVGSVGElement, shapes: Shape[]): void {
  svg.replaceChildren(...shapes.flatMap(shapeElements));
}

/** The standard asks for 5 mm of white space around the QR code; the files include it. */
const QUIET_ZONE = 5;
const QR_FILE_SIZE = QR_SIZE + 2 * QUIET_ZONE;

/** The QR code (with Swiss cross) as an SVG file, 56 × 56 mm – programs place it at the right size. */
export function qrCodeSvgFile(payload: string): Blob {
  const svg = element('svg', {
    xmlns: SVG_NS,
    width: `${QR_FILE_SIZE}mm`,
    height: `${QR_FILE_SIZE}mm`,
    viewBox: `0 0 ${QR_FILE_SIZE} ${QR_FILE_SIZE}`,
  }) as SVGSVGElement;
  drawShapes(svg, [
    { type: 'rect', x: 0, y: 0, width: QR_FILE_SIZE, height: QR_FILE_SIZE, color: 'white' },
    ...qrCodeShapes(payload, QUIET_ZONE, QUIET_ZONE),
  ]);
  return new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' });
}

/**
 * The QR code as a canvas (for the PNG download). Every square of the code gets exactly
 * 10 × 10 pixels, so the edges are sharp – about 400 dpi at 46 mm.
 */
export function qrCodeCanvas(payload: string): HTMLCanvasElement {
  // Shapes at 0/0, so a shape's x/y in mm × pxPerMm is its pixel position inside the code.
  const shapes = qrCodeShapes(payload, 0, 0);
  const code = shapes.find((shape) => shape.type === 'qr')!;
  const pxPerMm = 10 / (QR_SIZE / code.count);
  const margin = Math.round(QUIET_ZONE * pxPerMm); // whole pixels, so the squares stay sharp
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = code.count * 10 + 2 * margin;
  const context = canvas.getContext('2d')!;
  context.fillStyle = '#fff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.translate(margin, margin);
  for (const shape of shapes) {
    if (shape.type === 'qr') {
      context.save();
      context.scale(10, 10); // the path is in squares; each square is 10 px
      context.fillStyle = '#000';
      context.fill(new Path2D(qrPath(shape)));
      context.restore();
    } else if (shape.type === 'rect') {
      context.fillStyle = shape.color === 'black' ? '#000' : '#fff';
      context.fillRect(shape.x * pxPerMm, shape.y * pxPerMm, shape.width * pxPerMm, shape.height * pxPerMm);
    }
  }
  return canvas;
}
