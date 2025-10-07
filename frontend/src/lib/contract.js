import { ethers } from 'ethers'
import artifact from '../../../artifacts/contracts/StudentTranscriptLedger.sol/StudentTranscriptLedger.json'
import deployment from '../../../deployments/localhost-deployment.json'

export function getProvider() {
  if (!window.ethereum) throw new Error('No injected provider')
  return new ethers.BrowserProvider(window.ethereum)
}

export async function getSigner() {
  const provider = getProvider()
  return await provider.getSigner()
}

export function getContractReadonly() {
  const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545')
  return new ethers.Contract(deployment.contractAddress, artifact.abi, provider)
}

export async function getContract() {
  const signer = await getSigner()
  return new ethers.Contract(deployment.contractAddress, artifact.abi, signer)
}



