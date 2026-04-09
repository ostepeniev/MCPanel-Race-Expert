'use client';

const STATUS_CONFIG = {
  new:              { label: 'Новий',              color: 'blue' },
  awaiting_payment: { label: 'Очікування оплати',  color: 'yellow' },
  agreement:        { label: 'Погодження',          color: 'purple' },
  production:       { label: 'Виробництво',         color: 'orange' },
  returned:         { label: 'Повернуто складом',   color: 'red' },
  delivery:         { label: 'Доставка',            color: 'green' },
  done:             { label: 'Виконано',            color: 'green' },
  paid:             { label: 'Оплачено',            color: 'green' },
  unpaid:           { label: 'Не оплачено',         color: 'red' },
  cod:              { label: 'Післяплата',           color: 'yellow' },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { label: status, color: 'muted' };

  return (
    <span className={`badge badge-${config.color}`}>
      <span className="badge-dot" />
      {config.label}
    </span>
  );
}

export function DelayIndicator({ hours }) {
  let colorClass = '';
  let label = '';

  if (hours > 168) {
    colorClass = 'delay-120h';
    label = '7+ діб';
  } else if (hours > 120) {
    colorClass = 'delay-120h';
    label = `${Math.floor(hours / 24)} діб`;
  } else if (hours > 96) {
    colorClass = 'delay-96h';
    label = `${Math.floor(hours / 24)} діб`;
  } else if (hours > 72) {
    colorClass = 'delay-72h';
    label = `${Math.floor(hours / 24)} діб`;
  } else if (hours > 48) {
    colorClass = 'delay-48h';
    label = `${Math.floor(hours / 24)} діб`;
  } else if (hours > 24) {
    colorClass = 'delay-24h';
    label = `${Math.floor(hours / 24)} діб`;
  }

  return (
    <span className={colorClass} style={{ fontWeight: 600, fontSize: '0.8125rem' }}>
      {label}
    </span>
  );
}
