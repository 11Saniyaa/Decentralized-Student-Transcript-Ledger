import React from 'react'
import { ethers } from 'ethers'

export default function Wallet() {
  const [account, setAccount] = React.useState('')

  const connect = async () => {
    if (!window.ethereum) {
      alert('MetaMask not detected')
      return
    }
    const provider = new ethers.BrowserProvider(window.ethereum)
    const accounts = await provider.send('eth_requestAccounts', [])
    setAccount(accounts[0])
  }

  return (
    <button onClick={connect} className="btn">
      {account ? `${account.slice(0,6)}...${account.slice(-4)}` : 'Connect Wallet'}
    </button>
  )
}


