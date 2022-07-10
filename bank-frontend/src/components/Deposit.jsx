import { useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import config from "../config.json";
export const Deposit = ({ setModal, selectAccount, setIsLoding }) => {
  const [amount, setAmount] = useState(0);
  const { library } = useWeb3React();
  const handleDeposite = async (amount) => {
    try {
      setIsLoding(true);
      const abi = [
        "function deposit(string memory _to, uint256 _amount) external",
      ];
      const IERC20_abi = [
        "function approve(address spender, uint256 amount) external returns (bool)",
        "function allowance(address owner, address spender) external view returns (uint256)",
      ];

      const IERC20 = new ethers.Contract(
        config.rai_stone_addr,
        IERC20_abi,
        library.getSigner()
      );
      console.log("IERC20", IERC20);

      const allowance = await IERC20.allowance(
        library.getSigner().getAddress(),
        config.contract_addr
      );
      if (parseFloat(ethers.utils.formatEther(allowance)) < amount) {
        await IERC20.approve(config.contract_addr, ethers.constants.MaxUint256);
      } else {
        const IBank = new ethers.Contract(
          config.contract_addr,
          abi,
          library.getSigner()
        );
        const tx = await IBank.deposit(
          selectAccount,
          ethers.utils.parseEther(amount)
        );
        const res = await tx.wait();
        console.log(res);
      }
    } catch (error) {
      alert("some thing when wrong!!");
      console.log(error);
    } finally {
      setIsLoding(false);
      setModal("myAccountModal");
    }
  };
  return (
    <form
      class="flex flex-col  justify-center w-full my-6 py-20 border
      border-violet-600 font-semibold hover:text-violet-500
      shadow-lg rounded-br-xl"
    >
      <div class=" mx-14">
        <div class="flex items-center mb-6">
          <div class="md:w-1/6">
            <label class="block text-gray-500 font-bold text-center mb-1 md:mb-0 pr-4">
              Amount
            </label>
          </div>
          <div class="md:w-5/6">
            <input
              class="bg-gray-200 appearance-none border-2 font-medium   border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
              type="number"
              min={0}
              max={ethers.constants.MaxUint256}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>

        <div class="flex justify-end items-center">
          <button
            class="shadow bg-purple-500 hover:bg-purple-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
            type="button"
            onClick={() => handleDeposite(amount)}
          >
            Deposite
          </button>
        </div>
      </div>
    </form>
  );
};
