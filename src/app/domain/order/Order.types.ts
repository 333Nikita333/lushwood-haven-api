export interface IClient {
  name: string;
  email: string;
  phone: string;
}

export interface IOrder {
  id: string;
  curClient: IClient;
  roomName: string;
  roomType: "Standard" | "Family" | "Suite";
  dateCheckIn: Date;
  dateCheckOut: Date;
}

export interface ClientOrder extends Omit<IOrder, "curClient | id"> {
  userName: string;
}
