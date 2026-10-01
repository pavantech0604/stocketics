import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
export function Badge({ children }: { children: React.ReactNode }) {
  const text = String(children);
  const tone = /Verified|Approved|Fulfilled|Converted|Completed|Active$/.test(text) ? 'green' : /Rejected|Overdue|Lost|Blocked|Failed/.test(text) ? 'red' : /Pending|Review|Submitted|Qualified|Allocate/.test(text) ? 'amber' : 'blue';
  return <span className={`crm-badge ${tone}`}>{children}</span>;
}
export function Empty({ title = 'Nothing here yet', detail = 'Records will appear here as your team works.' }: { title?: string; detail?: string }) {
  return <div className="crm-empty"><div className="crm-empty-mark">✓</div><h3>{title}</h3><p>{detail}</p></div>;
}
export function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="crm-field"><span>{label}</span>{children}</label>; }
export function Modal({ title, children, close, dirty = false, wide = false, savedRevision = 0 }: { title: string; children: React.ReactNode; close: () => void; dirty?: boolean; wide?: boolean; savedRevision?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const changed = useRef(false);
  const callbacks = useRef({ close, dirty });
  useEffect(() => { callbacks.current = { close, dirty }; });
  useEffect(() => { changed.current = false; }, [savedRevision]);
  const dismiss = () => { const current = callbacks.current; if (!current.dirty || !changed.current || window.confirm('Discard unsaved changes?')) current.close(); };
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    const el = ref.current; el?.focus();
    const previousOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
    const key = (e: KeyboardEvent) => {
      const dialogs = document.querySelectorAll('[role="dialog"]');
      if (dialogs[dialogs.length - 1] !== el) return;
      if (e.key === 'Escape') { e.preventDefault(); dismiss(); }
      if (e.key === 'Tab' && el) {
        const nodes = [...el.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href]')];
        const first = nodes[0], last = nodes[nodes.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === el)) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('keydown', key); document.body.style.overflow = previousOverflow; previous?.focus(); };
  }, []);
  return <div className="crm-overlay"><div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} onChangeCapture={() => { changed.current = true; }} className={`crm-modal ${wide ? 'wide' : ''}`}><header><h2>{title}</h2><button type="button" aria-label="Close dialog" onClick={dismiss}><X size={20} /></button></header>{children}</div></div>;
}
export function date(value?: string) { return value ? new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—'; }
