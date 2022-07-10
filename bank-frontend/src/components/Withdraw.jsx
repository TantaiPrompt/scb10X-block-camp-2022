import { useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import config from "../config.json";
export const Withdraw = ({ setModal, selectAccount, setIsLoding }) => {
  const [amount, setAmount] = useState(0);
  const { library } = useWeb3React();
  const handleWithdraw = async (amount) => {
    try {
      setIsLoding(true);
      const abi = [
        "function withdraw(string memory _to, uint256 _amousnt) external",
      ];
      console.log(amount);
      const IBank = new ethers.Contract(
        config.contract_addr,
        abi,
        library.getSigner()
      );
      const tx = await IBank.withdraw(
        selectAccount,
        ethers.utils.parseEther(amount)
      );
      const res = await tx.wait();
      console.log(res);
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
              class="bg-gray-200 appearance-none border-2 font-medium  border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
              type="number"
              value={amount}
              min={0}
              max={ethers.constants.MaxUint256}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>

        <div class="flex justify-end items-center">
          <button
            class="shadow bg-purple-500 hover:bg-purple-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
            type="button"
            onClick={() => handleWithdraw(amount)}
          >
            withdraw
          </button>
        </div>
      </div>
    </form>
  );
};
