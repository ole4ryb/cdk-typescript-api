import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { RemovalPolicy, CfnOutput } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Subscription, SubscriptionProtocol } from 'aws-cdk-lib/aws-sns';

export class CdkTypescriptApiStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const clientDonationsTable = new dynamodb.Table(this, 'ClientDonations', {
      partitionKey: {
        name: 'client_id',
        type: dynamodb.AttributeType.STRING
      }, 
      sortKey: {
        name: 'donations_amount',
        type: dynamodb.AttributeType.NUMBER
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY, 
    });

    const topic = new sns.Topic(this, 'ClientDonationsTopic', {
      displayName: 'ClientDonationsTopic',
    });

    new Subscription(this, 'EmailSubscription', {
      endpoint: 'oleksi.rybak@gmail.com',
      protocol: SubscriptionProtocol.EMAIL,
      topic: topic,
    });
    
    const clientCounterLambda = new lambda.Function(this, 'ClientCounterHandler', {
      runtime: lambda.Runtime.NODEJS_16_X,    
      code: lambda.Code.fromAsset('lambda'),  
      handler: 'clientCounter.handler',        
      environment: {
        DYNAMODB_TABLE: clientDonationsTable.tableName,
        SNS_TOPIC_ANR: topic.topicArn
      }
    });

    clientDonationsTable.grantReadData(clientCounterLambda);

    const consumerCounterApi = new apigw.RestApi(this, 'client-counter-api');

    const client = consumerCounterApi.root.addResource('client');
    const clientWithId = client.addResource('{id}');
    clientWithId.addMethod('GET', new apigw.LambdaIntegration(clientCounterLambda));

    clientCounterLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['dynamodb:Scan'],
        resources: [clientDonationsTable.tableArn]
      })
    );

    topic.grantPublish(clientCounterLambda);
        
  }
}
