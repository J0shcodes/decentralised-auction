import { useState } from "react";
import { useCelo } from "@celo/react-celo";
import { AbiItem } from "web3-utils";
require("dotenv").config({ path: ".env" });

import auctionAbi from "@/auction.abi";

type PlaceBidModalProps = {
    onClose: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    index: number | undefined
}

const auctionContractAddress = "0x0623F1eD47c5D4844EE887c58325F326f8A6a535";

const PlaceBidModal = ({onClose, index} : PlaceBidModalProps) => {
    const {kit, address} = useCelo();

    const [bidAmount, setBidAmount] = useState("")

    const placeBid = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        
        const auctionContract = new kit.connection.web3.eth.Contract(auctionAbi as AbiItem[], auctionContractAddress);
        const result = await auctionContract.methods.placeBid(index).send({from: address, value: bidAmount});

        console.log(result);
    }

  return (
    <div className="fixed flex justify-center items-center bg-[rgba(0,0,0,0.5)] z-50 top-0 left-0 bottom-0 right-0 w-full h-full">
      <div className="bg-white p-4 rounded">
        <div className="flex justify-between w-[400px]">
          <h2 className="text-2xl font-medium">Create Auction</h2>
          <div
            className="text-[28px] font-medium cursor-pointer"
            onClick={onClose}
          >
            &times;
          </div>
        </div>
        <form className="mt-4" onSubmit={placeBid}>
          <div>
            <div className="w-full mb-3">
              <input
                type="text"
                className="border border-solid border-black p-2 w-full rounded"
                placeholder="Enter Bid Amount"
                onChange={(e) => setBidAmount(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="text-center mt-4">
            <button
              type="submit"
              className="bg-green-500 text-white rounded-md p-2"
            >
              Place Bid
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlaceBidModal;
