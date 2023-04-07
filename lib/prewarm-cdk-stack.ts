import * as cdk from 'aws-cdk-lib';
import * as path from 'path';

import { Construct } from 'constructs';
import { CfnSchedule, CfnScheduleGroup } from 'aws-cdk-lib/aws-scheduler';
import { Effect, Policy, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Duration } from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

export class EventbridgeScehdulesTriggerLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Example function that will get invoked every 5 minutes
    const exampleFunction: NodejsFunction = new NodejsFunction(this, 'scheduled-lambda-function', {
      functionName: 'sample-function-eventbridge-trigger',
      memorySize: 512,
      timeout: Duration.seconds(5),
      runtime: Runtime.NODEJS_18_X,
      handler: 'handler',
      entry: path.join(__dirname, '../src/scheduler-function/index.js'),
    });

    // need to create role and policy for scheduler to invoke the lambda function
    const schedulerRole = new Role(this, 'scheduler-role', {
      roleName: 'eventbridge-trigger-lambda-role',
      assumedBy: new ServicePrincipal('scheduler.amazonaws.com'),
    });

    new Policy(this, 'schedule-policy', {
      policyName: 'ScheduleToInvokeLambdas',
      roles: [schedulerRole],
      statements: [
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ['lambda:InvokeFunction'],
          resources: [exampleFunction.functionArn],
        }),
      ],
    });

    // Create a group for the schedule
    const group = new CfnScheduleGroup(this, 'schedule-group', {
      name: 'SchedulesForLambda',
    });

    // Creates the schedule to invoke every 5 minutes
    new CfnSchedule(this, 'sample-schedule', {
      // Lambda function name
      name: 'sample-schedule-to-trigger-lambda',
      groupName: group.name,
      flexibleTimeWindow: {
        mode: 'OFF',
      },
      // Schedule expression
      scheduleExpression: 'rate(5 minutes)',
      scheduleExpressionTimezone: 'Asia/Seoul',
      // Target lambda function arn, role arn and payload
      target: {
        arn: exampleFunction.functionArn,
        roleArn: schedulerRole.roleArn,
        input: JSON.stringify({
          "key1": "value1",
          "key2": "value2",
          "key3": "value3"
        })
      },
    });
  

  }
}
