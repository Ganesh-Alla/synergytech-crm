import { QuotesActionDialog } from '@/components/executive/quotes/quotes-action-dialog'
import { useQuotesDialog } from '@/store/dialogs/useQuotesDialog'
import { QuotesDeleteDialog } from './quotes-delete-dialog'

export function QuotesDialogs() {
  const { openDialog, setOpenDialog, currentRow, setCurrentRow } = useQuotesDialog()

  return (
    <>

      <QuotesActionDialog
        key='quote-add'
        open={openDialog === 'AddQuote'}
        onOpenChange={(open) => setOpenDialog(open ? 'AddQuote' : null)}
      />

      {currentRow && (
        <>
          <QuotesActionDialog
            key={`quote-edit-${currentRow.id}`}
            open={openDialog === 'EditQuote'}
            onOpenChange={(open) => {
              setOpenDialog(open ? 'EditQuote' : null)
              if (!open) {
                setTimeout(() => {
                  setCurrentRow(null)
                }, 500)
              }
            }}
            currentRow={currentRow}
          />

            <QuotesDeleteDialog
            key={`quote-delete-${currentRow.id}`}
            open={openDialog === 'DeleteQuote'}
            onOpenChange={(open: boolean) => {
              setOpenDialog(open ? 'DeleteQuote' : null)
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
