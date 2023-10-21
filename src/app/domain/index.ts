import Auth from "./user/Auth";

type AuthController = typeof Auth;

const controllers = <AuthController[]>[Auth];

export { controllers };
