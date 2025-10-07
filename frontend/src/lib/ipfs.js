// Multiple IPFS upload methods for better reliability
const IPFS_GATEWAYS = [
  'https://ipfs.io/api/v0',
  'https://gateway.pinata.cloud/api/v0',
  'https://cloudflare-ipfs.com/api/v0'
]

export async function uploadFile(file) {
  // Try multiple upload methods
  const methods = [
    () => uploadViaPinataAPI(file),
    () => uploadViaIPFSGateway(file),
    () => uploadViaWeb3Storage(file)
  ]
  
  for (const method of methods) {
    try {
      const hash = await method()
      if (hash) {
        console.log('Successfully uploaded to IPFS:', hash)
        return hash
      }
    } catch (error) {
      console.warn('Upload method failed:', error.message)
      continue
    }
  }
  
  throw new Error('All IPFS upload methods failed. Please try again or check your internet connection.')
}

// Method 1: Pinata API (most reliable)
async function uploadViaPinataAPI(file) {
  const pinataApiKey = import.meta.env.VITE_PINATA_API_KEY
  const pinataSecret = import.meta.env.VITE_PINATA_SECRET_KEY
  
  if (!pinataApiKey || !pinataSecret) {
    throw new Error('Pinata API keys not configured')
  }
  
  const formData = new FormData()
  formData.append('file', file)
  formData.append('pinataMetadata', JSON.stringify({
    name: `transcript-${Date.now()}`,
    keyvalues: {
      type: 'student-transcript'
    }
  }))
  formData.append('pinataOptions', JSON.stringify({
    cidVersion: 0
  }))
  
  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      'pinata_api_key': pinataApiKey,
      'pinata_secret_api_key': pinataSecret,
    },
    body: formData
  })
  
  if (!response.ok) {
    throw new Error(`Pinata API error: ${response.status}`)
  }
  
  const result = await response.json()
  return result.IpfsHash
}

// Method 2: Direct IPFS Gateway (fallback)
async function uploadViaIPFSGateway(file) {
  const formData = new FormData()
  formData.append('file', file)
  
  for (const gateway of IPFS_GATEWAYS) {
    try {
      const response = await fetch(`${gateway}/add`, {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const result = await response.json()
        return result.Hash
      }
    } catch (error) {
      console.warn(`Gateway ${gateway} failed:`, error.message)
      continue
    }
  }
  
  throw new Error('All IPFS gateways failed')
}

// Method 3: Web3.Storage (alternative)
async function uploadViaWeb3Storage(file) {
  const token = import.meta.env.VITE_WEB3_STORAGE_TOKEN
  if (!token) {
    throw new Error('Web3.Storage token not configured')
  }
  
  // Dynamic import to avoid build issues if not configured
  const { Web3Storage } = await import('web3.storage')
  const client = new Web3Storage({ token })
  const cid = await client.put([file], { wrapWithDirectory: false })
  return cid
}

// Simple fallback method for testing
async function uploadViaSimpleFallback(file) {
  // Create a mock hash for testing (in real app, this would be actual IPFS)
  const mockHash = `QmMock${Date.now()}${Math.random().toString(36).substr(2, 9)}`
  console.warn('Using mock IPFS hash for testing:', mockHash)
  return mockHash
}

export function getIpfsUrl(hash) {
  // Return the most reliable gateway URL
  return `https://ipfs.io/ipfs/${hash}`
}

// Add fallback to methods array if needed
export async function uploadFileWithFallback(file) {
  const methods = [
    () => uploadViaPinataAPI(file),
    () => uploadViaIPFSGateway(file),
    () => uploadViaWeb3Storage(file),
    () => uploadViaSimpleFallback(file) // Last resort for testing
  ]
  
  for (const method of methods) {
    try {
      const hash = await method()
      if (hash) {
        console.log('Successfully uploaded to IPFS:', hash)
        return hash
      }
    } catch (error) {
      console.warn('Upload method failed:', error.message)
      continue
    }
  }
  
  throw new Error('All IPFS upload methods failed. Please try again or check your internet connection.')
}