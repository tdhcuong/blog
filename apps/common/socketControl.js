module.exports = function(io){
    var userNames = [];
    io.sockets.on("connection", function(socket){
        console.log("Having a new user connection");

        //Listen to addUser event
        socket.on("addUser", function(userName){
            socket.userName = userName;
            userNames.push(userName);

            //Notify to myself
            var data = {
                sender: "SERVER",
                message: "You have joint the chat room!"
            }
            socket.emit("updateMessage", data);

            //Notify to other users
            var data = {
                sender: "SERVER",
                message: userName + " have joint the chat room!"
            }
            socket.broadcast.emit("updateMessage", data);
        });

        //Listen to sendMessage event
        socket.on("sendMessage", function(message){
              //Notify to myself
            var data = {
                sender: "You",
                message: message
            }
            socket.emit("updateMessage", data);

            //Notify to other users
            var data = {
                sender: socket.userName,
                message: message
            }
            socket.broadcast.emit("updateMessage", data);
        });

        //Listen disconnect event
        socket.on("disconnect", function(){
            //Delete userName
            for(var i = 0; i < userNames.length; i++){
                if(userNames[i] == socket.userName){
                    userNames.slice(i, 1);
                }
            }
            //Notify to other users
            var data = {
                sender: "SERVER",
                message: socket.userName + " has left the chat room!"
            }
            socket.broadcast.emit("updateMessage", data);
        })
    });
}