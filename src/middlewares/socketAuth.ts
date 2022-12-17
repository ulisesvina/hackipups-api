import { Socket } from "socket.io";
import { verify } from "jsonwebtoken";

const auth = (socket: Socket, next: (err?: Error) => void) => {
  const token: string | null | undefined = socket.handshake.auth.token;
  if (!token) return next(new Error("Authentication error"));

  verify(token, process.env.JWT_SECRET || "", (err, decoded) => {
    if (err) return next(new Error("Authentication error"));
    socket.data.user = decoded;
    next();
  });
};

export default auth;
