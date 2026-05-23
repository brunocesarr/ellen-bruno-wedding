export interface TimelineEvent {
  time: string
  label: string
  icon?: string
}

export interface DressCodeColor {
  name: string
  hex: string
}

export interface WeddingDetails {
  couple: {
    bride: string
    groom: string
    initials: string
  }
  date: string
  displayDate: string
  time: string
  location: {
    venue: string
    city: string
    address: string
    mapUrl?: string
  }
  timeline: TimelineEvent[]
  dressCode: DressCodeColor[]
}

export interface RsvpFormData {
  name: string
  attending: boolean
  guests: number
  dietary?: string
  message?: string
}
