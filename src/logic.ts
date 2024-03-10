
import xlsxPopulate from 'xlsx-populate';
import { PatchBody, PostBody, Store } from '.';

export const DATA_VALIDATION_MAP = {
  string: { type: 'textLength', formula1: '(val)=>typeof val === "string"' },
  double: { type: 'decimal', formula1: '(val)=>typeof val === "number" && val.toFixed()!=val' },
  int: { type: 'whole', formula1: '(val)=>typeof val === "number" && val.toFixed()==val' },
  boolean: {
    type: 'list', formula1: "(val)=>typeof val === 'boolean'"
  }
} as const;

type dataValidationKeys = keyof typeof DATA_VALIDATION_MAP;

const LOOPUP_REGEX = /^lookup\('[A-Z]\d+'\)$/i;

// Extract the types from the schemeV array=
const transfromTypeToDataValidtion = (type: dataValidationKeys) => DATA_VALIDATION_MAP[type] as any

const LOOKUP = (address: string) => (ws: xlsxPopulate.Sheet, visitedCells = new Set()) => {
  const currentCell = ws.cell(address);
  if (!currentCell.dataValidation()) {
    return ws.cell(address).value();
  }
  if (visitedCells.has(address)) {
    throw "Circular reference detected!";
  }
  visitedCells.add(address);
  return eval((currentCell.dataValidation() as any).formula1.toUpperCase())(ws, visitedCells)
}

const handleLookup = (lookupString: string, ws: xlsxPopulate.Sheet, cell: xlsxPopulate.Cell) => {
  const cellValue = eval(lookupString.toUpperCase())(ws)
  cell.dataValidation(lookupString.toUpperCase() as any)
  return cellValue
}




export const createSheet = async (body: PostBody, store: Store) => {
  const sheetID = store.currid.toString()
  store.currid = store.currid + 1
  const wb = await xlsxPopulate.fromBlankAsync()

  const ws = wb.sheet(0)
  body.columns.map((col, i) => {
    ws.cell(1, i + 1).value(col.name)
    ws.cell(1, i + 1).dataValidation(transfromTypeToDataValidtion(col.type as dataValidationKeys))
  })
  return await wb.toFileAsync(`public/${sheetID}.xlsx`)

}

export const setCell = async (id: string, body: PatchBody) => {
  const wb = await xlsxPopulate.fromFileAsync(`public/${id}.xlsx`)
  const ws = wb.sheet(0)

  const cell = ws.cell(`${body.column}${body.row}`)
  const validationCell = ws.cell(`${body.column}1`).dataValidation() as { type: string, formula1: string }

  const cellValue = (body.value.toUpperCase && (LOOPUP_REGEX.test(body.value.toUpperCase()))) ? handleLookup(body.value, ws, cell) : body.value

  if (eval(validationCell.formula1)(cellValue)) {
    cell.value(cellValue)
  } else {
    throw `data of typof ${typeof body.value} does not match ${validationCell.type}`
  }
  return wb.toFileAsync(`public/${id}.xlsx`)
}
