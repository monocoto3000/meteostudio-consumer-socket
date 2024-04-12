import * as amqp from "amqplib/callback_api";

async function connect() {
    try {
        amqp.connect(
            "amqp://52.6.228.180/",
            (err: any, conn: amqp.Connection) => {
                if (err) throw new Error(err);
                conn.createChannel((errChanel: any, channel: amqp.Channel) => {
                    if (errChanel) throw new Error(errChanel);
                    channel.assertQueue();
                    channel.consume("rtdata", async (data: amqp.Message | null) => {
                        if (data?.content !== undefined) {
                            console.log(data.content);
                            const content = data?.content;
                            const parsedContent = JSON.parse(content.toString());
                            const headers = {
                                "Content-Type": "application/json",
                            };
                            const body = {
                                method: "POST",
                                headers,
                                body: JSON.stringify(parsedContent),
                            };
                            console.log(parsedContent);
                            fetch("http://localhost:3001/data/rtdata", body)
                                .then(() => {
                                    console.log("datos enviados");
                                })
                                .catch((err: any) => {
                                    console.log(err);
                                });
                            channel.ack(data);
                        }
                    });
                });
            }
        );
    } catch (err: any) {
        throw new Error(err);
    }
}

connect();