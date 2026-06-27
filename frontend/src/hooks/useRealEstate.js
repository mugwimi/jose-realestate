import { useState, useCallback, useEffect } from 'react'
import { ethers } from 'ethers'
import RealEstateABI from '../contracts/RealEstate.json'

const CONTRACT_ADDRESS = '0xa9c07A6eE103afD1C9DFBfC50DE4823e24f2074d'
const HISTORY_KEY = 'jose-realestate-history'

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    return []
  }
}

function saveHistory(list) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list))
  } catch (e) {
    console.error('Could not save history', e)
  }
}

export function useRealEstate() {
  const [contract, setContract] = useState(null)
  const [account, setAccount] = useState('')
  const [properties, setProperties] = useState([])
  const [myProperties, setMyProperties] = useState([])
  const [reviewsByProperty, setReviewsByProperty] = useState({})
  const [loading, setLoading] = useState(false)
  const [txHash, setTxHash] = useState('')
  const [error, setError] = useState('')
  const [connected, setConnected] = useState(false)
  const [history, setHistory] = useState(loadHistory)

  const addHistoryItem = useCallback(function (item) {
    setHistory(function (prev) {
      const next = [{ ...item, timestamp: Date.now() }, ...prev].slice(0, 50)
      saveHistory(next)
      return next
    })
  }, [])

  const loadProperties = useCallback(async function (_contract, _account) {
    try {
      const all = await _contract.getAllProperties()
      const formatted = all.map(function (p) {
        return {
          id: p.productID,
          owner: p.owner,
          price: p.price,
          title: p.propertyTitle,
          category: p.category,
          images: p.images,
          address: p.propertyAddress,
          description: p.description
        }
      }).filter(function (p) { return p.owner !== ethers.ZeroAddress })

      setProperties(formatted)
      setMyProperties(formatted.filter(function (p) {
        return p.owner.toLowerCase() === _account.toLowerCase()
      }))
    } catch (err) {
      console.error('loadProperties error:', err)
      setError('Failed to load properties: ' + (err.message || ''))
    }
  }, [])

  const loadReviews = useCallback(async function (_contract, propertyId) {
    try {
      const list = await _contract.getProductReviews(propertyId)
      setReviewsByProperty(function (prev) {
        return { ...prev, [propertyId]: list }
      })
    } catch (err) {
      console.error('loadReviews error:', err)
    }
  }, [])

  const connect = useCallback(async function () {
    try {
      setError('')

      if (!window.ethereum) {
        setError('MetaMask not detected. Please install MetaMask.')
        return
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' })

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const _account = await signer.getAddress()

      const network = await provider.getNetwork()
      const chainId = Number(network.chainId)

      if (chainId !== 11155111) {
        setError('Wrong network. Please switch MetaMask to Sepolia testnet.')
        return
      }

      const _contract = new ethers.Contract(CONTRACT_ADDRESS, RealEstateABI.abi, signer)

      setContract(_contract)
      setAccount(_account)
      setConnected(true)

      await loadProperties(_contract, _account)

    } catch (err) {
      console.error('connect error:', err)
      setError(err.message || 'Failed to connect wallet')
    }
  }, [loadProperties])

  useEffect(function () {
    if (!window.ethereum) return

    function handleChange() {
      connect()
    }

    window.ethereum.on('accountsChanged', handleChange)
    window.ethereum.on('chainChanged', handleChange)

    return function () {
      window.ethereum.removeListener('accountsChanged', handleChange)
      window.ethereum.removeListener('chainChanged', handleChange)
    }
  }, [connect])

  const refresh = useCallback(function () {
    if (contract && account) loadProperties(contract, account)
  }, [contract, account, loadProperties])

  const sendTx = async function (txPromise, historyMeta) {
    setLoading(true)
    setError('')
    setTxHash('')
    try {
      const tx = await txPromise
      setTxHash(tx.hash)
      await tx.wait()
      addHistoryItem({ ...historyMeta, txHash: tx.hash })
      await loadProperties(contract, account)
    } catch (err) {
      console.error('tx error:', err)
      setError(err.reason || err.shortMessage || err.message || 'Transaction failed')
    } finally {
      setLoading(false)
    }
  }

  const listProperty = function (data) {
    return sendTx(
      contract.listProperty(
        account,
        ethers.parseEther(data.price),
        data.title,
        data.category,
        data.images,
        data.address,
        data.description
      ),
      { type: 'list', amount: data.title }
    )
  }

  const buyProperty = function (id, priceWei) {
    return sendTx(
      contract.buyProperty(id, account, { value: priceWei }),
      { type: 'buy', amount: 'Property #' + id }
    )
  }

  const updatePrice = function (id, newPrice) {
    return sendTx(
      contract.updatePrice(account, id, ethers.parseEther(newPrice)),
      { type: 'updatePrice', amount: 'Property #' + id }
    )
  }

  const addReview = async function (propertyId, rating, comment) {
    setLoading(true)
    setError('')
    setTxHash('')
    try {
      const tx = await contract.addReview(propertyId, rating, comment, account)
      setTxHash(tx.hash)
      await tx.wait()
      addHistoryItem({ type: 'review', amount: 'Property #' + propertyId, txHash: tx.hash })
      await loadReviews(contract, propertyId)
    } catch (err) {
      console.error(err)
      setError(err.reason || err.message || 'Review failed')
    } finally {
      setLoading(false)
    }
  }

  const likeReview = async function (propertyId, reviewIndex) {
    setLoading(true)
    setError('')
    try {
      const tx = await contract.likeReview(propertyId, reviewIndex, account)
      setTxHash(tx.hash)
      await tx.wait()
      await loadReviews(contract, propertyId)
    } catch (err) {
      console.error(err)
      setError(err.reason || err.message || 'Like failed')
    } finally {
      setLoading(false)
    }
  }

  return {
    account, properties, myProperties, reviewsByProperty,
    loading, txHash, error, connected, history,
    connect, refresh, listProperty, buyProperty, updatePrice,
      addReview, likeReview, loadReviews,
    contract 
  }
}