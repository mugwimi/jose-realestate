import { useState } from 'react'

export default function ListPropertyForm({ onList, loading, theme }) {
  const [form, setForm] = useState({
    title: '', category: 'Residential', images: '',
    address: '', description: '', price: ''
  })

  function update(field, value) {
    setForm(function (f) { return { ...f, [field]: value } })
  }

  function handleSubmit(e) {
    e.preventDefault()
    onList(form)
    setForm({ title: '', category: 'Residential', images: '', address: '', description: '', price: '' })
  }

  const inputStyle = {
    width: '100%',
    height: '38px',
    padding: '0 12px',
    background: theme.inputBg,
    border: '1px solid ' + theme.border,
    borderRadius: '8px',
    color: theme.text,
    fontSize: '13px',
    outline: 'none'
  }

  const labelStyle = {
    fontSize: '12px',
    color: theme.textMuted,
    display: 'block',
    marginBottom: '5px'
  }

  return (
    <div style={{
      background: theme.surface,
      border: '1px solid ' + theme.border,
      borderRadius: '12px',
      padding: '1.25rem',
      marginBottom: '2rem'
    }}>
      <h3 style={{ fontSize: '14px', fontWeight: '500', color: theme.text, marginBottom: '14px' }}>
        List a property
      </h3>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
          <div>
            <label style={labelStyle}>Title</label>
            <input
              type="text" required value={form.title}
              onChange={function (e) { update('title', e.target.value) }}
              placeholder="Modern Villa" style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Category</label>
            <select
              value={form.category}
              onChange={function (e) { update('category', e.target.value) }}
              style={inputStyle}
            >
              <option>Residential</option>
              <option>Commercial</option>
              <option>Vacation</option>
              <option>Land</option>
              <option>Industrial</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label style={labelStyle}>Image URL</label>
          <input
            type="text" value={form.images}
            onChange={function (e) { update('images', e.target.value) }}
            placeholder="https://example.com/house.jpg" style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label style={labelStyle}>Address</label>
          <input
            type="text" required value={form.address}
            onChange={function (e) { update('address', e.target.value) }}
            placeholder="123 Main St, San Jose, CA" style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label style={labelStyle}>Description</label>
          <textarea
            required value={form.description} rows={3}
            onChange={function (e) { update('description', e.target.value) }}
            placeholder="Describe the property..."
            style={{ ...inputStyle, height: 'auto', padding: '10px 12px', resize: 'vertical', fontFamily: 'inherit' }}
          />
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Price (ETH)</label>
          <input
            type="text" required value={form.price}
            onChange={function (e) { update('price', e.target.value) }}
            placeholder="e.g. 10" style={inputStyle}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%', height: '40px',
            background: loading ? theme.border : theme.purple,
            color: '#fff', border: 'none', borderRadius: '8px',
            fontSize: '14px', fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Waiting for confirmation...' : 'List property'}
        </button>
      </form>
    </div>
  )
}