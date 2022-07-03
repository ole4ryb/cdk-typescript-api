import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { RemovalPolicy, CfnOutput } from 'aws-cdk-lib';

export class CdkTypescriptApiStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const clientCounterLambda = new lambda.Function(this, 'ClientCounterHandler', {
      runtime: lambda.Runtime.NODEJS_16_X,    // execution environment
      code: lambda.Code.fromAsset('lambda'),  // code loaded from "lambda" directory
      handler: 'clientCounter.handler'        // file is "hello", function is "handler"
    });

    
    const table = new dynamodb.Table(this, 'ClientDonations', {
      partitionKey: {
        name: 'client_id',
        type: dynamodb.AttributeType.STRING
      }, 
      sortKey: {
        name: 'donations_amount',
        type: dynamodb.AttributeType.NUMBER
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY, // NOT recommended for production code
    });
    new CfnOutput(this, 'TableName', { value: table.tableName });

    const consumerCounterApi = new apigw.RestApi(this, 'client-counter-api');

    const client = consumerCounterApi.root.addResource('client');
    const clientWithId = client.addResource('{id}');
    clientWithId.addMethod('GET', new apigw.LambdaIntegration(clientCounterLambda));
        
  }
}
