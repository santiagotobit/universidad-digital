import type { ReactNode } from "react";

type ModalProps = {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

export function Modal({ title, isOpen, onClose, children }: ModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div role="dialog" aria-modal="true" aria-label={title}>
      <div className="card">
        <div>
          <strong>{title}</strong>
          <button className="button secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
