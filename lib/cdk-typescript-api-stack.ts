import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { RemovalPolicy, CfnOutput } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Subscription, SubscriptionProtocol, Topic } from 'aws-cdk-lib/aws-sns';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { RestApi } from 'aws-cdk-lib/aws-apigateway';

export class CdkTypescriptApiStack extends Stack {

  private clientDonationsTable: Table;
  private clientDonationsTableName: string;
  private consumerCounterApi: RestApi;
  private clientCounterLambda: lambda.Function;
  private topic: Topic;
  private topicArn: string;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.createClientDonationsTable();
    
    const emailAcc = this.node.tryGetContext('email_acc');
    this.topic = new sns.Topic(this, 'ClientDonationsTopic', {
      displayName: 'ClientDonationsTopic',
    });
    this.topicArn = this.topic.topicArn;

    new Subscription(this, 'EmailSubscription', {
      endpoint: emailAcc,
      protocol: SubscriptionProtocol.EMAIL,
      topic: this.topic,
    });
        
    this.createCustomerApiLambda();

    this.topic.grantPublish(this.clientCounterLambda);
    this.clientDonationsTable.grantReadData(this.clientCounterLambda);

    this.addClientApiResources();

  }

  private createClientDonationsTable = () => {
    this.clientDonationsTable = new dynamodb.Table(this, 'ClientDonations', {
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
    this.clientDonationsTableName = this.clientDonationsTable.tableName
  }

  private addClientApiResources = () => {

    this.consumerCounterApi = new apigw.RestApi(this, 'client-counter-api', {
      description: 'Donations Counter API',      
    });

    const clients = this.consumerCounterApi.root.addResource('clients');
    const clientWithId = clients.addResource('{id}');
    clients.addMethod('GET', new apigw.LambdaIntegration(this.clientCounterLambda));
    clients.addMethod('PUT', new apigw.LambdaIntegration(this.clientCounterLambda));

    clientWithId.addMethod('GET', new apigw.LambdaIntegration(this.clientCounterLambda));
    clientWithId.addMethod('DELETE', new apigw.LambdaIntegration(this.clientCounterLambda));

  }  

  private createCustomerApiLambda = () => {
    this.clientCounterLambda = new lambda.Function(this, 'ClientCounterHandler', {
      runtime: lambda.Runtime.NODEJS_16_X,    
      code: lambda.Code.fromAsset('lambda'),  
      handler: 'clientCounter.handler',        
      environment: {
        DYNAMODB_TABLE: this.clientDonationsTableName,
        SNS_TOPIC_ANR: this.topicArn
      }
    });

    this.clientCounterLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: [
          "dynamodb:BatchGetItem",
          "dynamodb:GetItem",
          "dynamodb:Scan",
          "dynamodb:Query",
          "dynamodb:BatchWriteItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem"
      ],
        resources: [this.clientDonationsTable.tableArn]
      })
    );

  }  

}
