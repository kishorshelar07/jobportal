export default function ProfileCompletionRing({ percent = 0, size = 100, strokeWidth = 8 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = ((percent / 100) * circumference);
  const color = percent >= 80 ? '#16A34A' : percent >= 50 ? '#D97706' : '#1558D6';

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E2E8F0" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference - filled}
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
      <text
        x="50%" y="50%"
        textAnchor="middle" dominantBaseline="middle"
        style={{ fill: color, fontSize: size * 0.22, fontWeight: 800, fontFamily: 'var(--font-display)', transform: 'rotate(90deg)', transformOrigin: 'center' }}
      >
        {percent}%
      </text>
    </svg>
  );
}
