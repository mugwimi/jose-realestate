import { useState } from 'react'
import { useRealEstate } from './hooks/useRealEstate'
import { useTheme } from './hooks/useTheme'
import ThemeToggle from './components/ThemeToggle'
import PropertyCard from './components/PropertyCard'
import ListPropertyForm from './components/ListPropertyForm'
import PropertyModal from './components/PropertyModal'
import TransactionHistory from './components/TransactionHistory'

const CONTRACT_ETHERSCAN = 'https://sepolia.etherscan.io/address/0xa9c07A6eE103afD1C9DFBfC50DE4823e24f2074d'

function truncateAddress(a) {
  if (!a) return ''
  return a.slice(0, 6) + '...' + a.slice(-4)
}

export default function App() {
  const hook = useRealEstate()
  const account = hook.account
  const properties = hook.properties
  const myProperties = hook.myProperties
  const reviewsByProperty = hook.reviewsByProperty
  const loading = hook.loading
  const txHash = hook.txHash
  const error = hook.error
  const connected = hook.connected
  const history = hook.history
  const connect = hook.connect
  const listProperty = hook.listProperty
  const buyProperty = hook.buyProperty
  const updatePrice = hook.updatePrice
  const addReview = hook.addReview
  const likeReview = hook.likeReview
  const loadReviews = hook.loadReviews

  const themeHook = useTheme()
  const mode = themeHook.mode
  const theme = themeHook.theme
  const toggleTheme = themeHook.toggleTheme

  const [tab, setTab] = useState('all')
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [justBoughtId, setJustBoughtId] = useState(null)

  const txEtherscanUrl = txHash ? ('https://sepolia.etherscan.io/tx/' + txHash) : ''
  const txShort = txHash ? (txHash.slice(0, 10) + '...' + txHash.slice(-6)) : ''

  const linkStyle = {
    fontSize: '12px', color: theme.purpleLight, textDecoration: 'none',
    padding: '4px 12px', border: '1px solid ' + theme.purpleBorder,
    borderRadius: '20px', background: theme.purpleBg
  }

  const navbar = (
    <nav style={{
      background: theme.surface, borderBottom: '1px solid ' + theme.border,
      padding: '0 2rem', height: '56px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100,
      flexWrap: 'wrap', gap: '8px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%', background: theme.purple,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '14px', fontWeight: '500', color: '#fff'
        }}>R</div>
        <div>
          <div style={{ fontSize: '14px', fontWeight: '500', color: theme.text }}>JoseRealEstate</div>
          <div style={{ fontSize: '11px', color: theme.textMuted }}>Property marketplace — Sepolia</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ThemeToggle mode={mode} onToggle={toggleTheme} theme={theme} />
        <a href={CONTRACT_ETHERSCAN} target="_blank" rel="noopener noreferrer" style={linkStyle}>
          Contract on Etherscan
        </a>
        {connected ? (
          <div style={{
            fontSize: '12px', fontFamily: 'monospace', color: theme.purpleLight,
            padding: '4px 12px', border: '1px solid ' + theme.purpleBorder,
            borderRadius: '20px', background: theme.purpleBg
          }}>
            {truncateAddress(account)}
          </div>
        ) : (
          <button onClick={connect} style={{
            height: '34px', padding: '0 16px', background: theme.purple, color: '#fff',
            border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer'
          }}>
            Connect MetaMask
          </button>
        )}
      </div>
    </nav>
  )

  const connectScreen = (
    <div style={{
      textAlign: 'center', padding: '4rem 2rem', background: theme.surface,
      borderRadius: '16px', border: '1px solid ' + theme.border
    }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏘️</div>
      <h2 style={{ fontSize: '20px', fontWeight: '500', color: theme.text, marginBottom: '8px' }}>
        Connect your wallet
      </h2>
      <p style={{ fontSize: '14px', color: theme.textMuted, marginBottom: '24px' }}>
        Connect MetaMask on Sepolia testnet to browse and list properties
      </p>
      <button onClick={connect} style={{
        height: '44px', padding: '0 32px', background: theme.purple, color: '#fff',
        border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '500', cursor: 'pointer'
      }}>
        Connect MetaMask
      </button>
    </div>
  )

  const errorBanner = error ? (
    <div style={{
      padding: '12px 16px', background: theme.coralBg, border: '1px solid ' + theme.coral,
      borderRadius: '8px', color: theme.coralLight, fontSize: '13px', marginBottom: '1rem'
    }}>
      {error}
    </div>
  ) : null

  const txBanner = txHash ? (
    <div style={{
      padding: '12px 16px', background: theme.tealBg, border: '1px solid ' + theme.teal,
      borderRadius: '8px', fontSize: '13px', marginBottom: '1rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
    }}>
      <span style={{ color: theme.tealLight }}>Transaction confirmed</span>
      <a href={txEtherscanUrl} target="_blank" rel="noopener noreferrer"
        style={{ color: theme.tealLight, fontSize: '12px', fontFamily: 'monospace', textDecoration: 'none' }}>
        {txShort}
      </a>
    </div>
  ) : null

  const displayedProperties = tab === 'mine' ? myProperties : properties

  const tabs = (
    <div style={{ display: 'flex', gap: '6px', marginBottom: '1.5rem' }}>
      {[
        { key: 'all', label: 'All properties (' + properties.length + ')' },
        { key: 'mine', label: 'My properties (' + myProperties.length + ')' }
      ].map(function (t) {
        return (
          <span
            key={t.key}
            onClick={function () { setTab(t.key) }}
            style={{
              fontSize: '13px', padding: '6px 16px', borderRadius: '20px', cursor: 'pointer',
              border: tab === t.key ? '1px solid ' + theme.purpleBorder : '1px solid ' + theme.border,
              background: tab === t.key ? theme.purpleBg : 'transparent',
              color: tab === t.key ? theme.purpleLight : theme.textMuted
            }}
          >
            {t.label}
          </span>
        )
      })}
    </div>
  )

  const dashboard = (
    <div>
      {errorBanner}
      {txBanner}

      <ListPropertyForm onList={listProperty} loading={loading} theme={theme} />

      {tabs}

      {displayedProperties.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '3rem', background: theme.surface,
          borderRadius: '12px', border: '1px solid ' + theme.border, color: theme.textMuted, fontSize: '13px'
        }}>
          {tab === 'mine' ? 'You have no listings yet.' : 'No properties listed yet. Be the first!'}
        </div>
      ) : (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px'
        }}>
          {displayedProperties.map(function (p, i) {
            return (
              <PropertyCard
                key={i}
                property={p}
                account={account}
                theme={theme}
                onSelect={setSelectedProperty}
              />
            )
          })}
        </div>
      )}

      <TransactionHistory history={history} theme={theme} />
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: theme.bg }}>
      {navbar}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '500', color: theme.text, marginBottom: '8px' }}>
          JoseRealEstate <span style={{ color: theme.purple }}>Marketplace</span>
        </h1>
        <p style={{ fontSize: '14px', color: theme.textMuted, marginBottom: '2rem', maxWidth: '600px' }}>
          List, buy, and review tokenized real estate listings, all settled
          on-chain with ETH payments and on-chain ownership transfer.
        </p>

        {connected === false && connectScreen}
        {connected === true && dashboard}
      </div>

      <PropertyModal
        property={selectedProperty}
        account={account}
        theme={theme}
        reviews={selectedProperty ? reviewsByProperty[selectedProperty.id] : []}
        onClose={function () { setSelectedProperty(null) }}
        onBuy={async function (id, price) {
  try {
    await buyProperty(id, price)
    setJustBoughtId(id)
    setTimeout(function () { setJustBoughtId(null) }, 6000)
  } catch (err) {
    console.error('Buy failed:', err)
  }
}}
onClose={function () {
  setSelectedProperty(null)
  setJustBoughtId(null)
}}
justBoughtId={justBoughtId}
        onUpdatePrice={updatePrice}
        onAddReview={addReview}
        onLikeReview={likeReview}
        onLoadReviews={function (id) { loadReviews(hook.contract, id) }}
        loading={loading}
      />
    </div>
  )
}