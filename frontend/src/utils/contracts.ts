import Address from './contracts_addresses.json'
import House from './abis/BuyMyRoom.json'
import MyERC20 from './abis/MyERC20.json'

const { Web3 } = require('web3');

// @ts-ignore
// 创建web3实例
// 可以阅读获取更多信息https://docs.metamask.io/guide/provider-migration.html#replacing-window-web3
let web3 = new Web3(window.ethereum)

// 修改地址为部署的合约地址
const houseAddress = Address.house
const houseABI = House.abi
const myERC20Address = Address.myERC20
const myERC20ABI = MyERC20.abi

// 获取合约实例
const houseContract = new web3.eth.Contract(houseABI, houseAddress);
const myERC20Contract = new web3.eth.Contract(myERC20ABI, myERC20Address);

// 导出web3实例和其它部署的合约
export {web3, houseContract, myERC20Contract}