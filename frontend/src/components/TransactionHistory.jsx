export default function TransactionHistory({ history, theme }) {
  const typeConfig = {
    list: { icon: '🏠', label: 'Listed property', color: theme.purple },
    buy: { icon: '🔑', label: 'Purchased property', color: theme.teal },
    updatePrice: { icon: '💰', label: 'Updated price', color: theme.blue },
    review: { icon: '⭐', label: 'Added review', color: theme.amber }
  }

  function formatTime(timestamp) {
    const date = new Date(timestamp)
    return date.toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  function truncate(hash) {
    if (!hash) return ''
    return hash.slice(0, 10) + '...' + hash.slice(-6)
  }

  return (
    <div style={{
      background: theme.surface,
      border: '1px solid ' + theme.border,
      borderRadius: '12px',
      padding: '1.25rem',
      marginTop: '2rem'
    }}>
      <h3 style={{ fontSize: '16px', fontWeight: '500', color: theme.text, marginBottom: '14px' }}>
        Activity history
      </h3>

      {history.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: theme.textMuted, fontSize: '13px' }}>
          No activity yet. List or buy a property to see it here.
        </div>
      ) : (
        history.map(function (item, i) {
          const config = typeConfig[item.type] || typeConfig.list
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0',
              borderBottom: i < history.length - 1 ? '1px solid ' + theme.border : 'none'
            }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: config.color + '22', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0
              }}>
                {config.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', color: theme.text }}>
                  {config.label}{item.amount ? (' — ' + item.amount) : ''}
                </div>
                <div style={{ fontSize: '11px', color: theme.textFaint, marginTop: '2px' }}>
                  {formatTime(item.timestamp)}
                </div>
              </div>
              
                <a href={'https://sepolia.etherscan.io/tx/' + item.txHash}
                target="_blank" rel="noopener noreferrer"
                style={{ fontSize: '11px', fontFamily: 'monospace', color: theme.purpleLight, textDecoration: 'none', flexShrink: 0 }}
              >
                {truncate(item.txHash)}
              </a>
            </div>
          )
        })
      )}
    </div>
  )
}