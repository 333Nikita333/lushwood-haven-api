export interface IClient {
  name: string;
  email: string;
  phone: string;
}

export interface IOrder {
  id: string;
  client: IClient;
  roomName: string;
  roomType: "Standard" | "Family" | "Suite";
  dateCheckIn: string;
  dateCheckOut: string;
}

export interface ClientOrder extends Omit<IOrder, "client"> {}
