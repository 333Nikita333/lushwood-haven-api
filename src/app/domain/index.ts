import Auth from "./user/Auth";
import Rooms from "./service/Rooms";

type AuthController = typeof Auth;
type RoomsController = typeof Rooms;

const controllers = <(AuthController | RoomsController)[]>[Auth, Rooms];

export { controllers };
