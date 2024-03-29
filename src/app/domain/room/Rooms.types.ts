export interface IRoom {
  id: string;
  name?: string;
  images: string[];
  type?: string;
  perNight?: number;
  description?: string;
  amenities: { icon: string; desc: string }[];
}
