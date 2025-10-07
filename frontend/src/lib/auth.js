import { ethers } from 'ethers'
import { getContractReadonly } from './contract'

// Authentication roles
export const ROLES = {
  STUDENT: 'student',
  INSTITUTION: 'institution', 
  VERIFIER: 'verifier',
  ADMIN: 'admin'
}

// User context
let userContext = {
  account: null,
  role: null,
  institutionId: null,
  isConnected: false
}

// Event listeners
const listeners = new Set()

export function addAuthListener(callback) {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

function notifyListeners() {
  listeners.forEach(callback => callback(userContext))
}

// Check user role from blockchain
export async function checkUserRole(account) {
  if (!account) return null
  
  try {
    const contract = getContractReadonly()
    
    // Check if user is a registered student
    const isStudent = await contract.isRegisteredStudent(account)
    if (isStudent) {
      return { role: ROLES.STUDENT, account }
    }
    
    // Check if user has institution role
    const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE()
    const INSTITUTION_ROLE = await contract.INSTITUTION_ROLE()
    const VERIFIER_ROLE = await contract.VERIFIER_ROLE()
    
    const hasAdminRole = await contract.hasRole(DEFAULT_ADMIN_ROLE, account)
    const hasInstitutionRole = await contract.hasRole(INSTITUTION_ROLE, account)
    const hasVerifierRole = await contract.hasRole(VERIFIER_ROLE, account)
    
    if (hasAdminRole) {
      return { role: ROLES.ADMIN, account }
    }
    
    if (hasInstitutionRole) {
      // Get institution ID for this account
      let institutionId = null
      try {
        const totalInstitutions = await contract.getTotalInstitutions()
        for (let i = 0; i < Number(totalInstitutions); i++) {
          const institution = await contract.getInstitution(BigInt(i))
          if (institution.admin.toLowerCase() === account.toLowerCase()) {
            institutionId = i
            break
          }
        }
      } catch (e) {
        console.warn('Could not find institution ID:', e)
      }
      
      return { role: ROLES.INSTITUTION, account, institutionId }
    }
    
    if (hasVerifierRole) {
      return { role: ROLES.VERIFIER, account }
    }
    
    return { role: null, account }
    
  } catch (error) {
    console.error('Error checking user role:', error)
    return { role: null, account }
  }
}

// Connect wallet and check role
export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error('MetaMask not detected. Please install MetaMask to continue.')
  }
  
  try {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const accounts = await provider.send('eth_requestAccounts', [])
    const account = accounts[0]
    
    if (!account) {
      throw new Error('No account connected')
    }
    
    // Check user role
    const roleInfo = await checkUserRole(account)
    
    userContext = {
      account,
      role: roleInfo.role,
      institutionId: roleInfo.institutionId,
      isConnected: true
    }
    
    notifyListeners()
    return userContext
    
  } catch (error) {
    console.error('Wallet connection failed:', error)
    throw error
  }
}

// Disconnect wallet
export function disconnectWallet() {
  userContext = {
    account: null,
    role: null,
    institutionId: null,
    isConnected: false
  }
  
  notifyListeners()
}

// Get current user context
export function getCurrentUser() {
  return { ...userContext }
}

// Check if user has specific role
export function hasRole(role) {
  return userContext.role === role
}

// Check if user can perform action
export function canPerform(action) {
  const { role } = userContext
  
  switch (action) {
    case 'createTranscript':
    case 'addCourse':
    case 'setGraduation':
      return role === ROLES.INSTITUTION
      
    case 'verifyTranscript':
      return role === ROLES.VERIFIER || role === ROLES.ADMIN
      
    case 'registerInstitution':
      return role === ROLES.ADMIN
      
    case 'registerStudent':
      return true // Anyone can register as student
      
    case 'viewTranscript':
      return true // Anyone can view transcripts
      
    default:
      return false
  }
}

// Get role display info
export function getRoleInfo(role) {
  switch (role) {
    case ROLES.STUDENT:
      return {
        name: 'Student',
        description: 'View transcripts and academic records',
        icon: '🎓',
        color: 'student'
      }
    case ROLES.INSTITUTION:
      return {
        name: 'Institution',
        description: 'Create and manage transcripts',
        icon: '🏛️',
        color: 'institution'
      }
    case ROLES.VERIFIER:
      return {
        name: 'Verifier',
        description: 'Verify transcript authenticity',
        icon: '✅',
        color: 'verifier'
      }
    case ROLES.ADMIN:
      return {
        name: 'Admin',
        description: 'Manage institutions and system',
        icon: '⚙️',
        color: 'institution'
      }
    default:
      return {
        name: 'Guest',
        description: 'Connect wallet to access features',
        icon: '🔗',
        color: 'muted'
      }
  }
}
