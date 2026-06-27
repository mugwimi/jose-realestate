import { useState, useEffect } from 'react'

function truncateAddress(a) {
  if (!a) return ''
  return a.slice(0, 6) + '...' + a.slice(-4)
}

export default function PropertyModal({
  property, account, theme, reviews, onClose,
  onBuy, onUpdatePrice, onAddReview, onLikeReview, onLoadReviews, loading, justBoughtId
}) {
  const [newPrice, setNewPrice] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  useEffect(function () {
    if (property) onLoadReviews(property.id)
  }, [property])

  if (!property) return null

  const isOwner = property.owner.toLowerCase() === account.toLowerCase()
  const priceEth = (Number(property.price) / 1e18).toFixed(4)
  const propertyReviews = reviews || []
  const justBought = justBoughtId === property.id

  const avgRating = propertyReviews.length > 0
    ? (propertyReviews.reduce(function (sum, r) { return sum + Number(r.rating) }, 0) / propertyReviews.length).toFixed(1)
    : null

  function renderStars(n) {
    return [1, 2, 3, 4, 5].map(function (s) {
      return (
        <span key={s} style={{ color: s <= n ? theme.amber : theme.border, fontSize: '14px' }}>★</span>
      )
    })
  }

  function handleClose() {
    onClose()
  }

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: theme.overlay, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem'
      }}
    >
      <div
        onClick={function (e) { e.stopPropagation() }}
        style={{
          background: theme.surface,
          border: '1px solid ' + theme.border,
          borderRadius: '16px',
          maxWidth: '560px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '1.5rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '11px', padding: '2px 10px', borderRadius: '20px',
                background: theme.purpleBg, color: theme.purpleLight
              }}>
                {property.category}
              </span>
              {isOwner && (
                <span style={{
                  fontSize: '11px', padding: '2px 10px', borderRadius: '20px',
                  background: theme.tealBg, color: theme.tealLight, fontWeight: '500'
                }}>
                  ✅ You own this
                </span>
              )}
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '500', color: theme.text }}>
              {property.title}
            </h2>
            <div style={{ fontSize: '13px', color: theme.textMuted, marginTop: '4px' }}>
              📍 {property.address}
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            style={{
              background: 'none', border: 'none', color: theme.textMuted,
              fontSize: '24px', cursor: 'pointer', lineHeight: 1, padding: '0 4px'
            }}
          >
            ×
          </button>
        </div>

        {justBought && (
          <div style={{
            padding: '12px 16px',
            background: theme.tealBg,
            border: '1px solid ' + theme.teal,
            borderRadius: '10px',
            color: theme.tealLight,
            fontSize: '13px',
            fontWeight: '500',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            🎉 Purchase confirmed — this property is now SOLD to you
          </div>
        )}

        {avgRating && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
            {renderStars(Math.round(avgRating))}
            <span style={{ fontSize: '12px', color: theme.textMuted }}>
              {avgRating} ({propertyReviews.length} review{propertyReviews.length !== 1 ? 's' : ''})
            </span>
          </div>
        )}

        <p style={{ fontSize: '14px', color: theme.textFaint, lineHeight: '1.6', marginBottom: '16px' }}>
          {property.description}
        </p>

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 16px', background: theme.purpleBg, borderRadius: '10px', marginBottom: '16px'
        }}>
          <div>
            <div style={{ fontSize: '11px', color: theme.textMuted }}>Price</div>
            <div style={{ fontSize: '20px', fontWeight: '500', color: theme.purple }}>{priceEth} ETH</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: theme.textMuted }}>Current owner</div>
            <div style={{ fontSize: '12px', fontFamily: 'monospace', color: theme.text }}>
              {truncateAddress(property.owner)}
            </div>
          </div>
        </div>

        {!isOwner ? (
          <button
            type="button"
            onClick={function () { onBuy(property.id, property.price) }}
            disabled={loading}
            style={{
              width: '100%', height: '42px', background: theme.teal, color: '#fff',
              border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '20px'
            }}
          >
            {loading ? 'Waiting for confirmation...' : 'Buy this property for ' + priceEth + ' ETH'}
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="New price in ETH"
              value={newPrice}
              onChange={function (e) { setNewPrice(e.target.value) }}
              style={{
                flex: 1, height: '38px', padding: '0 12px', background: theme.inputBg,
                border: '1px solid ' + theme.border, borderRadius: '8px', color: theme.text, fontSize: '13px', outline: 'none'
              }}
            />
            <button
              type="button"
              onClick={function () { onUpdatePrice(property.id, newPrice); setNewPrice('') }}
              disabled={loading || !newPrice}
              style={{
                height: '38px', padding: '0 16px', background: theme.blue, color: '#fff',
                border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              Update price
            </button>
          </div>
        )}

        <h4 style={{ fontSize: '14px', fontWeight: '500', color: theme.text, marginBottom: '10px' }}>
          Reviews
        </h4>

        <div style={{ marginBottom: '16px' }}>
          {propertyReviews.length === 0 ? (
            <p style={{ fontSize: '13px', color: theme.textFaint }}>No reviews yet.</p>
          ) : (
            propertyReviews.map(function (r, i) {
              return (
                <div key={i} style={{
                  padding: '10px 0',
                  borderBottom: i < propertyReviews.length - 1 ? '1px solid ' + theme.border : 'none'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {renderStars(Number(r.rating))}
                      <span style={{ fontSize: '11px', color: theme.textFaint, fontFamily: 'monospace' }}>
                        {truncateAddress(r.reviewer)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={function () { onLikeReview(property.id, i) }}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: '12px', color: theme.textMuted, display: 'flex', alignItems: 'center', gap: '4px'
                      }}
                    >
                      👍 {Number(r.likes)}
                    </button>
                  </div>
                  <p style={{ fontSize: '13px', color: theme.text }}>{r.comment}</p>
                </div>
              )
            })
          )}
        </div>

        <div style={{ background: theme.inputBg, borderRadius: '10px', padding: '12px' }}>
          <div style={{ marginBottom: '8px' }}>
            {[1, 2, 3, 4, 5].map(function (s) {
              return (
                <span
                  key={s}
                  onClick={function () { setRating(s) }}
                  style={{ cursor: 'pointer', fontSize: '20px', color: s <= rating ? theme.amber : theme.border }}
                >
                  ★
                </span>
              )
            })}
          </div>
          <textarea
            value={comment}
            onChange={function (e) { setComment(e.target.value) }}
            placeholder="Write a review..."
            rows={2}
            style={{
              width: '100%', padding: '8px 10px', background: theme.surface,
              border: '1px solid ' + theme.border, borderRadius: '8px', color: theme.text,
              fontSize: '13px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', marginBottom: '8px'
            }}
          />
          <button
            type="button"
            onClick={function () {
              if (!comment.trim()) return
              onAddReview(property.id, rating, comment.trim())
              setComment('')
            }}
            disabled={loading}
            style={{
              width: '100%', height: '34px', background: theme.purple, color: '#fff',
              border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            Submit review
          </button>
        </div>

        <button
          type="button"
          onClick={handleClose}
          style={{
            width: '100%', height: '36px', marginTop: '14px',
            background: 'transparent', color: theme.textMuted,
            border: '1px solid ' + theme.border, borderRadius: '8px',
            fontSize: '12px', cursor: 'pointer'
          }}
        >
          Close
        </button>
      </div>
    </div>
  )
}