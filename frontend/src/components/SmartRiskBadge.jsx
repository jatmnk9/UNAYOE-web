import React from 'react';

export default function SmartRiskBadge({ risk }) {
  if (!risk) return null;

  const level = risk.risk_level || 'none';
  const map = {
    high: { bg: '#fee2e2', fg: '#b91c1c', label: 'ALERTA' },
    medium: { bg: '#fef3c7', fg: '#92400e', label: 'Atención' },
    low: { bg: '#e0f2fe', fg: '#075985', label: 'Leve' },
    none: { bg: '#ecfdf5', fg: '#065f46', label: 'OK' },
  };
  const style = map[level] || map.none;

  return (
    <span
      title={`Tristeza: ratio ${risk.ratio} • último ${risk.latest_sad_score} • máx ${risk.max_sad_score}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.25rem 0.6rem',
        borderRadius: '999px',
        fontSize: '0.85rem',
        fontWeight: 700,
        background: style.bg,
        color: style.fg,
        border: `1px solid ${style.fg}22`,
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: style.fg, display: 'inline-block' }} />
      {style.label}
    </span>
  );
}
