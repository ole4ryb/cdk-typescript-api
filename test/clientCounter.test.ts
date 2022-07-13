import * as DynamoDB from 'aws-sdk';


const mockDynamodbScan = jest.fn().mockReturnValue({
  promise: jest.fn().mockResolvedValue({
    PK: 'userId-123', SK: 'userId-123'
  })
});

const mockDynamoDBPromise = jest.fn();

const mDocumentClientInstance = {
  scan: mockDynamodbScan,
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
    
  });

  it('handle exception cases', async () => {
    
    const context = {};
    const event = {
      resource: "/clients",
      httpMethod: "GETPUT",
      body: '{}'
    };

    const clientCounter = require("../lambda/clientCounter");
    
    expect(clientCounter.handler(event, context, (smth: any, params: any) => {      
      return {statusCode: params.statusCode, body: params.body}
      })
    ).not.toBeInstanceOf(Error);
  });  

  




});
