/** The Metakaizen Line. Each station is a zone; new zones become new stops. */
export interface Station {
  id: string
  no: string
  name: string
  jp?: string
  blurb: string
  open: boolean
}

export const stations: Station[] = [
  { id: 'central', no: '01', name: 'Central', jp: '中央', blurb: 'Career district', open: true },
  { id: 'garage', no: '02', name: 'Garage', blurb: 'Showroom + drive', open: false },
  { id: 'armory', no: '03', name: 'Armory', blurb: 'Firing range', open: false },
  { id: 'lab', no: '04', name: 'Lab', blurb: 'Product inspector', open: false },
]
