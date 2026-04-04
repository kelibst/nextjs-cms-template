import { PublicationForm } from '@/components/dashboard/publication-form'

export default function NewPublicationPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">New Publication</h1>
      <PublicationForm />
    </div>
  )
}
