
const { DynamoDB, Lambda, SNS } = require('aws-sdk');

var documentClient = new DynamoDB.DocumentClient();

module.exports.handler = async (event, context, callback) => {
    const TABLE = process.env.DYNAMODB_TABLE;
    let body;
    let successStatusCode = 200;
    console.log("request:", JSON.stringify(event, undefined, 2));
    
    let path = event.resource;
    let httpMethod = event.httpMethod;
    let route = httpMethod.concat(' ').concat(path);
    let requestJSON = JSON.parse(event.body);
    
    try {
        switch (route) {
            case "GET /clients":
                body = await this.scanAndGetResult(TABLE);
                break;

            case "GET /clients/{id}":
              
              const sns = new SNS();
              documentClient.query(
                {
                  TableName: TABLE,
                  KeyConditionExpression: "#client_id = :id ",
                  ExpressionAttributeValues: {
                    ":id": event.pathParameters.id,
                  },
                  ExpressionAttributeNames: {
                    "#client_id": "client_id",
                  },
                  Select: "COUNT"
                },
                function (err, data) {
                  if (err) {
                     console.error(err);
                  } else {
                    console.log("dynamodb query succeeded:", JSON.stringify(data["Count"], null, 2)); 

                    const donationsCount = data["Count"]; 

                    if(donationsCount > 1) {
                      const params = {
                        Message: `Thank you for making ${donationsCount} donations!  \n`,            
                        TopicArn: process.env.SNS_TOPIC_ANR 
                      };
                      sns.publish(params).promise();
                    }
                    body = `Thank you for making ${donationsCount} donations!  \n`;
              
                    const response = {
                      statusCode: 200,
                      body: `Thank you for making ${donationsCount} donations!  \n`         
                    };
                    callback(null, response);  
                  }                   
                }
              );
          
              break;

            case "POST /clients":
          
                var params = {
                  TableName: TABLE,
                  Item: {
                    'client_id' : requestJSON.id,
                    'timestamp': Date.now(),
                    'donations_amount': requestJSON.donations_amount                    
                  }                                   
                };   
              
              try {  
                var result = await documentClient.put(params, function(err, data) {
                  if (err) console.log(err);
                  else console.log(data);
                }).promise();
              } catch(err) {
                console.log(err);
              }  

              body = `PUT item ${requestJSON.id} into DB`;
              break;

            default:
                throw new Error(`Unsupported route: "${route}"`);
        }
    } catch (err) {
        console.log(err)
        statusCode = 400;
        body = err.message;
    } finally {
        console.log(body)
        body = JSON.stringify(body);
    }

    const response = {
      statusCode: successStatusCode,
      body: body 
    };
    callback(null, response);

  };

  module.exports.scanAndGetResult =  async (TABLE) => {
  const result = await documentClient.scan({ TableName: TABLE }).promise();
  return result;
}
