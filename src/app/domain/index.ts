import Auth from "./user/Auth";
import Rooms from "./room/Rooms";
import Booking from "./order/Booking";

type AuthController = typeof Auth;
type RoomsController = typeof Rooms;
type BookingController = typeof Booking;

const controllers = <(AuthController | RoomsController | BookingController)[]>[
  Auth,
  Rooms,
  Booking,
];

export { controllers };
