import { useEffect } from "react";
import { useWeb3React, UnsupportedChainIdError } from "@web3-react/core";
import { injected } from "../connectors";

const Header = ({ myAccounts, setMyAccounts, setModal }) => {
  const { active, account, activate, deactivate } = useWeb3React();
  const handleConnectWallet = () => {
    const { ethereum } = window;

    if (!ethereum) {
      alert("MetaMask not install");
      return;
    }

    activate(injected)
      .then(async () => {
        localStorage.setItem("isWalletConnected", "connected");
      })
      .catch((error) => {
        if (error instanceof UnsupportedChainIdError) {
          activate(injected);
        } else {
          console.error(error);
        }
      });
  };

  const logout = () => {
    localStorage.setItem("isWalletConnected", "disconnect");
    setMyAccounts(null);
    deactivate();
  };

  useEffect(() => {
    const connectWalletOnPageLoad = async () => {
      if (localStorage?.getItem("isWalletConnected") === "connected") {
        try {
          await handleConnectWallet();
          localStorage.setItem("isWalletConnected", "connected");
        } catch (ex) {
          localStorage.setItem("isWalletConnected", "disconnect");
        }
      } else {
      }
    };
    connectWalletOnPageLoad();
  }, []);
  return (
    <nav className="flex items-center justify-between text-black font-Montserrat flex-wrap p-6">
      <div className="flex items-center flex-shrink-0 text-black mr-6">
        <button
          className="font-bold text-3xl tracking-tight"
          onClick={() => setModal("myAccountModal")}
        >
          🚀 10XBank
        </button>
      </div>
      {!active ? (
        <button
          className="inline-block text-xl text-gray-500 
                     px-4 py-2 leading-none border
                     rounded-xl  border-gray-500 
                     transition ease-in-out
                     delay-150 duration-300
                     shadow-md
                     bg-transparent
                     hover:text-violet-800  mt-4 lg:mt-0"
          onClick={handleConnectWallet}
        >
          Connect wallet
        </button>
      ) : (
        <button
          className="inline-block text-xl text-violet-800
                 px-4 py-2 leading-none border
                 rounded-xl  border-gray-500 
                 transition ease-in-out
                 delay-150 duration-300
                 shadow-md
                 bg-transparent
                 hover:text-gray-500  mt-4 lg:mt-0"
          onClick={logout}
        >
          {`${account.substring(0, 6)}...${account.substring(
            account.length - 4
          )}`}
        </button>
      )}
    </nav>
  );
};

export default Header;
