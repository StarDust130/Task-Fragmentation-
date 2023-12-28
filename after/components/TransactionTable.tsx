import React from 'react'

const TransactionTable = () => {
  return (
    <>
      <TransactionTableStyled>
        <div className="header">
          <p className="header_label">Burn Transactions</p>
        </div>
        <BurnTxTable
          data={burnTransactions}
          priceUSD={coinData?.current_price?.usd}
        />
      </TransactionTableStyled>
    </>
  );
}
export default TransactionTable