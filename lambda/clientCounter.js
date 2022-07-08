
const { DynamoDB, Lambda, SNS } = require('aws-sdk');

const sns = new SNS();
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
                body = await documentClient.scan({TableName: TABLE}).promise();
                break;
            case "GET /clients/{id}":
              
              var params = {
                TableName: process.env.DYNAMODB_TABLE,
                FilterExpression : 'client_id = :c_id',
                ExpressionAttributeValues : {':c_id' : `${event.pathParameters.id}`},
                Select: "COUNT"
              };
              
              documentClient.scan(params, (error, result) => {
                // error handling
                if (error) {
                  console.error(error);
                  callback(null, {
                    statusCode: error.statusCode || 501,
                    headers: { 'Content-Type': 'text/plain' },
                    body: 'Could not get donations.'
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
                  body: `Thank you for making more than 2 donations!  \n`         
                };
                callback(null, response);
              });
                              
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

    //return {
    //  successStatusCode,
    //    body,
    //    headers
    //};

    const response = {
      statusCode: successStatusCode,
      body: body //`Hello, you've made ${donationsCount} donations. Thank you!  \n`
    };
    callback(null, response);


    //------------------------------------
  /*

    var params = {
      TableName: process.env.DYNAMODB_TABLE,
      FilterExpression : 'client_id = :c_id',
      ExpressionAttributeValues : {':c_id' : `${event.pathParameters.id}`},
      Select: "COUNT"
    };
    
    documentClient.scan(params, (error, result) => {
      // error handling
      if (error) {
        console.error(error);
        callback(null, {
          statusCode: error.statusCode || 501,
          headers: { 'Content-Type': 'text/plain' },
          body: 'Could not get donations.'
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

    */

  };