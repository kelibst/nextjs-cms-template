import { EventForm } from '@/components/dashboard/event-form'

export default function NewEventPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">New Event</h1>
      <EventForm />
    </div>
  )
}
