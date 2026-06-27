function truncateAddress(a) {
  if (!a) return ''
  return a.slice(0, 6) + '...' + a.slice(-4)
}

export default function PropertyCard({ property, account, theme, onSelect }) {
  const isOwner = property.owner.toLowerCase() === account.toLowerCase()
  const priceEth = parseFloat(
    (Number(property.price) / 1e18).toFixed(4)
  )

  return (
    <div
      onClick={function () { onSelect(property) }}
      style={{
        background: theme.surface,
        border: '1px solid ' + theme.border,
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.15s, box-shadow 0.15s'
      }}
      onMouseEnter={function (e) {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'
      }}
      onMouseLeave={function (e) {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div style={{
        height: '150px',
        background: 'linear-gradient(135deg,' + theme.purple + '22,' + theme.blue + '33)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '40px',
        position: 'relative'
      }}>
        🏠
        {isOwner && (
  <div style={{
    position: 'absolute', top: '10px', left: '10px',
    background: theme.teal, color: '#fff',
    fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '500'
  }}>
    ✅ You own this
  </div>
)}
        <div style={{
          position: 'absolute', top: '10px', right: '10px',
          background: theme.surface, color: theme.text,
          fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '500'
        }}>
          {property.category}
        </div>
      </div>

      <div style={{ padding: '1rem' }}>
        <h4 style={{ fontSize: '15px', fontWeight: '500', color: theme.text, marginBottom: '4px' }}>
          {property.title}
        </h4>
        <div style={{ fontSize: '12px', color: theme.textMuted, marginBottom: '10px' }}>
          📍 {property.address}
        </div>
        <p style={{ fontSize: '13px', color: theme.textFaint, marginBottom: '12px', lineHeight: '1.4' }}>
          {property.description.length > 80
            ? property.description.slice(0, 80) + '...'
            : property.description}
        </p>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span style={{ fontSize: '17px', fontWeight: '500', color: theme.purple }}>
            {priceEth} ETH
          </span>
          <span style={{ fontSize: '11px', color: theme.textMuted, fontFamily: 'monospace' }}>
            {truncateAddress(property.owner)}
          </span>
        </div>
      </div>
    </div>
  )
}