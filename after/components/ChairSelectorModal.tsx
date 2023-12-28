import React from 'react'

const ChairSelectorModal = () => {
  return (
    <>
      <ChainSelector
        title={"Switch Token Chain"}
        openChainSelector={openChainSelector}
        setOpenChainSelector={setOpenChainSelector}
        chains={receiveChains}
        selectedChain={suppliesChain}
        setSelectedChain={setSuppliesChain}
      />
    </>
  );
}
export default ChairSelectorModal