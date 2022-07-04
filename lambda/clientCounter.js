
const { DynamoDB, Lambda, SNS } = require('aws-sdk');

const sns = new SNS();

module.exports.handler = (event, context, callback) => {
    console.log("request:", JSON.stringify(event, undefined, 2));

    var params = {
      TableName: process.env.DYNAMODB_TABLE,
      FilterExpression : 'client_id = :c_id',
      ExpressionAttributeValues : {':c_id' : `${event.pathParameters.id}`},
      Select: "COUNT"
    };
    
    var documentClient = new DynamoDB.DocumentClient();

    documentClient.scan(params, (error, result) => {
      // error handling
      if (error) {
        console.error(error);
        callback(null, {
          statusCode: error.statusCode || 501,
          headers: { 'Content-Type': 'text/plain' },
          body: 'Could not get books.'
        });
        return;
      }

      const donationsCount = result["Count"];
      if(donationsCount > 1) {
        const params = {
          Message: `Thank you for making ${donationsCount} donations!  \n`,            
          TopicArn: process.env.SNS_TOPIC_ANR 
        };
        sns.publish(params).promise();
      }

      const response = {
        statusCode: 200,
        body: `Hello, you've made ${donationsCount} donations. Thank you!  \n`         
      };
      callback(null, response);
    });

  };