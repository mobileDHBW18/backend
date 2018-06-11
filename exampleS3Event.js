const event = {
  eventVersion: '2.0',
  eventSource: 'aws:s3',
  awsRegion: 'eu-central-1',
  eventTime: '2018-06-10T15: 30: 10.384Z',
  eventName: 'ObjectCreated:Put',
  userIdentity: {
    principalId: 'A2IPHO7YM3D501'
  },
  requestParameters: {
    sourceIPAddress: '89.13.42.130'
  },
  responseElements: {
    'x-amz-request-id': '993AD1FC7309ECB0',
    'x-amz-id-2': 'iHDjbKCYKp7fu/caxbsLgRQICIerutwztWwKQyVlaz5y2uH/J65617NGMwe64JSdShpZAB9zWm8='
  },
  s3: {
    s3SchemaVersion: '1.0',
    configurationId: '3a39a05c-d718-4c3e-860e-e63f59f5a724',
    bucket: {
      name: 'cantinr-dev-photos',
      ownerIdentity: [Object
      ],
      arn: 'arn:aws:s3: : :cantinr-dev-photos'
    },
    object: {
      key: 'architecture.png',
      size: 91122,
      eTag: '77c4985ffba0258697c0f42e22c9e5a8',
      sequencer: '005B1D440257F8CBED'
    }
  }
}
