export interface IRoom {
  id: string;
  name: string;
  images: string[];
  type: "Standard" | "Family" | "Suite";
  perNight: number;
  description: string;
  amenities: { icon: string; desc: string }[];
}
