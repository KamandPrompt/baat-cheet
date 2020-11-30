const {
  assert
} = require("chai");
const io = require("socket.io-client");
const PORT = process.env.PORT || 3000;
const BAAT_HOST = process.env.BAAT_HOST || "http://localhost";
const SERVER = `${BAAT_HOST}:${PORT}`;
describe("App.js", () => {
  let socket;
  let client;
  beforeEach(() => {
    socket = io(SERVER);
    client = socket.connect();
  });
  afterEach(() => {
    if (client) client.disconnect();
    if (socket) socket.close();
  });
  it("should test if client is connected", (done) => {
    client.on("connect", () => {
      assert.isTrue(client.connected);
      client.disconnect();
      socket.close();
      done();
    });
  });
  it("should test if name is send", (done) => {
    client.on("connect", () => {
      assert.isTrue(client.connected);
      client.on("user invalid", (data) => {
        assert.isString(data);
        assert.strictEqual(data, "This user name is invalid.");
        done();
      });
      client.emit("set username", undefined);
    });
  });
  it("should test if broadcast notify all users (except sender)", (done) => {
    const localSocket = io(SERVER);
    const localClient = localSocket.connect();
    client.on("connect", () => {
      assert.isTrue(client.connected);
      client.emit("set username", "baatCheet");
      client.disconnect();
      socket.close();
    });
    localClient.on("connect", () => {
      assert.isTrue(localClient.connected);
      localClient.on("user joined", (data) => {
        assert.isObject(data);
        assert.hasAnyKeys(data, "username");
        assert.strictEqual(data.username, "baatCheet");
        localClient.disconnect();
        localSocket.close();
        done();
      });
    });
  });
  it("should test if user exist", (done) => {
    const socket = io(SERVER);
    const socketTwo = io(SERVER);
    const client = socket.connect();
    const clienTwo = socketTwo.connect();
    client.on("connect", () => {
      assert.isTrue(client.connected);
      client.on("user set", (data) => {
        assert.isObject(data);
        assert.hasAnyKeys(data, "username");
        assert.strictEqual(data.username, "uniqueName");
      });
      client.emit("set username", "uniqueName");
    });
    clienTwo.on("connect", () => {
      assert.isTrue(clienTwo.connected);
      clienTwo.on("user exists", (data) => {
        assert.strictEqual(data, "uniqueName");
        client.disconnect();
        clienTwo.disconnect();
        socket.close();
        socketTwo.close();
        done();
      });
      clienTwo.emit("set username", "uniqueName");
    });
  });
});
