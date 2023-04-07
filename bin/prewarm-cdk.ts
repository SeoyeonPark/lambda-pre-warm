#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { EventbridgeScehdulesTriggerLambdaStack } from '../lib/prewarm-cdk-stack';

const app = new cdk.App();
new EventbridgeScehdulesTriggerLambdaStack(app, 'EventbridgeScehdulesTriggerLambdaStack', {
    env: { 
        account: process.env.CDK_DEFAULT_ACCOUNT, 
        region: 'ap-southeast-1' 
    }
});