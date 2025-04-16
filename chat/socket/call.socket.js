module.exports = function setupCallHandlers(io, socket, onlineUsers) {
    // =============== CALL EVENTS ===============
    socket.on('callUser', ({ recipientId, signalData, callType, callerName }) => {
      console.log(`Call initiated by ${socket.user.id} to ${recipientId}`);
  
      const recipientSocket = [...onlineUsers.values()]
        .find(u => u.userId === recipientId)?.socketId;
  
      if (recipientSocket) {
        io.to(recipientSocket).emit('incomingCall', {
          callerId: socket.user.id,
          callerName,
          signalData,
          callType
        });
      }
    });
  
    socket.on('answerCall', ({ callerId, signalData }) => {
      console.log("[Server] answerCall =>", callerId);
      const callerSocket = [...onlineUsers.values()]
        .find(u => u.userId === callerId)?.socketId;
  
      if (callerSocket) {
        io.to(callerSocket).emit('callAccepted', signalData);
      }
    });
  
    socket.on("rejectCall", ({ callerId }) => {
      console.log("[Server] rejectCall =>", callerId);
      const callerSocket = [...onlineUsers.values()]
        .find(u => u.userId === callerId)?.socketId;
  
      if (callerSocket) {
        io.to(callerSocket).emit('callRejected');
      }
    });
  
    socket.on("endCall", () => {
      console.log("[Server] endCall from", socket.user.id);
  
      socket.broadcast.emit("callEnded");
    });
  };
  