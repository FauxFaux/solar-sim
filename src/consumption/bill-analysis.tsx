import type { UrlState } from '../url-handler.tsx';
import { andThen, type Result, type State } from '../ts.ts';
import { useEffect, useState } from 'preact/hooks';
import { BillView } from './bill-view.tsx';
import { parseBill, type ParsedBill } from './bill.ts';

export function BillAnalysis({ uss }: { uss: State<UrlState> }) {
  const [file, setFile] = useState<File | undefined>(undefined);
  const [parsed, setParsed] = useState<Result<ParsedBill> | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!file) return;
    andThen(async () => parseBill(await file.text()), setParsed);
  }, [file]);

  return (
    <div>
      <h3>Bill analysis</h3>
      <p>
        <input
          type={'file'}
          accept={'text/csv'}
          onChange={(e) => setFile(e.currentTarget.files?.[0])}
        />
      </p>
      <p>
        {parsed?.success ? <BillView bill={parsed.value} /> : 'No file loaded'}
      </p>
    </div>
  );
}
