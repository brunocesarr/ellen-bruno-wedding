import type {
  ExpenseWithStatus,
  InstallmentStatus,
} from '@/src/application/use-cases/expenses/list-expenses.use-case'
import { formatBytes, formatCurrencyBRL } from '@/src/lib/format'
import {
  toExpenseDocumentViewModel,
  type ExpenseDocumentViewModel,
} from './expense-document.view-model'

export type InstallmentViewModel = {
  id: string
  dueDate: string
  dueDateLabel: string
  amount: number
  amountLabel: string
  paidAmount: number
  paidAmountLabel: string
  paidBy: string | null
  status: InstallmentStatus
  isOverdue: boolean
  documents: ExpenseDocumentViewModel[]
}

export type ExpenseStatus = 'quitado' | 'parcial' | 'pendente'

export type ExpenseViewModel = {
  id: string
  description: string
  totalAmount: number
  totalAmountLabel: string
  paidTotal: number
  paidTotalLabel: string
  outstanding: number
  outstandingLabel: string
  status: ExpenseStatus
  installments: InstallmentViewModel[]
  contracts: ExpenseDocumentViewModel[]
  looseProofs: ExpenseDocumentViewModel[]
  documentCount: number
  documentsSizeBytes: number
  documentsSizeLabel: string
}

const dueDateLabel = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('pt-BR')

function overallStatus(
  installments: { status: InstallmentStatus }[]
): ExpenseStatus {
  if (installments.every((i) => i.status === 'paid')) return 'quitado'
  if (installments.some((i) => i.status !== 'pending')) return 'parcial'
  return 'pendente'
}

export function toExpenseViewModel(e: ExpenseWithStatus): ExpenseViewModel {
  return {
    id: e.id,
    description: e.description,
    totalAmount: e.totalAmount,
    totalAmountLabel: formatCurrencyBRL(e.totalAmount),
    paidTotal: e.paidTotal,
    paidTotalLabel: formatCurrencyBRL(e.paidTotal),
    outstanding: e.outstanding,
    outstandingLabel: formatCurrencyBRL(e.outstanding),
    status: overallStatus(e.installments),
    contracts: e.contracts.map(toExpenseDocumentViewModel),
    looseProofs: e.looseProofs.map(toExpenseDocumentViewModel),
    documentCount:
      e.contracts.length +
      e.looseProofs.length +
      e.installments.reduce((s, i) => s + i.documents.length, 0),
    documentsSizeBytes: e.documentsSizeBytes,
    documentsSizeLabel: formatBytes(e.documentsSizeBytes),
    installments: e.installments.map((i) => ({
      id: i.id,
      dueDate: i.dueDate,
      dueDateLabel: dueDateLabel(i.dueDate),
      amount: i.amount,
      amountLabel: formatCurrencyBRL(i.amount),
      paidAmount: i.paidAmount,
      paidAmountLabel: formatCurrencyBRL(i.paidAmount),
      paidBy: i.paidBy,
      status: i.status,
      isOverdue: i.isOverdue,
      documents: i.documents.map(toExpenseDocumentViewModel),
    })),
  }
}
