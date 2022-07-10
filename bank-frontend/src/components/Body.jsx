import { useState, useEffect } from "react";
import { CreateAccount, NewAccButton } from "./CreateAccount";
import { Deposit } from "./Deposit";
import { Withdraw } from "./Withdraw";
import { Transfer } from "./Transfer";
import Accounts from "./Accounts";
import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import config from "../config.json";
import { Waveform } from "@uiball/loaders";

const Body = ({ myAccounts, setMyAccounts, modal, setModal }) => {
  const { library,  } = useWeb3React();
  const [selectAccount, setSelectAccount] = useState(null);

  const [isLoding, setIsLoding] = useState(false);

  const AccountStruct = "tuple(address,uint256,bool)";
  const abi = [
    "function getOwnAccount(address _owner) external view returns (string[])",
    `function getAccount(string memory _name) external view returns (${AccountStruct})`,
  ];
  useEffect(() => {
    const getAccounts = async () => {
      try {
        const IBank = new ethers.Contract(config.contract_addr, abi, library);
        const accounts = await IBank.getOwnAccount(
          library.getSigner().getAddress()
        );
        const accountsInfos = [];
        for (let i = 0; i < accounts.length; i++) {
          const accountInfo = await IBank.getAccount(accounts[i]);
          const filteredAccountInfo = {
            name: accounts[i],
            balance: ethers.utils.formatEther(accountInfo[1]),
          };
          accountsInfos.push(filteredAccountInfo);
        }
        setMyAccounts(accountsInfos);
      } catch (error) {
        console.log(error);
      }
    };
    getAccounts();
  }, [library, isLoding]);

  return (
    <div className="flex justify-center mx-60 my-12 ">
      {myAccounts && library && !isLoding ? (
        <div className="flex-col w-3/4">
          {(() => {
            //   console.log(selectAccount);
            switch (modal) {
              case "newAccountModal":
                return (
                  <>
                    <h1 className="font-medium text-lg">
                      Create your bank account
                    </h1>
                    <CreateAccount
                      setModal={setModal}
                      setIsLoding={setIsLoding}
                    />
                  </>
                );
              case "depositModal":
                return (
                  <>
                    <h1 className="font-medium text-lg">Deposit Token</h1>
                    <Deposit
                      setModal={setModal}
                      selectAccount={selectAccount}
                      setIsLoding={setIsLoding}
                    />
                  </>
                );
              case "withdrawModal":
                return (
                  <>
                    <h1 className="font-medium text-lg">Withdraw Token</h1>
                    <Withdraw
                      setModal={setModal}
                      selectAccount={selectAccount}
                      setIsLoding={setIsLoding}
                    />
                  </>
                );
              case "transferModal":
                return (
                  <>
                    <h1 className="font-medium text-lg">Transfer Token</h1>
                    <Transfer
                      setModal={setModal}
                      selectAccount={selectAccount}
                      setIsLoding={setIsLoding}
                    />
                  </>
                );

              default:
                return (
                  <>
                    <h1 className="font-medium text-lg">My Accounts</h1>
                    <Accounts
                      accounts={myAccounts}
                      setModal={setModal}
                      setSelectAccount={setSelectAccount}
                    />
                    <NewAccButton setModal={setModal} />
                  </>
                );
            }
          })()}
        </div>
      ) : (
        <div className="flex justify-center h-screen items-center">
          <Waveform size={100} lineWeight={5} speed={1} color="#582c83" />
        </div>
      )}
    </div>
  );
};

export default Body;
