export type ReviewStatus = 'pending' | 'approved' | 'rejected'

export interface Milestone {
  id: string
  title: string
  subtitle: string
  state: 'done' | 'active' | 'pending'
  actionLabel?: string
}

export interface IoTSnapshot {
  temp: string
  humidity: string
  ph: string
  light: string
  lightOk: boolean
  updated: string
}

export type VaultStatus = 'active' | 'poa_due' | 'pending' | 'completed' | 'archived'
export type FarmerStatus = 'verified' | 'pending' | 'new' | 'archived'

export interface AdminVault {
  id: string
  code: string
  cropKind: string
  cropLabel: string
  location: string
  status: VaultStatus
  dayCurrent: number
  dayTotal: number
  fundedIdr: number
  fundedUsd: number
  targetIdr: number | null
  targetUsd: number | null
  estApy: number | null
  farmerCount: number
  harvestEstimate: string | null
  milestones: Milestone[]
  iot: IoTSnapshot | null
  createdAt: string
  updatedAt: string
}

export interface AdminFarmer {
  id: string
  farmerCode: string
  name: string
  initials: string
  avatarColor: string
  idLine: string
  vaultLine: string
  vaultId: string | null
  status: FarmerStatus
  createdAt: string
  updatedAt: string
}

export interface AdminPoaEvent {
  id: string
  vaultId: string
  activity: 'tanam' | 'pupuk' | 'rawat' | 'panen' | 'pemeriksaan'
  photoCount: number
  lat: number | null
  lng: number | null
  note: string | null
  agentId: string | null
  status: ReviewStatus
  reviewedBy: string | null
  reviewedAt: string | null
  createdAt: string
}

export interface AdminHarvestEvent {
  id: string
  vaultId: string
  kg: number
  grade: string
  note: string | null
  agentId: string | null
  status: ReviewStatus
  reviewedBy: string | null
  reviewedAt: string | null
  createdAt: string
}
