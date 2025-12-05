import { UsersActionDialog } from '@/components/admin/users/users-action-dialog'
import { UsersDeleteDialog } from '@/components/admin/users/users-delete-dialog'
import { useDialog } from '@/store/useDialog'

export function UsersDialogs() {
  const { openDialog, setOpenDialog, currentRow, setCurrentRow } = useDialog()

  return (
    <>
      <UsersActionDialog
        key='user-add'
        open={openDialog === 'AddUser'}
        onOpenChange={(open) => setOpenDialog(open ? 'AddUser' : null)}
      />

      {currentRow && (
        <>
          <UsersActionDialog
            key={`user-edit-${currentRow.id}`}
            open={openDialog === 'EditUser'}
            onOpenChange={(open) => {
              setOpenDialog(open ? 'EditUser' : null)
              if (!open) {
                setTimeout(() => {
                  setCurrentRow(null)
                }, 500)
              }
            }}
            currentRow={currentRow}
          />

          <UsersDeleteDialog
            key={`user-delete-${currentRow.id}`}
            open={openDialog === 'DeleteUser'}
            onOpenChange={(open) => {
              setOpenDialog(open ? 'DeleteUser' : null)
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
