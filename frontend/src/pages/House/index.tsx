import {Button, Image} from 'antd';
import {Header} from '../../asset'
import {useEffect, useState} from 'react';
import {houseContract, myERC20Contract, web3} from "../../utils/contracts";
import './index.css';

const GanacheTestChainId = '0x539' // Ganache默认的ChainId = 0x539 = Hex(1337)
// TODO change according to your configuration
const GanacheTestChainName = 'Ganache Test Chain'
const GanacheTestChainRpcUrl = 'http://127.0.0.1:8545'

interface House {
    id: number;
    owner: string;
    listedTimestamp: number;
    price: number;
}


const HousePage = () => {

    const [account, setAccount] = useState('')
    const [accountBalance, setAccountBalance] = useState(0)           // 账户余额
    const [managerAccount, setManagerAccount] = useState('')
    const [houseList, setHouseList] = useState<House[]>([])
    const [myHouses, setMyHouses] = useState<number[]>([])      // 我的房产的id
    const [saleHouses, setSaleHouses] = useState<number[]>([])  // 待售房产的id
    const [newPrice, setNewPrice] = useState<number[]>([])      // 更新的价格
    const [newTime, setNewTime] = useState<string[]>([])        // 更新的时间

    useEffect(() => {
        // 初始化检查用户是否已经连接钱包
        // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
        const initCheckAccounts = async () => {
            // @ts-ignore
            const {ethereum} = window;
            if (Boolean(ethereum && ethereum.isMetaMask)) {
                // 尝试获取连接的用户账户
                const accounts = await web3.eth.getAccounts()
                if(accounts && accounts.length) {
                    setAccount(accounts[0])
                }
            }
        }

        initCheckAccounts()
    }, [account])

    useEffect(() => {
        const getHouseContractInfo = async () => {
            if (houseContract) {
                try{
                    const manager = await houseContract.methods.getManager().call()
                    setManagerAccount(manager)
                }catch (error: any) {
                    console.error("[ERROR]:", error.message)
                    alert("Failed to get manager account.")
                }
            } else {
                alert('Contract not exists.')
            }
        }

        getHouseContractInfo();
    }, [houseContract]);

    useEffect(() => {
        const getAccountInfo = async () => {
            if (myERC20Contract) {
                try{
                    const ab = await myERC20Contract.methods.balanceOf(account).call()
                    setAccountBalance(ab)
                }catch (error: any) {
                    console.error("[ERROR]:", error.message)
                    alert("Failed to get account balance.")
                }
            } else {
                alert('Contract not exists.')
            }
        }

        if(account !== '') {
            getAccountInfo()
        }
    }, [account, myERC20Contract]);

    useEffect(() => {
        const fetchHouses = async () => {
            const houses = await houseContract.methods.getHouses().call();
            const _houses = houses.map((i:any) => ({
                id: i.id,
                owner: i.owner,
                listedTimestamp: i.listedTimestamp,
                price: i.price,
            }));
            setHouseList(_houses);
        }

        fetchHouses()
    }, [houseContract]);

    useEffect(() => {
        const fetchMyHouses = async () => {
            const houses1:number[] = [];
            const houses2:number[] = [];
            for(let i=0;i<houseList.length;i++){
                if(houseList[i].owner===account){
                    houses1.push(i);
                }
                if(houseList[i].price>0){
                    houses2.push(i);
                }
            }
            setMyHouses(houses1);
            setSaleHouses(houses2);
        }
        if(account !== '') {
            fetchMyHouses()
        }
    }, [account, houseList, houseContract]);


    const onClaimTokenAirdrop = async () => {
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }

        if (houseContract) {
            try {
                await houseContract.methods.Airdrop().send({
                    from: account
                })
                alert('You have claimed ZJU Token.')
            } catch (error: any) {
                alert(error.message)
            }

        } else {
            alert('Contract not exists.')
        }
        window.location.reload();
    }

    const onClickConnectWallet = async () => {
        // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
        // @ts-ignore
        const {ethereum} = window;
        if (!Boolean(ethereum && ethereum.isMetaMask)) {
            alert('MetaMask is not installed!');
            return
        }

        try {
            // 如果当前小狐狸不在本地链上，切换Metamask到本地测试链
            if (ethereum.chainId !== GanacheTestChainId) {
                const chain = {
                    chainId: GanacheTestChainId, // Chain-ID
                    chainName: GanacheTestChainName, // Chain-Name
                    rpcUrls: [GanacheTestChainRpcUrl], // RPC-URL
                };

                try {
                    // 尝试切换到本地网络
                    await ethereum.request({method: "wallet_switchEthereumChain", params: [{chainId: chain.chainId}]})
                } catch (switchError: any) {
                    // 如果本地网络没有添加到Metamask中，添加该网络
                    if (switchError.code === 4902) {
                        await ethereum.request({ method: 'wallet_addEthereumChain', params: [chain]
                        });
                    }
                }
            }

            // 小狐狸成功切换网络了，接下来让小狐狸请求用户的授权
            await ethereum.request({method: 'eth_requestAccounts'});
            // 获取小狐狸拿到的授权用户列表
            const accounts = await ethereum.request({method: 'eth_accounts'});
            // 如果用户存在，展示其account，否则显示错误信息
            setAccount(accounts[0] || 'Not able to get accounts');
        } catch (error: any) {
            alert(error.message)
        }
    }

    // 确认出售房产的处理函数
    const handleConfirmSellHouse = async (index: number) => {
        if (account === '') {
            alert('You have not connected wallet yet.')
            return
        }

        if (houseContract) {
            try {
                if (newPrice[index] <= 0) {
                    alert("the price should not be less or equal to zero!");
                } else {

                    await houseContract.methods.setOnSale(index, newPrice[index]).send({
                        from: account
                    })
                    alert('You have set the house on sale.')
                    let a = newTime;
                }

            } catch (error: any) {
                console.log(error)
            }
        } else {
            alert('Contract not exists.')
        }
        let a = newTime;
        window.location.reload();
    }

    const handlePriceChange = (index:number,value:number) => {
        let a=newPrice;
        a[index]=value;
        setNewPrice(a);
    }

    // 购买房产的处理函数
    const handleBuyHouse = async (index: number) => {
        if (account === '') {
            alert('You have not connected wallet yet.')
            return
        }

        if (houseContract && myERC20Contract) {
            try {
                await houseContract.methods.buyHouse(index).send({
                    from: account
                })
                alert('You have bought the house.')
            } catch (error: any) {
                console.log(error)
            }
        } else {
            alert('Contract not exists.')
        }
        window.location.reload();
    }

    // 修改房产价格的处理函数
    const handleChangeHousePrice = async (index: number) => {
        if (account === '') {
            alert('You have not connected wallet yet.')
            return
        }

        if (houseContract && myERC20Contract) {
            try {
                if (newPrice[index] <= 0) {
                    alert("the price should not be less or equal to zero!");
                } else {
                    await houseContract.methods.changePrice(index, newPrice[index]).send({
                        from: account
                    })
                    alert('You have changed the house price.')
                }

            } catch (error: any) {
                console.log(error)
            }
        } else {
            alert('Contract not exists.')
        }
        window.location.reload();
    }

    const handleTime = async (index: number) => {
        let a = newTime;
        a[index] = timeHandler(houseList[index].listedTimestamp);
        setNewTime(a);
    }

    const timeHandler = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleString();
    }


    return (
        <div className='container'>
            <Image
                width='100%'
                height='400px'
                preview={false}
                src={Header}
            />
            <div className='main'>
                <h1>浙大数字房产</h1>
                <div>管理员地址：{managerAccount}</div>
                {account === '' && <Button onClick={onClickConnectWallet}>连接钱包</Button>}
                <div>当前用户地址：{account === '' ? '无用户连接' : account}</div>
                <div>当前用户余额：{account === '' ? 0 : accountBalance.toString()}</div>
                <Button onClick={onClaimTokenAirdrop}>领取浙大币空投</Button>
                <h2>我的房产</h2>
                <ul>
                    {myHouses.map((i) => (
                        <li key={i}>
                            <div>房产ID：{houseList[i].id.toString()}</div>
                            <img src={`/house${houseList[i].id}.jpg`} style={{width: '500px', height: 'auto'}}/>
                            <div>出售状态：{houseList[i].price > 0 ? '是' : '否'}</div>
                            <input
                                type="number"
                                placeholder="输入出售价格"
                                onChange={(e) => handlePriceChange(i, Number(e.target.value))}
                                style={{visibility: houseList[i].price == 0 ? 'visible' : 'hidden'}}
                            />
                            <Button style={{width: '100px', visibility: houseList[i].price == 0 ? 'visible' : 'hidden'}}
                                    onClick={() => handleConfirmSellHouse(i)}>出售</Button>
                            <br/>
                            <input
                                type="number"
                                placeholder="输入修改价格"
                                onChange={(e) => handlePriceChange(i, Number(e.target.value))}
                                style={{visibility: houseList[i].price != 0 ? 'visible' : 'hidden'}}
                            />
                            <Button style={{width: '100px', visibility: houseList[i].price != 0 ? 'visible' : 'hidden'}}
                                    onClick={() => handleChangeHousePrice(i)}>修改价格</Button>
                        </li>
                    ))}
                </ul>
                <h2>在售房产</h2>
                <ul>
                    {saleHouses.map((i) => (
                        <li key={i}>
                            <div>房产ID：{houseList[i].id.toString()}</div>
                            <img src={`/house${houseList[i].id}.jpg`} style={{width: '500px', height: 'auto'}}/>
                            <div>价格：{houseList[i].price.toString()}</div>
                            <div>拥有者：{houseList[i].owner}</div>
                            <Button style={{
                                width: '100px',
                                visibility: (houseList[i].owner != account) ? 'visible' : 'hidden'
                            }} onClick={() => handleBuyHouse(i)}>购买</Button>
                        </li>
                    ))}
                </ul>

            </div>
        </div>
    )
}

export default HousePage