import { useCelo } from "@celo/react-celo";
import Image from "next/image";
import auctionAbi from "@/auction.abi";
import { AbiItem } from "web3-utils";
import { useEffect, useState } from "react";
import BigNumber from "bignumber.js";
import moment from "moment";
require("dotenv").config({ path: ".env" });

import PlaceBidModal from "@/components/modals/bid";

export default function Home() {
  const { address, kit } = useCelo();

  const [totalAuctions, setTotalAuctions] = useState<any[]>([]);
  const [totalAuctionDetails, setAuctionDetails] = useState<any[]>([]);
  const [openBidForm, setOpenBidForm] = useState(false);
  const [auctionIndex, setAuctionIndex] = useState<number>();

  const auctionContractAddress = "0x0623F1eD47c5D4844EE887c58325F326f8A6a535";

  let auctionDurations: string[] = [];

  const onClose = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setOpenBidForm(false);
  };

  if (totalAuctions) {
    totalAuctions.map((auction) => {
      const startTime = moment.unix(+auction.startBlock * 5).format("HH:mm:ss");
      const endTime = moment
        .unix(BigNumber(auction.endBlock).toNumber())
        .format("HH:mm:ss");

      const auctionDuration = `${startTime} - ${endTime}`;

      auctionDurations.push(auctionDuration);
    });
  }

  const getAuctions = async () => {
    const contract = new kit.connection.web3.eth.Contract(
      auctionAbi as AbiItem[],
      auctionContractAddress
    );

    const auctionLength = await contract.methods.getProductsLength().call();

    let auctions = [];

    let auctionDetails = [];

    for (let i = 0; i < auctionLength; i++) {
      let auction = new Promise(async (resolve, reject) => {
        let p = await contract.methods.readProductDetails(i).call();
        resolve({
          index: i,
          auctionOwner: p[0],
          name: p[1],
          image: p[2],
          description: p[3],
          startBlock: p[4],
          endBlock: new BigNumber(p[5]),
          highestBidder: p[6],
        });
      });
      auctions.push(auction);
    }

    for (let i = 0; i < auctionLength; i++) {
      let auction = new Promise(async (resolve, reject) => {
        let p = await contract.methods.readAuctionDetails(i).call();
        resolve({
          index: i,
          startBlock: p[0],
          endBlock: p[1],
          startPrice: p[2],
          reservePrice: p[3],
          highestBid: p[4],
        });
      });
      auctionDetails.push(auction);
    }
    console.log(await Promise.all(auctions));
    setTotalAuctions(await Promise.all(auctions));
    setAuctionDetails(await Promise.all(auctionDetails));
  };

  function getAuctionIndex(index: number) {
    setAuctionIndex(index);
    setOpenBidForm(true);
  }

  async function withdrawBid(index: number) {
    const auctionContract = new kit.connection.web3.eth.Contract(
      auctionAbi as AbiItem[],
      auctionContractAddress
    );

    const result = await auctionContract.methods.withdrawBid(index).call();

    console.log(result);
  }

  useEffect(() => {
    if (address) {
      getAuctions();
    }
  }, []);

  console.log(totalAuctions);

  return (
    <div className="relative">
      <div className="">
        <div className="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-10">
          {totalAuctions
            ? totalAuctions.map((auction, index) => (
                <div className="shadow-xl rounded-md relative h-fit">
                  <div className="w-full">
                    <Image
                      src={auction.image}
                      alt=""
                      width={350}
                      height={350}
                      className="w-full object-contain relative"
                    />
                  </div>
                  <div className="p-3">
                    <div>
                      <h3 className="font-bold text-lg mb-2">{auction.name}</h3>
                      <p className="text-sm">
                        {auction.description}
                      </p>
                    </div>
                    <div className="mt-8">
                      <div className="text-sm">
                        <p>{auctionDurations[index]}</p>
                      </div>
                      <div className="flex justify-between">
                        <button
                          className="bg-green-500 text-white p-2 rounded mt-4 w-[40%]"
                          onClick={() => getAuctionIndex(auction.index)}
                        >
                          Place Bid
                        </button>
                        <button
                          className="bg-red-500 text-white p-2 rounded mt-4 w-[40%]"
                          onClick={() => withdrawBid(auction.index)}
                        >
                          Withdraw Bid
                        </button>
                      </div>
                    </div>
                  </div>
                  {totalAuctionDetails ? (
                    <div className="absolute top-0 left-1 text-white text-sm">
                      <div className="flex justify-between w-[120px]">
                        <p>Start Price:</p>
                        <p>
                          {totalAuctionDetails[index].startPrice}{" "}
                          Celo
                        </p>
                      </div>
                      <div className="flex justify-between w-[140px]">
                        <p>Reserve Price:</p>
                        <p>{totalAuctionDetails[index].reservePrice} Celo</p>
                      </div>
                      <div className="flex justify-between w-[120px]">
                        <p>Higest Bid:</p>
                        <p>{totalAuctionDetails[index].highestBid} Celo</p>
                      </div>
                    </div>
                  ) : null}
                </div>
              ))
            : null}
        </div>
      </div>
      {openBidForm ? (
        <PlaceBidModal onClose={onClose} index={auctionIndex} />
      ) : null}
    </div>
  );
}
