import React from 'react';
interface BadgeProps {
  status: 'New' | 'Transfer';
}
export function Badge({ status }: BadgeProps) {
  const isNew = status === 'New';
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isNew ? 'bg-status-new/10 text-status-new' : 'bg-status-transfer/10 text-status-transfer'}`}>
      
      {status}
    </span>);

}