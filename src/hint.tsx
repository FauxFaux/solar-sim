import type { ComponentChildren } from 'preact';
import { FaCircleInfo } from 'react-icons/fa6';
import { useState } from 'preact/hooks';

export function Hint({ children }: { children: ComponentChildren }) {
  const [visible, setVisible] = useState(false);
  return (
    <div
      style={{
        display: 'inline-block',
        position: 'relative',
        fontWeight: 'normal',
      }}
    >
      <button
        onClick={() => setVisible((v) => !v)}
        style={{
          background: 'none',
          border: 'none',
          padding: '0.1em 0.5em',
          color: 'gray',
          cursor: 'pointer',
        }}
        aria-label="Toggle hint"
      >
        <FaCircleInfo />
      </button>
      {visible && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            background: '#343434',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '0.5em',
            marginTop: '0.5em',
            zIndex: 100,
            width: 'max-content',
            maxWidth: '300px',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
