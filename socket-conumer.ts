import * as amqp from "amqplib/callback_api";
const socketIoClient = require("socket.io-client");
import { Socket } from "socket.io-client";

const RABBITMQ_HOST = "amqp://52.6.228.180/";
const RABBITMQ_QUEUE_RTDATA = "rtdata";
const RABBITMQ_QUEUE_AVERAGES = "averages";
const WEBSOCKET_SERVER_URL = "http://localhost:4000";

let socketIO: Socket;

async function connect() {
  try {
    amqp.connect(RABBITMQ_HOST, (err: any, conn: amqp.Connection) => {
      if (err) throw new Error(err);

      conn.createChannel((errChanel: any, channel: amqp.Channel) => {
        if (errChanel) throw new Error(errChanel);

        channel.assertQueue(RABBITMQ_QUEUE_RTDATA);
        channel.assertQueue(RABBITMQ_QUEUE_AVERAGES);

        channel.consume(RABBITMQ_QUEUE_RTDATA, (data: amqp.Message | null) => {
          if (data?.content !== undefined) {
            const parsedContent = JSON.parse(data.content.toString());
            console.log("Datos de rtdata:", parsedContent);
            socketIO.emit("rtdata", parsedContent);
            channel.ack(data);
          }
        });

        channel.consume(RABBITMQ_QUEUE_AVERAGES, (data: amqp.Message | null) => {
          if (data?.content !== undefined) {
            const parsedContent = JSON.parse(data.content.toString());
            console.log("Datos de averages:", parsedContent);
            socketIO.emit("averages", parsedContent);
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
