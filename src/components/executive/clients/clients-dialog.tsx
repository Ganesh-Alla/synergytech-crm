import { ClientsActionDialog } from '@/components/executive/clients/clients-action-dialog'
import { ClientsDeleteDialog } from '@/components/executive/clients/clients-delete-dialog'
import { useClientsDialog } from '@/store/useClientsDialog'

export function ClientsDialogs() {
  const { openDialog, setOpenDialog, currentRow, setCurrentRow } = useClientsDialog()

  return (
    <>
      <ClientsActionDialog
        key='client-add'
        open={openDialog === 'AddClient'}
        onOpenChange={(open) => setOpenDialog(open ? 'AddClient' : null)}
      />

      {currentRow && (
        <>
          <ClientsActionDialog
            key={`client-edit-${currentRow.id}`}
            open={openDialog === 'EditClient'}
            onOpenChange={(open) => {
              setOpenDialog(open ? 'EditClient' : null)
              if (!open) {
                setTimeout(() => {
                  setCurrentRow(null)
                }, 500)
              }
            }}
            currentRow={currentRow}
          />

          <ClientsDeleteDialog
            key={`client-delete-${currentRow.id}`}
            open={openDialog === 'DeleteClient'}
            onOpenChange={(open) => {
              setOpenDialog(open ? 'DeleteClient' : null)
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
