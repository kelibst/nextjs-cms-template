import { LeadershipForm } from '@/components/dashboard/leadership-form'

export default function NewLeadershipPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">Add Leadership Member</h1>
      <LeadershipForm />
    </div>
  )
}
