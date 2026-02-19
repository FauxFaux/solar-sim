import type { ComponentChildren } from 'preact';

export function NumberInput({
  values: [value, setValue],
  children,
  unit,
}: {
  values: [number, (value: number) => void];
  children: ComponentChildren;
  unit: string;
}) {
  return (
    <div
      style={'padding-bottom: 1em'}
      onWheel={(e) => {
        e.preventDefault();
        const delta = Math.sign(e.deltaY || -e.deltaX) * 0.5;
        setValue(Math.max(0, value - delta));
      }}
    >
      <input
        type={'range'}
        min={0.4}
        max={Math.max(value, 21.6)}
        step={0.1}
        style={'width: 100%'}
        value={value}
        onChange={(e) => setValue(parseFloat(e.currentTarget.value))}
      />{' '}
      <div class={'miniflex'}>
        <div>
          <input
            type={'number'}
            min={0}
            step={0.1}
            value={value.toFixed(1)}
            onChange={(e) => setValue(parseFloat(e.currentTarget.value))}
            style={{
              width: '7ch',
            }}
          />{' '}
          {unit}
        </div>
        {children}
      </div>
    </div>
  );
}
