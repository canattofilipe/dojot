const mqtt = require('mqtt');
const MQTTClient = require('../../app/MqttClient');
const utils = require('../../app/utils');

/* dependencies mock */
const mockMqtt = {
  on: jest.fn(),
  reconnect: jest.fn(),
  publish: jest.fn(),
};

jest.mock('mqtt', () => ({
  connect: jest.fn(() => mockMqtt),
  disconnect: jest.fn(),
}));

jest.mock('../../app/AgentMessenger', () => jest.fn(() => ({
  init: jest.fn(),
})));

const mockDefaultConfig = {
  app: {
    basedir: 'fakeDir',
    hostname: 'fake',
  },
  logger: {
    'transports.console.level': 'debug',
  },
  mqtt: {
    'client.keepalive': 0,
    'client.id': 'fake',
    'client.publish.topic.qos': 0,
    'client.publish.topic.suffix': '/fake',
    'client.secure': true,
    'client.username': 'fake',
    'server.address': 'fake',
    'server.port': 0,
    'tls.ca.file': 'fake',
    'tls.certificate.file': 'fake',
    'tls.key.file': 'fake',
  },
};

jest.mock('../../app/config', () => ({
  app: {
    basedir: 'fakeDir',
    hostname: 'fake',
  },
  logger: {
    'transports.console.level': 'debug',
  },
  mqtt: {
    'client.keepalive': 0,
    'client.id': 'fake',
    'client.publish.topic.qos': 0,
    'client.publish.topic.suffix': '/fake',
    'client.secure': true,
    'client.username': 'fake',
    'server.address': 'fake',
    'server.port': 0,
    'tls.ca.file': 'fake',
    'tls.certificate.file': 'fake',
    'tls.key.file': 'fake',
  },
}));
jest.mock('fs');
jest.mock('../../app/utils', () => ({
  generateDojotActuationTopic: jest.fn(() => 'fakeId:fake/config'),
  killApplication: jest.fn(),
}));
jest.mock('@dojot/microservice-sdk');

describe('Testing MQTTClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const expectMqttInitialization = (client) => {
    const config = mockDefaultConfig.mqtt;
    expect(client.isConnected).toEqual(false);

    expect(client.clientId).toEqual(config['client.id']);
    expect(client.keepalive).toEqual(config['client.keepalive']);
    expect(client.publishQos).toEqual(config['client.publish.qos']);
    expect(client.secureMode).toEqual(config['client.secure']);
    expect(client.username).toEqual(config['client.username']);

    expect(client.host).toEqual(config['server.address']);
    expect(client.port).toEqual(config['server.port']);

    expect(client.ca).not.toBeNull();
    expect(client.clientCrt).not.toBeNull();
    expect(client.privateKey).not.toBeNull();

    expect(client.mqttc).toEqual(null);
    expect(client.mqttOptions).toEqual(null);
    expect(client.agentMessenger).toEqual(null);

    expect(client.logger).not.toBeNull();
  };

  it('Should initialize the app correctly with default config', () => {
    const mqttClient = new MQTTClient(mockDefaultConfig.mqtt);
    expectMqttInitialization(mqttClient);
  });

  it('Should initialize the app correctly with mocked configs', () => {
    const mqttClient = new MQTTClient(mockDefaultConfig.mqtt);
    expectMqttInitialization(mqttClient);
  });

  it('Should initializing correctly the client with MQTT protocol', () => {
    mockDefaultConfig.mqtt['client.secure'] = false;
    const mqttClient = new MQTTClient(mockDefaultConfig.mqtt);
    mqttClient.init();

    expect(mqtt.connect).toHaveBeenCalledTimes(1);
    expect(mockMqtt.on).toHaveBeenCalledTimes(3);
  });

  it('Should initializing correctly the client with MQTTS protocol', () => {
    mockDefaultConfig.mqtt['client.secure'] = true;
    const mqttClient = new MQTTClient(mockDefaultConfig.mqtt);
    mqttClient.init();

    expect(mqtt.connect).toHaveBeenCalledTimes(1);
    expect(mockMqtt.on).toHaveBeenCalledTimes(3);
  });

  it('should successfully set client as connected and connect Kafka Consumer', () => {
    const mqttClient = new MQTTClient(mockDefaultConfig.mqtt);
    mqttClient.init();
    const spyAgentMessengerInit = jest.spyOn(mqttClient.agentMessenger, 'init');

    mqttClient.onConnect();

    expect(mqttClient.isConnected).toEqual(true);
    expect(spyAgentMessengerInit).toHaveBeenCalledTimes(1);
  });

  it('should successfully set client as disconnected', () => {
    const mqttClient = new MQTTClient(mockDefaultConfig.mqtt);
    mqttClient.init();

    mqttClient.onDisconnect();

    expect(mqttClient.isConnected).toEqual(false);
  });

  it('should successfully exit the program when an error occurs', () => {
    const mqttClient = new MQTTClient(mockDefaultConfig.mqtt);
    mqttClient.init();

    mqttClient.onError(new Error('fake'));

    expect(utils.killApplication).toHaveBeenCalledTimes(1);
  });

  it('should publish a message', () => {
    const mqttClient = new MQTTClient(mockDefaultConfig.mqtt);
    mqttClient.init();
    mqttClient.onConnect();
    const fakeTopic = 'fakeId:fake/config';
    const attrs = { key: 'value' };
    const value = Buffer.from(
      JSON.stringify(
        {
          meta: {
            service: 'fake',
          },
          data: {
            id: 'fakeId',
            attrs,
          },
        },
      ),
    );
    const data = { value };

    mqttClient.publishMessage(data);

    expect(mockMqtt.publish).toHaveBeenCalledWith(
      fakeTopic,
      JSON.stringify(attrs),
      { qos: mockDefaultConfig.mqtt['client.publish.qos'] },
      expect.any(Function),
    );
  });

  it('should not publish a message - MQTT client not connected', () => {
    const mqttClient = new MQTTClient(mockDefaultConfig.mqtt);
    mqttClient.init();
    mqttClient.publishMessage();
    expect(mockMqtt.publish).not.toHaveBeenCalled();
  });

  it('should not publish a message - threw an error', () => {
    const mqttClient = new MQTTClient(mockDefaultConfig.mqtt);
    mqttClient.init();
    mqttClient.onConnect();
    // Wrong object is being passed
    mqttClient.publishMessage({});
    expect(mockMqtt.publish).not.toHaveBeenCalled();
  });
});
