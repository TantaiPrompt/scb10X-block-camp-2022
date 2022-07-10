import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect, should } from "chai";
import { ethers } from "hardhat";
import { RaiStone, Bank } from "../typechain/index";

describe("RaiStone", function () {
  let allhardhatSigner: SignerWithAddress[];
  let raiStone: RaiStone;
  this.beforeAll(async () => {
    allhardhatSigner = await ethers.getSigners();
    const RaiStone = await ethers.getContractFactory("RaiStone");
    const initialSupply = ethers.utils.parseEther("100000000");
    raiStone = await RaiStone.deploy(initialSupply);
    await raiStone.deployed();
  });
  it("should deploy", async () => {
    expect(raiStone.address).to.exist;
  });
  it("should have initial supply", async () => {
    const supply = await raiStone.totalSupply();
    expect(supply).to.equal(ethers.utils.parseEther("100000000"));
  });
  it("shoulde have owner balance", async () => {
    const [owner, addr1, addr2, ...addrs]: SignerWithAddress[] = allhardhatSigner;
    const balance = await raiStone.balanceOf(owner.address);
    expect(balance).to.equal(ethers.utils.parseEther("100000000"));
  });
});

describe("Bank", function () {
  let bank: Bank;
  let raiStone: RaiStone;
  let allhardhatSigner: SignerWithAddress[];

  this.beforeAll(async () => {
    allhardhatSigner = await ethers.getSigners();
    const RaiStone = await ethers.getContractFactory("RaiStone");
    const initialSupply = ethers.utils.parseEther("100000000");
    raiStone = await RaiStone.deploy(initialSupply);
    await raiStone.deployed();
    const Bank = await ethers.getContractFactory("Bank");
    bank = await Bank.deploy(raiStone.address);
    await bank.deployed();
  });
  it("should deploy", async () => {
    expect(bank.address).to.exist;
  });
  it("should be new account", async () => {
    const [owner, addr1, addr2, ...addrs]: SignerWithAddress[] = allhardhatSigner;
    await bank.connect(owner).newAccount("test01");
    const accounts = await bank.getOwnAccount(owner.address);
    expect(accounts).to.have.lengthOf(1);
    expect(accounts[0]).to.equal("test01");
    expect((await bank.getAccount("test01")).balance).to.equal(ethers.utils.parseEther("0"));
    expect((await bank.getAccount("test01")).owner).to.equal(owner.address);
  });
  it("should revert if account already exists", async () => {
    const [owner, addr1, addr2, ...addrs]: SignerWithAddress[] = allhardhatSigner;
    await expect(bank.connect(addr2).newAccount("test01")).to.be.revertedWith("Account already exists");
  });
  it("should be deposite", async () => {
    await raiStone.approve(bank.address, ethers.constants.MaxUint256);
    const beforeBalance = await raiStone.balanceOf(bank.address);
    await bank.deposit("test01", ethers.utils.parseEther("10"));
    expect((await bank.getAccount("test01")).balance).to.equal(ethers.utils.parseEther("10"));
    expect(await raiStone.balanceOf(bank.address)).to.equal(beforeBalance.add(ethers.utils.parseEther("10")));
  });
  it("should revert if not the owner of account when deposit", async () => {
    const [owner, addr1, addr2, ...addrs]: SignerWithAddress[] = allhardhatSigner;
    await raiStone.transfer(addr1.address, ethers.utils.parseEther("1000"));
    await expect(bank.connect(addr1).deposit("test01", ethers.utils.parseEther("1000"))).to.be.revertedWith(
      "You are not the owner of this account"
    );
  });
  it("should revert if don't have enough tokens to deposit", async () => {
    await expect(bank.deposit("test01", ethers.utils.parseEther("1000000001"))).to.be.revertedWith(
      "You don't have enough tokens"
    );
  });
  it("should be withdraw", async () => {
    const [owner, addr1, addr2, ...addrs]: SignerWithAddress[] = allhardhatSigner;
    const beforeBalance = await raiStone.balanceOf(bank.address);
    await bank.connect(owner).withdraw("test01", ethers.utils.parseEther("10"));
    expect((await bank.getAccount("test01")).balance).to.equal(ethers.utils.parseEther("0"));
    expect(await raiStone.balanceOf(bank.address)).to.equal(beforeBalance.sub(ethers.utils.parseEther("10")));
  });
  it("should be transfer", async () => {
    const [owner, addr1, addr2, ...addrs]: SignerWithAddress[] = allhardhatSigner;
    await bank.connect(owner).newAccount("test02");
    await bank.deposit("test01", ethers.utils.parseEther("10"));
    await bank.connect(owner).bankTransfer("test01", "test02", ethers.utils.parseEther("10"));
    expect((await bank.connect(owner).getAccount("test01")).balance).to.equal(ethers.utils.parseEther("0"));
    expect((await bank.getAccount("test02")).balance).to.equal(ethers.utils.parseEther("10"));
  });
  it("should be transfer with 1% fee if account not your", async () => {
    const [owner, addr1, addr2, ...addrs]: SignerWithAddress[] = allhardhatSigner;
    await bank.connect(addr2).newAccount("test03");
    await bank.connect(owner).deposit("test01", ethers.utils.parseEther("10"));
    const beforeBalance = await raiStone.balanceOf(bank.address);
    await bank.connect(owner).bankTransfer("test01", "test03", ethers.utils.parseEther("10"));
    const afterBalane = await raiStone.balanceOf(bank.address);
    expect((await bank.getAccount("test01")).balance).to.equal(ethers.utils.parseEther("0"));
    expect((await bank.getAccount("test03")).balance).to.equal(ethers.utils.parseEther("9.9"));
    expect(afterBalane).to.equal(beforeBalance);
  });
  it("should be batch transfer", async () => {
    const [owner, addr1, addr2, ...addrs]: SignerWithAddress[] = allhardhatSigner;
    await bank.connect(addr2).newAccount("test04");
    await bank.connect(addr2).newAccount("test05");
    await bank.connect(owner).deposit("test01", ethers.utils.parseEther("10"));
    const beforeBalance = await raiStone.balanceOf(bank.address);
    const _to = ["test04", "test05"];
    const _amounts = [ethers.utils.parseEther("5"), ethers.utils.parseEther("5")];
    await bank.connect(owner).batchBankTransfer("test01", _to, _amounts);
    const afterBalane = await raiStone.balanceOf(bank.address);
    expect((await bank.getAccount("test01")).balance).to.equal(ethers.utils.parseEther("0"));
    expect((await bank.getAccount("test04")).balance).to.equal(ethers.utils.parseEther("4.95"));
    expect((await bank.getAccount("test05")).balance).to.equal(ethers.utils.parseEther("4.95"));
    expect(afterBalane).to.equal(beforeBalance);
  });
});
