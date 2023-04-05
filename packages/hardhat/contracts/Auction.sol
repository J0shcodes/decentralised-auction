// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

contract Auction {
    uint256 productsLength = 0;

    struct Product {
        address payable auctionOwner;
        string name;
        string image;
        string description;
        uint256 biddingTime;
        uint256 startBlock;
        uint256 endBlock;
        uint256 startPrice;
        uint256 reservePrice;
        uint256 highestBid;
        address payable highestBidder;
        bool ended;
    }

    mapping(uint256 => Product) internal products;
    mapping(address => uint256) public bids;
    mapping(address => uint256[]) public auctionsByCreator;

    event AuctionCreated(
        string name,
        uint256 startingPrice,
        uint256 reservePrice,
        uint256 biddingTime,
        uint256 startBlock,
        uint256 endBlock
    );
    event AuctionEnded(string name, address winner, uint256 highestBid);
    event BidPlaced(address bidder, uint256 amount);
    event BidWithdrawn(address bidder, uint256 amount);
    event BidRefunded(address bidder, uint256 amount);
    event NewHighestBid(address bidder, uint256 amount);

    function getProductsLength() public view returns (uint256) {
        return (productsLength);
    }

    function createAuction(
        string memory _name,
        string memory _image,
        string memory _description,
        uint256 _startPrice,
        uint256 _startBlock,
        uint256 _endBlock,
        uint256 _reservePrice,
        uint256 _biddingTime
    ) public {
        require(
            _startBlock > block.number,
            "Auction start block must be in the future"
        );
        require(
            _endBlock > _startBlock,
            "Auction end block must be after start block"
        );

        products[productsLength] = Product({
            auctionOwner: payable(msg.sender),
            name: _name,
            image: _image,
            description: _description,
            biddingTime: _biddingTime,
            startBlock: _startBlock,
            endBlock: _endBlock,
            startPrice: _startPrice,
            reservePrice: _reservePrice,
            highestBid: 0,
            highestBidder: payable(address(0)),
            ended: false
        });
        productsLength++;

        emit AuctionCreated(
            _name,
            _startPrice,
            _reservePrice,
            _biddingTime,
            _startBlock,
            _endBlock
        );
    }

    function placeBid(uint256 _index) public payable {
        require(
            block.number >= products[_index].startBlock &&
                block.number <= products[_index].endBlock,
            "Bidding period has ended."
        );

        require(
            msg.value > products[_index].highestBid &&
                msg.value >= products[_index].reservePrice,
            "Bid is too low"
        );

        if (products[_index].highestBidder != address(0)) {
            bids[products[_index].highestBidder] += products[_index].highestBid;
            products[_index].highestBidder.transfer(products[_index].highestBid);
            emit BidRefunded(products[_index].highestBidder, products[_index].highestBid);
        }

        // _highestBid = msg.value;
        products[_index].highestBid = msg.value;
        products[_index].highestBidder = payable(msg.sender);
        bids[msg.sender] += msg.value;

        emit NewHighestBid(products[_index].highestBidder, products[_index].highestBid);
        emit BidPlaced(msg.sender, msg.value);

        if (block.number >= products[_index].endBlock) {
            endAuction(_index);
        }
        
    }

    // Function to withdraw a bid
    function withdrawBid(uint256 _index) public {
        // Check that the bidder has a bid to withdraw
        require(!products[_index].ended, "Auction has already ended");
        require(block.number < products[_index].endBlock, "Auction has ended");
        require(bids[msg.sender] > 0, "No bids to withdraw");

        // Refund the bidder's bid
        uint256 amount = bids[msg.sender];
        bids[msg.sender] = 0;
        payable(msg.sender).transfer(amount);

        emit BidWithdrawn(msg.sender, amount);
    }

    function endAuction(uint256 _index) public {
        // Check that the bidding period has ended\
        require(!products[_index].ended, "Auction has already ended");
        require(
            block.number > products[_index].endBlock,
            "Bidding period has not ended"
        );

        products[_index].ended = true;

        if(products[_index].highestBid >= products[_index].reservePrice) {
            products[_index].auctionOwner.transfer(products[_index].highestBid);
            emit AuctionEnded(products[_index].name, products[_index].highestBidder, products[_index].highestBid);
        } else {
            emit AuctionEnded(products[_index].name, address(0), 0);
        }

        // Transfer the highest bid to the owner
        // uint256 amount = _highestBid;
        // _highestBid = 0;
        // // payable(owner).transfer(amount);

        // emit AuctionEnded();
    }

    function readProductDetails(uint256 _index)
        public
        view
        returns (
            address payable,
            string memory,
            string memory,
            string memory,
            uint256,
            uint256,
            uint256
        )
    {
        return (
            products[_index].auctionOwner,
            products[_index].name,
            products[_index].image,
            products[_index].description,
            products[_index].startBlock,
            products[_index].endBlock,
            products[_index].highestBid
        );
    }

    function readAuctionDetails(uint256 _index)
        public
        view
        returns (
            uint256,
            uint256,
            uint256,
            uint256,
            uint256
        )
    {
        return (
            products[_index].startBlock,
            products[_index].endBlock,
            products[_index].startPrice,
            products[_index].reservePrice,
            products[_index].highestBid
        );
    }
}
