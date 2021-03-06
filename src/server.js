const express = require("express");
const { engine } = require("express-handlebars");
const path = require("path");
require("dotenv").config();
const route = require("./routes/index");
const db = require("./config/db");
const credentials = require("./cookie/credentials");
const Chat = require("./models/Chat");
const {
    multipleMongooseToObject,
    mongooseToObject,
} = require("./util/mongoose");

const app = express();

db.connect();

// Cookie
app.use(require("cookie-parser")(credentials.COOKIE_SECRET));

// Session
app.use(
    require("express-session")({
        secret: "Session secret",
        resave: false,
        saveUninitialized: true,
    })
);

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(
    express.urlencoded({
        extended: true,
    })
);

app.engine(
    "hbs",
    engine({
        defaultLayout: "main.hbs",
        extname: "hbs",
    })
);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

const server = require("http").createServer(app);
const io = require("socket.io")(server, { cors: { origin: "*" } });

// TẠO KẾT NỐI GIỮA CLIENT VÀ SERVER
io.on("connection", (socket) => {
    console.log(`>>> User connected: ${socket.id}`);
    socket.on("disconnect", () => {});

    // CLIENT CHANGE ROOM
    socket.on("client-change-room", (room) => {
        socket.join(room);
        // GET ALL CHATS OF ROOM
        Chat.find({ room })
            .then((chats) => {
                io.in(room).emit(
                    "server-send-chats-of-room",
                    multipleMongooseToObject(chats)
                );
            })
            .catch((error) =>
                console.log(`>>> Có lỗi khi lấy nội dung chat của room ${room}`)
            );
        // console.log(">>> Current room: ", room);
    });

    // SERVER LẮNG NGHE DỮ LIỆU TỪ CLIENT
    socket.on("client-sent-data", (data) => {
        // LƯU TIN NHẮN VÀO DATABASE
        if (data.room === "multiUserChat") {
            Chat.create(
                {
                    sender: data.sender,
                    message: data.message,
                    room: data.room,
                    senderAvatar: data.senderAvatar,
                },
                function (error, small) {
                    if (error) {
                        console.log(
                            ">>> Had error when create new chat to database"
                        );
                        // saved!
                    }
                }
            );
        } else {
            Chat.create(
                {
                    sender: data.sender,
                    receiver: data.receiver,
                    message: data.message,
                    room: data.room,
                    senderAvatar: data.senderAvatar,
                },
                function (error, small) {
                    if (error) {
                        console.log(
                            ">>> Had error when create new chat to database"
                        );
                        // saved!
                    }
                }
            );
        }
        // SAU KHI LẮNG NGHE DỮ LIỆU, SERVER PHÁT LẠI DỮ LIỆU NÀY ĐẾN CÁC CLIENT KHÁC
        socket.to(data.room).emit("server-sent-data", data);
    });
});

// Define routes
route(app);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`>>> App listening on port ${PORT}`);
});
