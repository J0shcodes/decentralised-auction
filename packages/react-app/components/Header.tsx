import { Disclosure } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useCelo } from "@celo/react-celo";
import { useEffect, useState, useCallback } from "react";
import {BigNumber} from "bignumber.js";

import CreateAuctionModal from "./modals/createAuction";

export default function Header() {
  const { connect, address, kit, getConnectedKit } = useCelo();

  const [openCreateAuctionModal, setOpenCreateAuctionModal] = useState(false);
  const [userBalance, setUserBalance] = useState("");

  const onClose = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setOpenCreateAuctionModal(false)
  }

  let useraddress = ""

  const getUserBalance = useCallback(async () => {
    const celoToken = await kit.contracts.getGoldToken();
    const userBalance = await celoToken.balanceOf(address!);
    const celoTokenBalance = new BigNumber(userBalance).shiftedBy(-18).toFixed(2);
    setUserBalance(celoTokenBalance);
  }, [address, kit.contracts])

  useEffect(() => {
    if(address) {
      getUserBalance()
    }
  }, [getUserBalance, address])

  return (
    <div className="flex justify-between p-4">
      <h2 className="font-bold text-xl">Cel-Auction</h2>
      {address ? (
        <div className="flex justify-between w-[220px]">
          <div className="flex flex-col justify-center items-center">{userBalance ? `${userBalance}celo` : "0celo"}</div>
          <button
            className="bg-purple-500 text-white p-2 rounded-md"
            onClick={() => setOpenCreateAuctionModal(true)}
          >
            Create Auction
          </button>
        </div>
      ) : (
        <button
          className="bg-blue-500 text-white rounded-md p-3.5"
          onClick={connect}
        >
          Connect Wallet
        </button>
      )}
      {openCreateAuctionModal ? (
        <CreateAuctionModal onClose={onClose}/>
      ) : null}
    </div>
  );
}
