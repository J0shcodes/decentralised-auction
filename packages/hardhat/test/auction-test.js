import { ethers } from "hardhat";
import { Signer } from "ethers";
import { expect } from "chai";

describe("Auction", function () {
  let auction;
  let owner;
  let bidder1;
  let bidder2;
  let startBlock;
  let endBlock;
  let biddingTime;
  let startingPrice;
  let reservePrice;
  let itemName;
  image;
  description;

  beforeEach(async function () {
    // Get the owner of the contract
    [owner, bidder1, bidder2] = await ethers.getSigners();

    // Deploy the SupportToken contract
    const auctionFactory = await ethers.getContractFactory("Auction");
    auction = await auctionFactory.deploy();

    // Wait for the contract to be mined
    await auction.deployed();

    startBlock = (await ethers.provider.getBlockNumber()) + 10;
    endBlock = startBlock + 20;
    biddingTime = 300; // seconds
    startingPrice = ethers.utils.parseEther("1");
    reservePrice = ethers.utils.parseEther("5");
    itemName = "Ferrari";
    image = "ferrari.png";
    description = "This is a ferrari vintage";
  });

  it("should allow bidders to place bids", async function () {
    // Create the auction
    await auction.createAuction(
      startBlock,
      endBlock,
      biddingTime,
      startingPrice,
      reservePrice,
      itemName,
      image,
      description
    );

    // Bidder 1 places bid
    const bidAmount1 = ethers.utils.parseEther("2");
    await auction.placeBid(0, { value: bidAmount1 });
    expect(await auction.getHighestBidder(0)).to.equal(bidder1.address);
    expect(await auction.getHighestBid(0)).to.equal(bidAmount1);

    // Bidder 2 places a higher bid
    const bidAmount2 = ethers.utils.parseEther("3");
    await auction.connect(bidder2).placeBid(0, { value: bidAmount2 });
    expect(await auction.getHighestBidder(0)).to.equal(bidder2.address);
    expect(await auction.getHighestBid(0)).to.equal(bidAmount2);
  });

  it("should not allow bids after the bidding time has ended", async function () {
    // Create the auction
    await auction.createAuction(
      startBlock,
      endBlock,
      biddingTime,
      startingPrice,
      reservePrice,
      itemName,
      image,
      description
    );

    // Fast-forward to after the end of the bidding time
    await ethers.provider.send("evm_increaseTime", [biddingTime + 1]);
    await ethers.provider.send("evm_mine", []);

    // Attempt to place a bid
    const bidAmount = ethers.utils.parseEther("2");
    await expect(auction.placeBid(0, { value: bidAmount })).to.be.revertedWith(
      "Bidding time has ended"
    );
  });
  
});
