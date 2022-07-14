import { AnyPrincipal } from "aws-cdk-lib/aws-iam";
import { CfnGeofenceCollection } from "aws-cdk-lib/aws-location";

const { DynamoDB, SNS } = require('aws-sdk');


const mockDynamodbScan = jest.fn().mockReturnValue({
  promise: jest.fn().mockResolvedValue({
    PK: 'userId-123', SK: 'userId-123'
  })
});

const mockDynamodbQuery = jest.fn().mockReturnValue({
  promise: jest.fn().mockResolvedValue({
    body: '{"Count": 2}',
    data: { "Count": 2 },
    Count: 2
  })
});

const mockDynamodbPut = jest.fn().mockReturnValue({
  promise: jest.fn().mockResolvedValue({
    PK: '222', SK: '333'
  })
});

const mockDynamoDBPromise = jest.fn();

const mDocumentClientInstance = {
  scan: mockDynamodbScan,
  query: mockDynamodbQuery,
  put: mockDynamodbPut,
  promise: mockDynamoDBPromise,
};

jest.mock('aws-sdk', () => {
  return {
    DynamoDB: {
      DocumentClient: jest.fn(() => mDocumentClientInstance),
    },
  };
});

describe('test call', () => {
  
afterEach(() => {
  jest.restoreAllMocks();
});

it('verifies scan call', async () => {
  
    mDocumentClientInstance.promise.mockResolvedValueOnce({});

    const clientCounter = require("../lambda/clientCounter");
    const result = clientCounter.scanAndGetResult('Table1');
    
    expect(mDocumentClientInstance.scan).toBeCalledTimes(1);
    expect(mDocumentClientInstance.scan).toBeCalledWith({ TableName: 'Table1' });
    Promise.all([result]).then((values) => {
      expect(values).toContainEqual({"PK": "userId-123", "SK": "userId-123"});
    });
        
});

it('handle exception cases', async () => {
    
    const context = {};
    const event = {
      resource: "/clients",
      httpMethod: "GET",
      body: '{}'
    };

    const clientCounter = require("../lambda/clientCounter");
    
    expect(clientCounter.handler(event, context, (smth: any, params: any) => {      
      return {statusCode: params.statusCode, body: params.body}
      })
    ).not.toBeInstanceOf(Error);
});  

it('fetch count donations', async () => {

  mDocumentClientInstance.promise.mockResolvedValueOnce({});

  const context = {};
  const event = {
    resource: "/clients",
    httpMethod: "GETPUT",
    body: '{}',
    pathParameters: {
      id: 1
    }
  };
  const sns = {
    publish: {}
  };

  const mockCallback = jest.fn((smth, params) => {      
    return {statusCode: params.statusCode, body: params.body}
  });

  const clientCounter = require("../lambda/clientCounter");
  const result = clientCounter.fetchDonationsCount(event, sns, 'Table1', mockCallback);
  
  expect(mDocumentClientInstance.query).toBeCalledTimes(1); 
  console.log(result);
});  

it('post calls', async () => {

  mDocumentClientInstance.promise.mockResolvedValueOnce({});

  const context = {};
  const bodyJson = JSON.stringify({
    'id': '1', 
    'donations_amount': 250 
  });

  const response = {
    statusCode: 200,
    body: 'PUT item 1 into DB' 
  };

  const event = {
    resource: "/clients",
    httpMethod: "POST",
    body: bodyJson,
    pathParameters: {
      id: 1
    }
  };
  const mockCallback = jest.fn((smth, params) => {      
    return {statusCode: params.statusCode, body: params.body}
  });

  const clientCounter = require("../lambda/clientCounter");
  const result = clientCounter.handler(event, context, mockCallback);

  expect(mDocumentClientInstance.put).toBeCalledTimes(1);  

});  

});


