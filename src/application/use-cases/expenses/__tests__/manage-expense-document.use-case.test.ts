import { UnauthenticatedError } from '@/src/entities/errors/auth'
import { ValidationError } from '@/src/entities/errors/common'
import {
  ExpenseDocumentNotFoundError,
  ExpenseDocumentsQuotaExceededError,
  ExpenseNotFoundError,
} from '@/src/entities/errors/expenses'
import { EXPENSE_DOCUMENTS_STORAGE_BUDGET_BYTES } from '@/src/lib/constants'
import { describe, expect, it, vi } from 'vitest'
import {
  deleteExpenseDocumentUseCase,
  getExpenseDocumentUrlUseCase,
  uploadExpenseDocumentUseCase,
} from '../manage-expense-document.use-case'

const EXPENSE_ID = '11111111-1111-4111-8111-111111111111'
const INSTALLMENT_ID = '22222222-2222-4222-8222-222222222222'
const OTHER_INSTALLMENT_ID = '33333333-3333-4333-8333-333333333333'
const DOCUMENT_ID = '44444444-4444-4444-8444-444444444444'

const expense = {
  id: EXPENSE_ID,
  description: 'Buffet',
  totalAmount: 100,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  installments: [
    {
      id: INSTALLMENT_ID,
      dueDate: '2026-01-01',
      amount: 100,
      paidAmount: 0,
      paidBy: null,
    },
  ],
}

const storedDocument = {
  id: DOCUMENT_ID,
  expenseId: EXPENSE_ID,
  installmentId: null,
  kind: 'contract' as const,
  filePath: 'expenses/a/contract.pdf',
  fileName: 'contrato.pdf',
  mimeType: 'application/pdf',
  sizeBytes: 1000,
  createdAt: new Date('2026-01-01'),
}

const deps = ({
  user = { id: 'u1' } as unknown,
  used = 0,
  found = expense as unknown,
  document = storedDocument as unknown,
} = {}) => ({
  expenseDocumentsRepo: {
    list: vi.fn(),
    getById: vi.fn().mockResolvedValue(document),
    create: vi.fn(async (d: unknown) => ({
      ...(d as object),
      id: DOCUMENT_ID,
      createdAt: new Date('2026-01-01'),
    })),
    delete: vi.fn(),
    totalSizeBytes: vi.fn().mockResolvedValue(used),
  },
  expensesRepo: { getById: vi.fn().mockResolvedValue(found) },
  documentStorageRepo: {
    remove: vi.fn(),
    createSignedUrl: vi.fn().mockResolvedValue('https://signed.example/x'),
  },
  authService: { getCurrentUser: vi.fn().mockResolvedValue(user) },
})

const validInput = (overrides: Record<string, unknown> = {}) => ({
  expenseId: EXPENSE_ID,
  installmentId: null,
  kind: 'payment_proof',
  filePath: 'expenses/a/proof.webp',
  fileName: 'comprovante.webp',
  mimeType: 'image/webp',
  sizeBytes: 50_000,
  ...overrides,
})

describe('uploadExpenseDocumentUseCase', () => {
  it('throws when there is no session', async () => {
    await expect(
      uploadExpenseDocumentUseCase(deps({ user: null }) as never)(validInput())
    ).rejects.toBeInstanceOf(UnauthenticatedError)
  })

  it('rejects an unknown kind', async () => {
    await expect(
      uploadExpenseDocumentUseCase(deps() as never)(
        validInput({ kind: 'invoice' })
      )
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('rejects a contract pinned to a parcela', async () => {
    await expect(
      uploadExpenseDocumentUseCase(deps() as never)(
        validInput({ kind: 'contract', installmentId: INSTALLMENT_ID })
      )
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('throws when the expense does not exist', async () => {
    await expect(
      uploadExpenseDocumentUseCase(deps({ found: null }) as never)(validInput())
    ).rejects.toBeInstanceOf(ExpenseNotFoundError)
  })

  it('rejects a parcela belonging to another expense', async () => {
    await expect(
      uploadExpenseDocumentUseCase(deps() as never)(
        validInput({ installmentId: OTHER_INSTALLMENT_ID })
      )
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('refuses to write past the storage budget', async () => {
    const d = deps({ used: EXPENSE_DOCUMENTS_STORAGE_BUDGET_BYTES - 1 })

    await expect(
      uploadExpenseDocumentUseCase(d as never)(validInput({ sizeBytes: 1000 }))
    ).rejects.toBeInstanceOf(ExpenseDocumentsQuotaExceededError)

    expect(d.expenseDocumentsRepo.create).not.toHaveBeenCalled()
  })

  it('persists a valid comprovante tied to a parcela', async () => {
    const d = deps()
    await uploadExpenseDocumentUseCase(d as never)(
      validInput({ installmentId: INSTALLMENT_ID })
    )

    expect(d.expenseDocumentsRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        expenseId: EXPENSE_ID,
        installmentId: INSTALLMENT_ID,
        kind: 'payment_proof',
      })
    )
  })

  it('treats an empty installmentId as "no parcela"', async () => {
    const d = deps()
    await uploadExpenseDocumentUseCase(d as never)(
      validInput({ installmentId: '' })
    )

    const payload = d.expenseDocumentsRepo.create.mock.calls[0]?.[0] as {
      installmentId: string | null
    }
    expect(payload.installmentId).toBeNull()
  })
})

describe('deleteExpenseDocumentUseCase', () => {
  it('throws when there is no session', async () => {
    await expect(
      deleteExpenseDocumentUseCase(deps({ user: null }) as never)(DOCUMENT_ID)
    ).rejects.toBeInstanceOf(UnauthenticatedError)
  })

  it('throws when the document does not exist', async () => {
    await expect(
      deleteExpenseDocumentUseCase(deps({ document: null }) as never)(
        DOCUMENT_ID
      )
    ).rejects.toBeInstanceOf(ExpenseDocumentNotFoundError)
  })

  it('removes both the row and the stored bytes', async () => {
    const d = deps()
    await deleteExpenseDocumentUseCase(d as never)(DOCUMENT_ID)

    expect(d.expenseDocumentsRepo.delete).toHaveBeenCalledWith(DOCUMENT_ID)
    expect(d.documentStorageRepo.remove).toHaveBeenCalledWith(
      storedDocument.filePath
    )
  })

  it('still resolves when the storage removal fails', async () => {
    const d = deps()
    d.documentStorageRepo.remove.mockRejectedValue(new Error('storage down'))

    await expect(
      deleteExpenseDocumentUseCase(d as never)(DOCUMENT_ID)
    ).resolves.toBeUndefined()
  })
})

describe('getExpenseDocumentUrlUseCase', () => {
  it('throws when there is no session', async () => {
    await expect(
      getExpenseDocumentUrlUseCase(deps({ user: null }) as never)(DOCUMENT_ID)
    ).rejects.toBeInstanceOf(UnauthenticatedError)
  })

  it('signs the stored path', async () => {
    const d = deps()
    const result = await getExpenseDocumentUrlUseCase(d as never)(DOCUMENT_ID)

    expect(d.documentStorageRepo.createSignedUrl).toHaveBeenCalledWith(
      storedDocument.filePath,
      expect.any(Number)
    )
    expect(result).toEqual({
      url: 'https://signed.example/x',
      fileName: 'contrato.pdf',
    })
  })
})
