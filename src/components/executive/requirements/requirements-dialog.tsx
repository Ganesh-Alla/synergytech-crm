import { RequirementsActionDialog } from '@/components/executive/requirements/requirements-action-dialog'
import { RequirementsDeleteDialog } from '@/components/executive/requirements/requirements-delete-dialog'
import { useRequirementsDialog } from '@/store/dialogs/useRequirementsDialog'

export function RequirementsDialogs() {
  const { openDialog, setOpenDialog, currentRow, setCurrentRow } = useRequirementsDialog()

  return (
    <>
      <RequirementsActionDialog
        key='requirement-add'
        open={openDialog === 'AddRequirement'}
        onOpenChange={(open: boolean) => setOpenDialog(open ? 'AddRequirement' : null)}
      />

      {currentRow && (
        <>
          <RequirementsActionDialog
            key={`requirement-edit-${currentRow.id}`}
            open={openDialog === 'EditRequirement'}
            onOpenChange={(open: boolean) => {
              setOpenDialog(open ? 'EditRequirement' : null)
              if (!open) {
                setTimeout(() => {
                  setCurrentRow(null)
                }, 500)
              }
            }}
            currentRow={currentRow}
          />

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
        </>
      )}
    </>
  )
}
