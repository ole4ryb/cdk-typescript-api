import * as DynamoDB from 'aws-sdk';

const mDocumentClientInstance = {
  scan: jest.fn().mockReturnThis(),
  promise: jest.fn(),
};
jest.mock('aws-sdk', () => {
  return {
    DynamoDB: {
      DocumentClient: jest.fn(() => mDocumentClientInstance),
    },
  };
});

describe('54360588', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

it('verifies the call', async () => {

    mDocumentClientInstance.promise.mockResolvedValueOnce({});

    const clientCounter = require("../lambda/clientCounter");
    const result = clientCounter.scanAndGetResult('Table1');

    expect(result).toEqual({ statusCode: 200, body: JSON.stringify({}) });    
  });
});
