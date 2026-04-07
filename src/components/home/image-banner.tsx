import Image from 'next/image'

interface Props {
  imageUrl: string
  alt: string
  caption?: string
}

export function ImageBanner({ imageUrl, alt, caption }: Props) {
  if (!imageUrl) return null
  return (
    <section className="w-full">
      <div className="relative w-full aspect-[21/6] overflow-hidden">
        <Image src={imageUrl} alt={alt} fill className="object-cover" />
      </div>
      {caption && (
        <p className="text-center text-sm text-muted-foreground mt-2 px-4">{caption}</p>
      )}
    </section>
  )
}
