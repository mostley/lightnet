module.exports = {
  dbUrl: 'mongodb://teachable:teachable@ds043982.mongolab.com:43982/teachable',
  //dbUrl: 'mongodb://mongo/machinenet',
  discoverySrcPort: 25251,
  discoveryPort: 2525,
  discoveryInterval: 3000,
  machinePingInterval: 3000,
  //discoveryMulticastAddress: '239.255.255.250'
  discoveryMulticastAddress: '224.0.0.1'
};