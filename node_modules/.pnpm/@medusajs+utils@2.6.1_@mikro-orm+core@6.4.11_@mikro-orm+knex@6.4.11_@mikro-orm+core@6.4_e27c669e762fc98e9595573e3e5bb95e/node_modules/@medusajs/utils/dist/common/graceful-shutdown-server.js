"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GracefulShutdownServer = void 0;
class GracefulShutdownServer {
    static create(originalServer, waitingResponseTime = 200) {
        let connectionId = 0;
        let shutdownPromise;
        const allSockets = {};
        const server = originalServer;
        server.isShuttingDown = false;
        server.shutdown = async (timeout = 0) => {
            if (server.isShuttingDown) {
                return shutdownPromise;
            }
            server.isShuttingDown = true;
            shutdownPromise = new Promise((ok, nok) => {
                let forceQuit = false;
                let cleanInterval;
                try {
                    // stop accepting new incoming connections
                    server.close(() => {
                        clearInterval(cleanInterval);
                        ok();
                    });
                    if (+timeout > 0) {
                        setTimeout(() => {
                            forceQuit = true;
                        }, timeout).unref();
                    }
                    cleanInterval = setInterval(() => {
                        if (!Object.keys(allSockets).length) {
                            clearInterval(cleanInterval);
                        }
                        for (const key of Object.keys(allSockets)) {
                            const socketId = +key;
                            if (forceQuit || allSockets[socketId]._idle) {
                                allSockets[socketId].destroy();
                                delete allSockets[socketId];
                            }
                        }
                    }, waitingResponseTime);
                }
                catch (error) {
                    clearInterval(cleanInterval);
                    return nok(error);
                }
            });
            return shutdownPromise;
        };
        const onConnect = (originalSocket) => {
            connectionId++;
            const socket = originalSocket;
            socket._idle = true;
            socket._connectionId = connectionId;
            allSockets[connectionId] = socket;
            socket.on("close", () => {
                delete allSockets[socket._connectionId];
            });
        };
        server.on("connection", onConnect);
        server.on("secureConnection", onConnect);
        server.on("request", (req, res) => {
            const customSocket = req.socket;
            customSocket._idle = false;
            res.on("finish", () => {
                customSocket._idle = true;
            });
        });
        return server;
    }
}
exports.GracefulShutdownServer = GracefulShutdownServer;
//# sourceMappingURL=graceful-shutdown-server.js.map