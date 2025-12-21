import { RequirementsDeleteDialog } from '@/components/executive/requirements/requirements-delete-dialog'
import { useRequirementsDialog } from '@/store/dialogs/useRequirementsDialog'

export function RequirementsDialogs() {
  const { openDialog, setOpenDialog, currentRow, setCurrentRow } = useRequirementsDialog()

  return (
    <>
      {currentRow && (
          <RequirementsDeleteDialog
            key={`requirement-delete-${currentRow.id}`}
            open={openDialog === 'DeleteRequirement'}
            onOpenChange={(open: boolean) => {
              setOpenDialog(open ? 'DeleteRequirement' : null)
              if (!open) {
                setTimeout(() => {
                  setCurrentRow(null)
                }, 500)
              }
            }}
            currentRow={currentRow}
          />
      )}
    </>
  )
}
