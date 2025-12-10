import { VendorsActionDialog } from '@/components/executive/vendors/vendors-action-dialog'
import { VendorsDeleteDialog } from '@/components/executive/vendors/vendors-delete-dialog'
import { useVendorsDialog } from '@/store/dialogs/useVendorsDialog'

export function VendorsDialogs() {
  const { openDialog, setOpenDialog, currentRow, setCurrentRow } = useVendorsDialog()

  return (
    <>

      <VendorsActionDialog
        key='vendor-add'
        open={openDialog === 'AddVendor'}
        onOpenChange={(open) => setOpenDialog(open ? 'AddVendor' : null)}
      />

      {currentRow && (
        <>
          <VendorsActionDialog
            key={`vendor-edit-${currentRow.id}`}
            open={openDialog === 'EditVendor'}
            onOpenChange={(open) => {
              setOpenDialog(open ? 'EditVendor' : null)
              if (!open) {
                setTimeout(() => {
                  setCurrentRow(null)
                }, 500)
              }
            }}
            currentRow={currentRow}
          />

            <VendorsDeleteDialog
            key={`vendor-delete-${currentRow.id}`}
            open={openDialog === 'DeleteVendor'}
            onOpenChange={(open) => {
              setOpenDialog(open ? 'DeleteVendor' : null)
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
