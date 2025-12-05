import { LeadsActionDialog } from '@/components/executive/leads/leads-action-dialog'
import { LeadsDeleteDialog } from '@/components/executive/leads/leads-delete-dialog'
import { useLeadsDialog } from '@/store/useLeadsDialog'

export function LeadsDialogs() {
  const { openDialog, setOpenDialog, currentRow, setCurrentRow } = useLeadsDialog()

  return (
    <>
      <LeadsActionDialog
        key='lead-add'
        open={openDialog === 'AddLead'}
        onOpenChange={(open) => setOpenDialog(open ? 'AddLead' : null)}
      />

      {currentRow && (
        <>
          <LeadsActionDialog
            key={`lead-edit-${currentRow.id}`}
            open={openDialog === 'EditLead'}
            onOpenChange={(open) => {
              setOpenDialog(open ? 'EditLead' : null)
              if (!open) {
                setTimeout(() => {
                  setCurrentRow(null)
                }, 500)
              }
            }}
            currentRow={currentRow}
          />

          <LeadsDeleteDialog
            key={`lead-delete-${currentRow.id}`}
            open={openDialog === 'DeleteLead'}
            onOpenChange={(open) => {
              setOpenDialog(open ? 'DeleteLead' : null)
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
