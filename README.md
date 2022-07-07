# Welcome to your CDK TypeScript project

You should explore the contents of this project. It demonstrates a CDK app with an instance of a stack (`CdkTypescriptApiStack`)
which contains an Amazon SQS queue that is subscribed to an Amazon SNS topic.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template

## Deployment steps
- Download the code from the repo
- go to the root directory of the project
- run `npm cache clean --force` and then `npm install` to install the required libraries
- run `cdk bootstrap` which will install the bootstrap stack of the environment
- run `cdk deploy -c email_acc=<email account>`. in place of `<email account>` place your email account. After deployment check your email and confirm the subscription.
- add data into DynamoDB. There are two columns that need to be populated with the following format: id-value.
- copy the generated url from the command line and add `/client/<id>` for example `https://orrfby8ayb.execute-api.eu-west-2.amazonaws.com/prod/client/1` to see how many payments have been made for a particular client. If there are 2 or more an email with the confrimation should be generated.


