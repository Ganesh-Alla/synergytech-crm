import { SalesOrderActionDialog } from '@/components/executive/sales/sales-action-dialog'
import { SalesOrderDeleteDialog } from '@/components/executive/sales/sales-delete-dialog'
import { useSalesDialog } from '@/store/dialogs/useSalesDialog'

export function SalesDialogs() {
  const { openDialog, setOpenDialog, currentRow, setCurrentRow } = useSalesDialog()

  return (
    <>

      <SalesOrderActionDialog
        key='sales-order-add'
        open={openDialog === 'AddSalesOrder'}
        onOpenChange={(open) => setOpenDialog(open ? 'AddSalesOrder' : null)}
      />

      {currentRow && (
        <>
          <SalesOrderActionDialog
            key={`vendor-edit-${currentRow.id}`}
            open={openDialog === 'EditSalesOrder'}
            onOpenChange={(open) => {
              setOpenDialog(open ? 'EditSalesOrder' : null)
              if (!open) {
                setTimeout(() => {
                  setCurrentRow(null)
                }, 500)
              }
            }}
            currentRow={currentRow}
          />

            <SalesOrderDeleteDialog
            key={`sales-order-delete-${currentRow.id}`}
            open={openDialog === 'DeleteSalesOrder'}
            onOpenChange={(open: boolean) => {
              setOpenDialog(open ? 'DeleteSalesOrder' : null)
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
