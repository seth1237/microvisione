import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const COMPANY = {
  name: 'Microvision Enterprises Ltd',
  shortName: 'Microvision',
  tagline: 'Medical and laboratory equipment in Kenya.',
  domain: 'www.microvisione.com',
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.microvisione.com').replace(/\/$/, ''),
  email: 'enquiries@microvisione.com',
  salesEmail: 'enquiries@microvisione.com',
  careersEmail: 'enquiries@microvisione.com',
  phone: '0790 669 988',
  phoneHref: 'tel:+254790669988',
  phoneSecondary: '',
  phoneSecondaryHref: '',
  whatsapp: '254790669988',
  builderUrl: '',
  builderName: '',
  location: 'Loipi Plaza, Lunga Lunga Road, Industrial Area, Nairobi, Kenya',
  warehouse: 'Loipi Plaza, Lunga Lunga Road, Industrial Area, Nairobi, Kenya',
  hours: 'Monday–Friday 8:00–17:00 · Saturday 8:00–13:00',
  logo: '/logo.png',
}
