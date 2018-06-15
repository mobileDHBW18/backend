## Task

```bash
 $ sls invoke -f <function>
```

## Expected Behavior

Execute function and send logs to sentry

## Current Behavior

`Serverless plugin "serverless-sentry-plugin" initialization errored: S.getServerlessPath is not a function`

## Context (Environment)

- OS: win32
- Node: 8.10.0
- Serverless: 1.27.3
- Raven: "^2.6.2"
- serverless-sentry : "^1.0.0"
- serverless-sentry-lib:  "^1.0.1"
- serverless-sentry-plugin:  "^0.2.1"

## Context (Code)

### Function

```javascript
const RavenWrapper = require('serverless-sentry-lib')
module.exports.function = RavenWrapper.handler(Raven, (event, context, callback) => {
       //...
})
```

### serverless.yml

```yaml
service: <service>

frameworkVersion: ">=1.1.0 <2.0.0"

plugins:
  - serverless-sentry

provider:
  name: aws
  stage: dev
  runtime: nodejs6.10

package:
  individually: true
  exclude:
    - test/**
    - coverage/**
    - .circleci/**
    - _optimize/**
    - '*.log'
    
functions:
  meals-scrape:
    handler: file.function
    events:
      - schedule: cron(0 10 ? * MON-FRI *)

custom:
  sentry:
     dsn: "sentry:dsn"

```