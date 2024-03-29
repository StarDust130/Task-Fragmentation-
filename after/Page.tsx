import React, { useState, useEffect, ChangeEvent } from "react";
import styled from "styled-components";
import TransactionTable from "./components/TransactionTable";
import AppToast from "./components/AppToast";
import ChairSelectorModal from "./components/ChairSelectorModal";
import Button from "./components/Button";
import BurnStatsContainer from "./components/BurnStatsContainer";

// Styled component for BurnPage
const BurnPageStyled = styled.div``;

// Enumeration for burn transaction progress states
enum BurnTxProgress {
  default = "Burn App Tokens",
  burning = "Burning...",
}


// BurnPage component
export const BurnPage = () => {
  // State declarations 🚀
  const [burnTransactions, setBurnTransactions] = useState<any[]>([]);
  const [isOldToken, setIsOldToken] = useState(false);
  const [burnAmount, setBurnAmount] = useState("");
  const [txButton, setTxButton] = useState<BurnTxProgress>(
    BurnTxProgress.default
  );
  const [txProgress, setTxProgress] = useState<boolean>(false);
  const [approveTxHash, setApproveTxHash] = useState<string | null>(null);
  const [burnTxHash, setBurnTxHash] = useState<string | null>(null);

  // Fetch supplies and token address 🌐
  const statsSupplies = supplies;
  const tokenAddress = fetchAddressForChain(
    suppliesChain?.id,
    isOldToken ? "oldToken" : "newToken"
  );

  // Effect for fetching coin data from CoinGecko 📈
  useEffect(() => {
    CoinGeckoApi.fetchCoinData()
      .then((data: any) => {
        // Set coin data state 🪙
        setCoinData(data?.market_data);
      })
      .catch((err) => {
        // Log error if fetch fails ❌
        console.log(err);
      });
  }, []);

  // Handler for input change 🔄
  const onChangeBurnAmount = (e: ChangeEvent<HTMLInputElement>) => {
    // Handle input change and update burn amount state 🔢
    if (e.target.value === "") setBurnAmount("");
    if (isNaN(parseFloat(e.target.value))) return;
    setBurnAmount(e.target.value);
  };

  // Function to refetch burn transactions 🔁
  const refetchTransactions = () => {
    Promise.all(
      ChainScanner.fetchAllTxPromises(isChainTestnet(walletChain?.id))
    )
      .then((results: any) => {
        // Flatten and sort burn transactions, then update state 🔥
        let transactions = results.flat();
        transactions = ChainScanner.sortOnlyBurnTransactions(transactions);
        transactions = transactions.sort(
          (a: any, b: any) => b.timeStamp - a.timeStamp
        );
        setBurnTransactions(transactions);
      })
      .catch((err) => {
        // Log error if fetch fails ❌
        console.log(err);
      });
  };

  // Function to execute burn 🔥
  const executeBurn = async () => {
    // Check wallet connection 🔒
    if (!isWalletConnected) {
      openConnectModal();
    }
    // Check for valid burn amount ⚠️
    if (burnAmount === "") {
      console.log("Enter amount to migrate");
      showToast("Enter amount to migrate", ToastSeverity.warning);
      return;
    }

    // Initialize contract and amount for burn 💼
    const newTokenAddress = fetchAddressForChain(walletChain?.id, "newToken");
    const oftTokenContract = new Contract(
      newTokenAddress,
      oftAbi,
      ethersSigner
    );
    const amount = parseEther(burnAmount);

    // Set burn progress states 🔥🔄
    setTxButton(BurnTxProgress.burning);
    setTxProgress(true);

    try {
      // Execute burn transaction and wait for completion ✅
      const burnTx = await oftTokenContract.burn(amount);
      setBurnTxHash(burnTx.hash);
      console.log(burnTx, burnTx.hash);
      await burnTx.wait();
      // Reset burn progress states and trigger data updates 🔁
      setTxButton(BurnTxProgress.default);
      setTxProgress(false);
      refetchTransactions();
      fetchSupplies();
    } catch (err) {
      // Log error and display toast for burn failure ❌
      console.log(err);
      setTxButton(BurnTxProgress.default);
      setTxProgress(false);
      showToast("Burn Failed!", ToastSeverity.error);
    }
  };

  // Effect to fetch transactions based on wallet chain 🔗
  useEffect(() => {
    if (!walletChain) return;

    let isSubscribed = true;
    if (isSubscribed) setBurnTransactions([]);

    const isTestnet = isChainTestnet(walletChain?.id);
    let _chainObjects: any[] = [mainnet, avalanche, fantom];
    if (isTestnet) _chainObjects = [sepolia, avalancheFuji, fantomTestnet];

    Promise.all(ChainScanner.fetchAllTxPromises(isTestnet))
      .then((results: any) => {
        if (isSubscribed) {
          let new_chain_results: any[] = [];
          results.forEach((results_a: any[], index: number) => {
            new_chain_results.push(
              results_a.map((tx: any) => ({
                ...tx,
                chain: _chainObjects[index],
              }))
            );
          });
          // Flatten, sort, and update burn transactions state 🔥🔄
          let transactions = new_chain_results.flat();
          transactions = ChainScanner.sortOnlyBurnTransactions(transactions);
          transactions = transactions.sort(
            (a: any, b: any) => b.timeStamp - a.timeStamp
          );
          setBurnTransactions(transactions);
        }
      })
      .catch((err) => {
        // Log error if fetch fails ❌
        console.log(err);
      });

    return () => {
      isSubscribed = false;
    };
  }, [walletChain, isOldToken]);

  // JSX code for the BurnPage component 🚀
  return (
    <>
      <DashboardLayoutStyled className="burnpage">
        <div
          className="top_container burnpage"
          style={{ alignItems: "flex-start" }}
        >
          <div className="info_box filled">
            {/* BurnPage Header 🔥*/}
            <h1 className="title">App TOKEN BURN</h1>
            <p className="description medium"></p>

            {/* Burn Button Bar 🔥 */}
            <Button />

            {/* Transaction Links 🔗 */}
            {burnTxHash && (
              <div className="tx_links">
                <AppTooltip
                  title={`Check burn Transaction on chain ${walletChain?.blockExplorers?.default?.name}`}
                >
                  <AppExtLink
                    url={`${walletChain?.blockExplorers?.default?.url}/tx/${burnTxHash}`}
                    className="header_link"
                  >
                    Burn Tx: {prettyEthAddress(burnTxHash ?? zeroAddress)}
                  </AppExtLink>
                </AppTooltip>
              </div>
            )}
          </div>

          {/* BurnStats Container 📊 */}
          <BurnStatsContainer />
        </div>
      </DashboardLayoutStyled>

      {/* Transaction Table 📜 */}
      <TransactionTable />

      {/* Chain Selector Modal 🌐 */}
      <ChairSelectorModal />

      {/* App Toast Component 🍞 */}
      <AppToast />
    </>
  );
};
