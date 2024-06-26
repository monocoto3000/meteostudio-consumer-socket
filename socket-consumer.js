"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var amqp = require("amqplib/callback_api");
var socketIoClient = require("socket.io-client");
var USERNAME = "meteostudio";
var PASSWORD = encodeURIComponent("CMdui89!gdDDD145x?");
var HOSTNAME = "100.25.187.231";
var PORT = 5672;
var RABBITMQ_QUEUE_RTDATA = "Meteorological";
var WEBSOCKET_SERVER_URL = "http://3.212.10.41/";
var socketIO;
function sendDatatoQueue(data) {
    return __awaiter(this, void 0, void 0, function () {
        var lambdaUrl, requestData, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    lambdaUrl = 'https://fk5dcofqb55mxnedrc5e6p54oe0rnykq.lambda-url.us-east-1.on.aws/';
                    requestData = {
                        body: JSON.stringify(data),
                    };
                    console.log(requestData.body);
                    return [4 /*yield*/, fetch(lambdaUrl, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: requestData.body,
                        })];
                case 1:
                    response = _a.sent();
                    console.log('funcion lambda Averages response: ', response);
                    return [2 /*return*/];
            }
        });
    });
}
function connect() {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            try {
                amqp.connect("amqp://".concat(USERNAME, ":").concat(PASSWORD, "@").concat(HOSTNAME, ":").concat(PORT), function (err, conn) {
                    if (err)
                        throw new Error(err);
                    conn.createChannel(function (errChanel, channel) {
                        if (errChanel)
                            throw new Error(errChanel);
                        channel.assertQueue(RABBITMQ_QUEUE_RTDATA, { durable: true, arguments: { "x-queue-type": "quorum" } });
                        channel.consume(RABBITMQ_QUEUE_RTDATA, function (data) { return __awaiter(_this, void 0, void 0, function () {
                            var parsedContent;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!((data === null || data === void 0 ? void 0 : data.content) !== undefined)) return [3 /*break*/, 2];
                                        parsedContent = JSON.parse(data.content.toString());
                                        console.log("Datos de rtdata:", parsedContent);
                                        socketIO.emit("rtdata", parsedContent);
                                        return [4 /*yield*/, sendDatatoQueue(parsedContent)];
                                    case 1:
                                        _a.sent();
                                        channel.ack(data);
                                        _a.label = 2;
                                    case 2: return [2 /*return*/];
                                }
                            });
                        }); });
                        socketIO = socketIoClient(WEBSOCKET_SERVER_URL);
                    });
                });
            }
            catch (err) {
                throw new Error(err);
            }
            return [2 /*return*/];
        });
    });
}
connect();
