// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IBank {
    struct Account {
        address owner;
        uint256 balance;
        bool isExisted;
    }
    event NewAccount(string indexed name, address indexed _owner);
    event Deposit(address indexed from, string indexed to, uint256 indexed amount);
    event Withdraw(string indexed from, address indexed to, uint256 indexed amount);
    event BankTransfer(string indexed from, string indexed to, uint256 indexed amount);

    function newAccount(string memory _name) external;

    function deposit(string memory _to, uint256 _amount) external;

    function withdraw(string memory _to, uint256 _amousnt) external;

    function bankTransfer(
        string memory _from,
        string memory _to,
        uint256 _amount
    ) external;

    function batchBankTransfer(
        string memory _from,
        string[] memory _to,
        uint256[] memory _amount
    ) external;

    function getOwnAccount(address _owner) external view returns (string[] memory);

    function getAccount(string memory _name) external view returns (Account memory);
}
