import { ExpensesActionDialog } from '@/components/executive/expenses/expenses-action-dialog'
import { ExpenseDeleteDialog } from '@/components/executive/expenses/expenses-delete-dialog'
import { useExpensesDialog } from '@/store/dialogs/useExpensesDialog'

export function ExpensesDialogs() {
  const { openDialog, setOpenDialog, currentRow, setCurrentRow } = useExpensesDialog()

  return (
    <>

      <ExpensesActionDialog
        key='expense-add'
        open={openDialog === 'AddExpense'}
        onOpenChange={(open) => setOpenDialog(open ? 'AddExpense' : null)}
      />

      {currentRow && (
        <>
            <ExpensesActionDialog
            key={`expense-edit-${currentRow.id}`}
            open={openDialog === 'EditExpense'}
            onOpenChange={(open) => {
              setOpenDialog(open ? 'EditExpense' : null)
              if (!open) {
                setTimeout(() => {
                  setCurrentRow(null)
                }, 500)
              }
            }}
            currentRow={currentRow}
          />

            <ExpenseDeleteDialog
            key={`expense-delete-${currentRow.id}`}
            open={openDialog === 'DeleteExpense'}
            onOpenChange={(open: boolean) => {
              setOpenDialog(open ? 'DeleteExpense' : null)
              if (!open) {
                setTimeout(() => {
                  setCurrentRow(null)
                }, 500)
              }
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
