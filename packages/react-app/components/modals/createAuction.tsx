import React, { ChangeEvent, FormEventHandler, useState } from "react";
// import TimeInput from "react-time-input";
import { useEffect } from "react";
import { useCelo } from "@celo/react-celo";
import { AbiItem } from "web3-utils";
require("dotenv").config({ path: ".env" });

import auctionAbi from "../../auction.abi";

type ModalProps = {
  onClose: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
};

const CreateAuctionModal = ({ onClose }: ModalProps) => {
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [startPrice, setStartPrice] = useState("");
  const [reservePrice, setReservePrice] = useState("");

  const { kit, address } = useCelo();

  const auctionContractAddress = "0x0623F1eD47c5D4844EE887c58325F326f8A6a535";

  const createAuction = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    console.log(
      name,
      imageUrl,
      description,
      startTime,
      endTime,
      startPrice,
      reservePrice
    );

    const startTimeArray = startTime.split(":");
    const endTimeArray = endTime.split(":");

    const startTimeInSeconds =
      parseInt(startTimeArray[0], 10) * 60 * 60 +
      parseInt(startTimeArray[1], 10) * 60;
    const endTimeInSeconds =
      parseInt(endTimeArray[0], 10) * 60 * 60 +
      parseInt(endTimeArray[1], 10) * 60;

    const timeInSeconds = endTimeInSeconds - startTimeInSeconds;

    console.log(startTimeInSeconds, endTimeInSeconds, timeInSeconds);

    const blockNumber = await kit.connection.web3.eth.getBlockNumber();

    const startBlock = blockNumber + 3;
    const endBlock = startBlock + (timeInSeconds / 5);

    console.log(blockNumber, startBlock, endBlock);

    const auctionContract = new kit.connection.web3.eth.Contract(
      auctionAbi as AbiItem[],
      auctionContractAddress
    );

    const result = await auctionContract.methods
      .createAuction(
        name,
        imageUrl,
        description,
        startPrice,
        startBlock,
        endBlock,
        reservePrice,
        timeInSeconds
      )
      .send({ from: address });

    console.log(result);
  };

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
        <form className="mt-4" onSubmit={createAuction}>
          <div>
            <div className="w-full mb-3">
              <input
                type="text"
                className="border border-solid border-black p-2 w-full rounded"
                placeholder="Enter name of car"
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="w-full mb-3">
              <input
                type="text"
                className="border border-solid border-black p-2 w-full rounded"
                placeholder="Enter name image url"
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
            <div className="w-full mb-3">
              <input
                type="text"
                className="border border-solid border-black p-2 w-full rounded"
                placeholder="Enter description"
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="w-full mb-3">
              <label>Enter auction start time</label>
              <input
                type="time"
                className="border border-solid border-black p-2 w-full rounded"
                placeholder="Enter auction end time"
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="w-full mb-3">
              <label>Enter auction end time</label>
              <input
                type="time"
                className="border border-solid border-black p-2 w-full rounded"
                placeholder="Enter auction end time"
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
            <div className="w-full mb-3">
              <input
                type="text"
                className="border border-solid border-black p-2 w-full rounded"
                placeholder="Enter auction starting price"
                onChange={(e) => setStartPrice(e.target.value)}
              />
            </div>
            <div className="w-full">
              <input
                type="text"
                className="border border-solid border-black p-2 w-full rounded"
                placeholder="Enter auction reserve price"
                onChange={(e) => setReservePrice(e.target.value)}
              />
            </div>
          </div>
          <div className="text-center mt-4">
            <button
              type="submit"
              className="bg-green-500 text-white rounded-md p-2"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAuctionModal;

// https://www.pexels.com/photo/low-angle-photo-of-volkswagen-kombi-2533092/
