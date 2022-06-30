#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CdkTypescriptApiStack } from '../lib/cdk-typescript-api-stack';

const app = new cdk.App();
new CdkTypescriptApiStack(app, 'CdkTypescriptApiStack');
