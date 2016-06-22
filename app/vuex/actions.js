export const openFileDialog = makeAction('OPEN_FILE_DIALOG')
export const setTreeData = makeAction('SET_TREE_DATA')
export const updateFile = makeAction('UPDATE_FILE')
export const updateAllFiles = makeAction('UPDATE_ALL_FILES')
export const setFileStatus = makeAction('FILE_STATUS')
export const renameFile = makeAction('RENAME_FILE')
export const getFileContent = makeAction('GET_FILE')
export const updateCode = makeAction('UPDATE_CODE')
export const checkUpdate = makeAction('CHECK_UPDATE')
export const updateCodePosition = makeAction('UPDATE_CODE_POSITION')
export const setRootPath = makeAction('SET_ROOT_PATH')
export const mergeFiles = makeAction('MERGE_FILES')
export const generateFiles = makeAction('GENERATE_FILES')
export const compressFiles = makeAction('COMPRESS_FILES')

function makeAction (type) {
  return ({ dispatch }, ...args) => dispatch(type, ...args)
}
