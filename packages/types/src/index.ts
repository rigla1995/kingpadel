export type PlayerLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PRO';
export type UserRole = 'PLAYER' | 'VENUE_MANAGER' | 'ADMIN';
export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
export type LobbyStatus = 'OPEN' | 'FULL' | 'IN_PROGRESS' | 'COMPLETED';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  level: PlayerLevel;
  eloScore: number;
  avatar?: string;
}

export interface Venue {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  logo?: string;
  isSponsored: boolean;
}

export interface Court {
  id: string;
  name: string;
  surface: string;
  isIndoor: boolean;
  pricePerSlot: number;
  slotDuration: number;
  venueId: string;
}

export interface Reservation {
  id: string;
  startTime: string;
  endTime: string;
  status: ReservationStatus;
  totalPrice: number;
  courtId: string;
  userId: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  type: 'PUBLIC' | 'PRIVATE';
  requiredLevel?: PlayerLevel;
  maxPlayers: number;
  startDate: string;
  price: number;
  venueId: string;
}
