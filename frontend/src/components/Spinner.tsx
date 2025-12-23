import './Spinner.css';

interface SpinnerProps {  className?: string;
  style?: React.CSSProperties;
}

export default function Spinner({ style }: SpinnerProps) {
  const containerStyle: React.CSSProperties = {
    ...style,
  };

  return (
    <div className="loading-more" style={containerStyle}>
        <div className="spinner"></div>
    </div>
  );
}
