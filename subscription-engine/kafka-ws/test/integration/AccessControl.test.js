jest.mock('redis', () => ({
  createClient() {
    const redisDB = {};
    const redisClient = {
      setex(key, expires, value, cb) {
        redisDB[key] = value;
        cb(null, true);
      },
      multi() {
        const value = [];
        return {
          get(key) {
            value.push(redisDB[key]);
          },
          del(key) {
            delete redisDB[key];
          },
          exec(cb) {
            cb(null, [value.pop()]);
          },
        };
      },
    };
    return redisClient;
  },
}));
jest.mock('../../app/WebsocketTarball', () => ({
  onConnection: jest.fn(({ ws }) => {
    ws.close();
    return Promise.resolve();
  }),
}));

const WebSocket = require('ws');
const http = require('http');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const cfg = require('../../app/Config');

const jwtSignAsync = promisify(jwt.sign).bind(jwt);

const application = require('../../app/App');

const WebsocketTarball = require('../../app/WebsocketTarball');

const server = http.createServer(application.expressApp);
application.configure(server);
const req = request(server);

describe('Integration tests related to websocket access control', () => {
  it('should be unauthorized because of a missing ticket',
    () => req.get('/kafka-ws/v1/topics/dummy.topic')
      .send()
      .expect(401)
      .then((res) => {
        expect(res.body).toEqual({ message: 'Missing ticket' });
      }));

  it('should be unauthorized because of a invalid ticket',
    () => req.get('/kafka-ws/v1/topics/dummy.topic?ticket=fake')
      .send()
      .expect(401)
      .then((res) => {
        expect(res.body).toEqual({ message: 'Invalid ticket' });
      }));

  describe('When a ticket is issued to the client', () => {
    const tenant = 'dummy';
    let ticket;

    beforeAll((done) => {
      jwtSignAsync(
        { service: tenant },
        cfg.app.ticket.secret,
        { expiresIn: 60 },
      ).then((token) => new Promise(((resolve, reject) => {
        req.get('/kafka-ws/v1/ticket')
          .set('Authorization', `Bearer ${token}`)
          .send()
          .expect(200)
          .end((err, res) => {
            if (err) return reject(err);
            return resolve(res.body.ticket);
          });
      }))).then((resultTicket) => {
        ticket = resultTicket;
        done();
      });
    });

    it('should be authorized by access control',
      (done) => {
        server.listen(0);
        const { port } = server.address();
        const ws = new WebSocket(`ws://127.0.0.1:${port}/kafka-ws/v1/topics/${tenant}.topic?ticket=${ticket}`);

        ws.on('close', () => {
          expect(WebsocketTarball.onConnection).toHaveBeenCalled();
          server.close();
          done();
        });
      });
  });
});
