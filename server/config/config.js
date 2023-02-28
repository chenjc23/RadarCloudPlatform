module.exports = {
  redisConfig: {
    url: 'redis://localhost:6379',
    host: 'localhost',
    port: '6379',
    // password:
  },
  mongodbConfig: {
    url: 'mongodb://localhost:27017',
    dbName: 'RadarCloudPlatform',
  },
  externConfig: {
    rawDataPrefix: 'F:/RadarProject/RadarCloudPlatform/extern/rawData/',
    sarImagePrefix: 'F:/RadarProject/RadarCloudPlatform/extern/sarImage/',
    imagingAlgorithmCall: 'F:/RadarProject/RadarCloudPlatform/extern/cppAlgorithm/Sub_Aperture.exe',
  },
};
