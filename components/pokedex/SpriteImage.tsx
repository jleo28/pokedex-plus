import Image from 'next/image';

interface SpriteImageProps {
  src: string;
  name: string;
  size?: number;
  className?: string;
}

export function SpriteImage({ src, name, size = 96, className }: SpriteImageProps) {
  return (
    <Image
      src={src}
      alt={name}
      width={size}
      height={size}
      className={className}
      style={{ imageRendering: 'pixelated' }}
      unoptimized
    />
  );
}
