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

  /*
  beforeEach(() => {
    mockDynamodbScan.mockReset();
    mockDynamoDBPromise.mockReset();
  });
  */
  
  afterEach(() => {
    jest.restoreAllMocks();
  });

it('verifies the call', async () => {
  

    mDocumentClientInstance.promise.mockResolvedValueOnce({});

    const clientCounter = require("../lambda/clientCounter");
    const result = clientCounter.scanAndGetResult('Table1');
    
    expect(mDocumentClientInstance.scan).toBeCalledTimes(1);
    
  });

});
