import type { ComponentChildren } from 'preact';

export function NumberInput({
  values: [value, setValue],
  children,
  unit,
  scrollMax,
  step,
}: {
  values: [number, (value: number) => void];
  children: ComponentChildren;
  unit: string;
  scrollMax: number;
  step: number;
}) {
  return (
    <div
      style={'padding-bottom: 1em'}
      onWheel={(e) => {
        e.preventDefault();
        // arbitrary speedup, yes it's the wrong way up, same as the graph though
        const delta = -Math.sign(e.deltaY || e.deltaX) * step * 4;
        setValue(Math.max(0, value - delta));
      }}
    >
      <input
        type={'range'}
        min={0}
        max={Math.max(value, scrollMax)}
        step={step}
        style={'width: 100%'}
        value={value}
        onChange={(e) => setValue(parseFloat(e.currentTarget.value))}
      />{' '}
      <div class={'miniflex'}>
        <div>
          <input
            type={'number'}
            min={0}
            step={step}
            value={value.toFixed(step > 1 ? 0 : 1)}
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
