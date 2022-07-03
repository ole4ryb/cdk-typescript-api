
exports.handler = async function(event) {
    console.log("request:", JSON.stringify(event, undefined, 2));

    //const dynamo = new DynamoDB();
    
    return {      
      statusCode: 200,
      headers: { "Content-Type": "text/plain" },
      body: `Hello, CDK! You've hit ${event.path}\n`
    };
  };