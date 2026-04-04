import { AlbumForm } from '@/components/dashboard/album-form'

export default function NewAlbumPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">New Album</h1>
      <AlbumForm />
    </div>
  )
}
