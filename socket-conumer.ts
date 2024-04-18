import * as amqp from "amqplib/callback_api";
const socketIoClient = require("socket.io-client");
import { Socket } from "socket.io-client";

const USERNAME = "meteostudio"
const PASSWORD = encodeURIComponent("CMdui89!gdDDD145x?")
const HOSTNAME = "100.25.187.231"
const PORT = 5672
const RABBITMQ_QUEUE_RTDATA = "Meteorological";
const WEBSOCKET_SERVER_URL = "http://3.212.10.41/";

let socketIO: Socket;

async function connect() {
  try {
    amqp.connect(`amqp://${USERNAME}:${PASSWORD}@${HOSTNAME}:${PORT}`, (err: any, conn: amqp.Connection) => {
      if (err) throw new Error(err);

      conn.createChannel((errChanel: any, channel: amqp.Channel) => {
        if (errChanel) throw new Error(errChanel);

        channel.assertQueue(RABBITMQ_QUEUE_RTDATA, {durable:true, arguments:{"x-queue-type":"quorum"}});

        channel.consume(RABBITMQ_QUEUE_RTDATA, (data: amqp.Message | null) => {
          if (data?.content !== undefined) {
            const parsedContent = JSON.parse(data.content.toString());
            console.log("Datos de rtdata:", parsedContent);
            socketIO.emit("rtdata", parsedContent);
            channel.ack(data);
          }
        });

        socketIO = socketIoClient(WEBSOCKET_SERVER_URL);
      });
    });
  } catch (err: any) {
    throw new Error(err);
  }
}

connect();
