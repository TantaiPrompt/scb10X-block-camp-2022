// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./IBank.sol";

contract Bank is IBank, Ownable, ReentrancyGuard {
    IERC20 public immutable raiStone;

    mapping(string => Account) public accounts;
    mapping(address => string[]) public ownAccounts;

    constructor(IERC20 raiStone_) {
        raiStone = raiStone_;
    }

    function _isExisted(string memory name) internal view returns (bool) {
        return accounts[name].isExisted;
    }

    function newAccount(string memory _name) external override {
        require(!_isExisted(_name), "Account already exists");
        accounts[_name].isExisted = true;
        accounts[_name].balance = 0;
        accounts[_name].owner = msg.sender;
        ownAccounts[msg.sender].push(_name);
        emit NewAccount(_name, msg.sender);
    }

    function deposit(string memory _to, uint256 _amount) external override nonReentrant {
        require(_amount >= 0, "invalid _amount");
        require(_isExisted(_to), "Account does not exist");
        require(msg.sender == accounts[_to].owner, "You are not the owner of this account");
        require(raiStone.balanceOf(msg.sender) >= _amount, "You don't have enough tokens");
        require(raiStone.allowance(msg.sender, address(this)) >= _amount, "You don't have enough allowance");
        accounts[_to].balance += _amount;
        raiStone.transferFrom(msg.sender, address(this), _amount);
        emit Deposite(msg.sender, _to, _amount);
    }

    function withdraw(string memory _from, uint256 _amount) external override nonReentrant {
        require(_amount >= 0, "invalid _amount");
        require(_isExisted(_from), "Account does not exist");
        require(msg.sender == accounts[_from].owner, "You are not the owner of this account");
        require(accounts[_from].balance >= _amount, "You don't have enough tokens");
        accounts[_from].balance -= _amount;
        raiStone.transfer(msg.sender, _amount);
        emit Withdraw(_from, msg.sender, _amount);
    }

    function bankTransfer(
        string memory _from,
        string memory _to,
        uint256 _amount
    ) external override nonReentrant {
        _bankTransfer(_from, _to, _amount);
        emit BankTransfer(_from, _to, _amount);
    }

    function _bankTransfer(
        string memory _from,
        string memory _to,
        uint256 _amount
    ) internal {
        require(_amount >= 0, "invalid _amount");
        require(_isExisted(_from), "Account does not exist");
        require(_isExisted(_to), "Destination account does not exist");
        require(msg.sender == accounts[_from].owner, "You are not the owner of this account");
        require(accounts[_from].balance >= _amount, "You don't have enough tokens");

        uint256 estimateAmount;

        if (msg.sender != accounts[_to].owner) {
            uint256 fee = (_amount * 1) / 100;
            estimateAmount = _amount - fee;
        } else {
            estimateAmount = _amount;
        }

        accounts[_from].balance -= _amount;
        accounts[_to].balance += estimateAmount;
        emit BankTransfer(_from, _to, _amount);
    }

    function batchBankTransfer(
        string memory _from,
        string[] memory _to,
        uint256[] memory _amounts
    ) external override nonReentrant {
        require(_to.length == _amounts.length, "Arrays must have the same length");
        for (uint256 i = 0; i < _to.length; i++) {
            _bankTransfer(_from, _to[i], _amounts[i]);
        }
    }

    function getOwnAccount(address _owner) external view override returns (string[] memory) {
        return ownAccounts[_owner];
    }

    function getAccount(string memory _name) external view override returns (Account memory) {
        return accounts[_name];
    }

    function feeWithdraw() external nonReentrant onlyOwner {
        require(raiStone.balanceOf(address(this)) > 0, "Empty fee");
        raiStone.transfer(msg.sender, raiStone.balanceOf(address(this)));
    }

    function withdrawMoney() external nonReentrant onlyOwner {
        (bool success, ) = msg.sender.call{value: address(this).balance}("");
        require(success, "Transfer failed.");
    }

    receive() external payable {}
}
