import NextImage from "next/image";

interface ImageProps {
  src: string;
  alt: string;
  caption?: string;
}

export default function Image({ src, alt, caption }: ImageProps) {
  return (
    <figure>
      <NextImage
        src={src}
        alt={alt}
        width={800}
        height={450}
        className="rounded-md w-full h-auto"
      />
      {caption && (
        <p className="text-sm text-inkMuted text-center mt-2">{caption}</p>
      )}
    </figure>
  );
}
