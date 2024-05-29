import ChangeStreamHandler from "./ChangeStreamHandler";
import { HTTPRequestLogger } from "./HTTPRequestLogger";
import { HTTPResponseLogger } from "./HTTPResponseLogger";

type Middleware =
  | typeof HTTPRequestLogger
  | typeof HTTPResponseLogger
  | typeof ChangeStreamHandler;

const middlewares = <Middleware[]>[
  HTTPRequestLogger,
  HTTPResponseLogger,
  ChangeStreamHandler,
];

export { middlewares };
