import Image, { type ImageProps } from 'next/image';

/**
 * next/image mit SVG-Unterstützung: SVGs (z. B. Demo-Illustrationen unter
 * /demo) werden unoptimiert ausgeliefert. So braucht es kein
 * `dangerouslyAllowSVG` in der next.config.
 */
export function SmartImage(props: ImageProps) {
  const src = typeof props.src === 'string' ? props.src : '';
  const isSvg = /\.svg($|\?)/i.test(src);
  // eslint-disable-next-line jsx-a11y/alt-text -- alt kommt über props
  return <Image {...props} unoptimized={props.unoptimized ?? isSvg} />;
}
