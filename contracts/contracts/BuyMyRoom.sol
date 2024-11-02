// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

// Uncomment the line to use openzeppelin/ERC721,ERC20
// You can use this dependency directly because it has been installed by TA already
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./MyERC20.sol";

// Uncomment this line to use console.log
import "hardhat/console.sol";

contract BuyMyRoom is ERC721{

    // use a event if you want
    // to represent time you can choose block.timestamp
    event HouseListed(uint256 tokenId, uint256 price, address owner);

    // maybe you need a struct to store house information
    struct House {
        uint256 id;                 // house id
        address owner;              // house owner address
        uint256 listedTimestamp;    // time stamp
        uint256 price;              // house price
//        bool isOnSale;              // is on sale
//        bool isConfirmed;           // is confirmed
//        bool isEditingPrice;        // is editing price
        // ...
    }
    address public manager;
    MyERC20 public myERC20;

    mapping(uint256 => House) public houses; // A map from house-index to its information

    constructor() ERC721("House NFT", "HN"){
        // maybe you need a constructor
        manager = msg.sender;
        myERC20 = new MyERC20("ZJUToken", "ZJUT");
        // 分配房屋
        for (uint256 i = 0; i < 10; i++){
            houses[i] = (House({id:i, owner:manager, listedTimestamp:block.timestamp, price:0}));
        }

    }

    // 空投获取BCT
    function Airdrop() public{
        myERC20.airdrop(msg.sender);
    }

    // 获取合约管理者地址
    function getManager() public view returns (address){
        return manager;
    }

    // 获取房产列表
    function getHouses() public view returns (House[] memory){
        House[] memory houseList = new House[](10);
        for (uint256 i = 0; i < 10; i++){
            houseList[i] = houses[i];
        }
        return houseList;
    }

    // 设置房产挂售
    function setOnSale(uint256 id,uint256 price) public{
        houses[id].price=price;
        houses[id].listedTimestamp=block.timestamp;
    }

    // 获取房产拥有者和挂单信息
    function getHouseInfo(uint256 id) public view returns (address, uint256, uint256){
        return (houses[id].owner, houses[id].price, houses[id].listedTimestamp);
    }

    // 购买房产
    function buyHouse(uint256 id) public{
        if (myERC20.balanceOf(msg.sender) < houses[id].price){
            // require(1 == 2);
            return;
        }
        else{
            // 计算平台抽成，上限为房价的一半
            uint256 commission = houses[id].price * (uint256(block.timestamp) - houses[id].listedTimestamp) / 10000;

            //DEBUG
            console.log("commission: %s", commission);

            if (commission > houses[id].price / 2){
                commission = houses[id].price / 2;
            }
            myERC20.trans(msg.sender, manager, commission);
            myERC20.trans(msg.sender, houses[id].owner, houses[id].price - commission);
            houses[id].owner = msg.sender;
            houses[id].price = 0;
        }
    }

    // 修改房产价格
    function changePrice(uint256 id, uint256 price) public{
        houses[id].price = price;
    }

    function helloworld() pure external returns(string memory) {
        return "hello world";
    }

}