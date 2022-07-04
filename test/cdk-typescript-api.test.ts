import * as cdk from 'aws-cdk-lib';
import { Template, Match, Capture } from 'aws-cdk-lib/assertions';
import * as CdkTypescriptApi from '../lib/cdk-typescript-api-stack';

test('DynamoDB Table and SNS Topic Created', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new CdkTypescriptApi.CdkTypescriptApiStack(app, 'MyTestStack');
  // THEN

  const template = Template.fromStack(stack);

  template.resourceCountIs('AWS::SNS::Topic', 1);
  template.resourceCountIs('AWS::DynamoDB::Table', 1);
});

test('Lambda Has Environment Variables', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new CdkTypescriptApi.CdkTypescriptApiStack(app, 'MyTestStack');

  // THEN
  const template = Template.fromStack(stack);
  const envCapture = new Capture();
  template.hasResourceProperties("AWS::Lambda::Function", {
    Environment: envCapture,
  });

  expect(envCapture.asObject()).toEqual(
    {
      Variables: {
        DYNAMODB_TABLE: {
          Ref: "ClientDonationsA5467BC3",
        },
        SNS_TOPIC_ANR: {
          Ref: "ClientDonationsTopic931D4A0D",
        },
      },
    }
  );
});


