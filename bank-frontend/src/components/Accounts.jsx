const Account = ({ name, balance, setModal, setSelectAccount }) => {
  const handleClick = (modal, name) => {
    setModal(modal);
    setSelectAccount(name);
  };
  return (
    <div className="flex flex-col border border-purple-400 rounded-xl shadow-lg pt-8 my-10">
      <div className="px-8 ">
        <div class="flex items-center ">
          <div class="w-2/6">
            <label class="block  font-medium text-start mb-1 md:mb-0 pr-4">
              Account Name :
            </label>
          </div>
          <div class="flex items-center w-4/6 h-10 text-gray-500  truncate">
            {name}
          </div>
        </div>
        <div class="flex items-center ">
          <div class="w-2/6">
            <label class="block  font-medium text-start mb-1 md:mb-0 pr-4">
              Balance:
            </label>
          </div>
          <div class="flex items-center w-4/6 h-10  text-gray-500  truncate">
            {`${balance} RAI`}
          </div>
        </div>
      </div>

      <div className="flex flex-row text-sm mt-5 text-gray-500 rounded-b-xl border-t ">
        <button
          className="flex justify-center w-full  py-5
                       hover:text-violet-800
                         rounded-bl-xl "
          onClick={() => handleClick("depositModal", name)}
        >
          Deposite
        </button>
        <button
          className="flex justify-center w-full  py-5 
                        hover:text-violet-800
                        "
          onClick={() => handleClick("withdrawModal", name)}
        >
          Withdraw
        </button>
        <button
          className="flex justify-center w-full  py-5 
                       hover:text-violet-800
                         rounded-br-xl"
          onClick={() => handleClick("transferModal", name)}
        >
          Transfer
        </button>
      </div>
    </div>
  );
};

const Accounts = ({ accounts, setModal, setSelectAccount }) => {
  return (
    <>
      {accounts.map((account) => (
        <Account
          {...account}
          setModal={setModal}
          setSelectAccount={setSelectAccount}
        />
      ))}
    </>
  );
};
export default Accounts;
